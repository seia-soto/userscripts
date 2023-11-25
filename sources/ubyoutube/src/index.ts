import {isSubFrame} from './utils';

type YtAdProperties = {
	adPlacements: Array<Record<string, unknown>>;
	adSlots: Array<Record<string, unknown>>;
};

type YtWindow = typeof window & {
	ytInitialPlayerResponse: YtAdProperties;
};

if (isSubFrame()) {
	throw new Error('UBYOUTUBE_SUBFRAME_FOUND');
}

const playerWindow = window as YtWindow;

const resetPropertyDependsOnType = (obj: Record<string, unknown>, key: string) => {
	if (typeof obj[key] === 'undefined') {
		return obj;
	}

	if (typeof obj[key] === 'boolean') {
		obj[key] = false;
	}

	if (Array.isArray(obj[key])) {
		obj[key] = [];
	}

	return obj;
};

const pruneAdProperties = (obj: unknown) => {
	if (typeof obj !== 'object') {
		return obj;
	}

	// @ts-expect-error optional
	if (typeof obj?.playerResponse === 'object') {
		// @ts-expect-error optional
		obj.playerResponse = pruneAdProperties(obj.playerResponse);
	}

	// @ts-expect-error optional
	if (typeof obj?.responseContext === 'object') {
		// @ts-expect-error optional
		obj.responseContext = pruneAdProperties(obj.responseContext);
	}

	// @ts-expect-error optional
	resetPropertyDependsOnType(obj, 'adPlacements');
	// @ts-expect-error optional
	resetPropertyDependsOnType(obj, 'playerAds');
	// @ts-expect-error optional
	resetPropertyDependsOnType(obj, 'adSlots');

	console.debug('pruneAdProperties', obj);

	return obj;
};

const proxyYtInitialPlayerResponse = () => {
	if (typeof playerWindow.ytInitialPlayerResponse === 'undefined') {
		console.debug('ytInitialPlayerResponse is not defined');

		return;
	}

	console.debug('proxy ytInitialPlayerResponse.{adPlacements,adSlots}');

	playerWindow.ytInitialPlayerResponse.adPlacements = new Proxy(playerWindow.ytInitialPlayerResponse.adPlacements, {
		get(_target, _p, _receiver) {
			console.debug('get ytInitialPlayerResponse.adPlacements');

			return [];
		},
	});
	playerWindow.ytInitialPlayerResponse.adSlots = new Proxy(playerWindow.ytInitialPlayerResponse.adSlots, {
		get(_target, _p, _receiver) {
			console.debug('get ytInitialPlayerResponse.adSlots');

			return [];
		},
	});
};

const proxyJsonParse = () => {
	console.debug('proxy JSON.parse');

	playerWindow.JSON.parse = new Proxy(playerWindow.JSON.parse, {
		apply(target, thisArg, argArray) {
			return pruneAdProperties(Reflect.apply(target, thisArg, argArray)) as unknown;
		},
	});

	console.debug('proxy Response.prototype.json');

	playerWindow.Response.prototype.json = new Proxy(playerWindow.Response.prototype.json, {
		async apply(target, thisArg, argArray) {
			const altHandle = async () => pruneAdProperties(await Reflect.apply(target, thisArg, argArray)) as unknown;

			return altHandle();
		},
	});
};

const subscribeElements = (videoCallback: (video: HTMLVideoElement) => unknown) => {
	videoCallback(document.querySelector('video')!);

	const observer = new MutationObserver(records => {
		for (const record of records) {
			for (const node of record.addedNodes) {
				if (node instanceof HTMLVideoElement) {
					console.debug('subscribeVideoPlayer found new video node');

					videoCallback(node);
				}
			}
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
};

const subscribePlaybackEvent = (video: HTMLVideoElement, cb: (video: HTMLVideoElement) => unknown) => {
	video.addEventListener('play', () => {
		cb(video);
	});

	if (!video.paused) {
		cb(video);
	}
};

const skipAdContainer = async (video: HTMLVideoElement) => {
	const scrubber = document.querySelector('.ytp-scrubber-container>div');

	if (!scrubber) {
		throw new Error('UBYOUTUBE_SCRUBBER_NOT_FOUND');
	}

	if (!getComputedStyle(scrubber).backgroundColor.includes('255, 204')) {
		console.debug('skipAdContainer valid color signature not found');

		return;
	}

	console.debug('skipAdContainer set={muted,currentTime} apply=play');

	video.muted = true;
	video.currentTime = video.duration - 0.1;

	const onEnd = () => {
		video.muted = false;

		console.debug('skipAdContainer click skip button');

		const button: HTMLButtonElement = document.querySelector('button.ytp-ad-skip-button-modern.ytp-button')!;

		button?.click();
	};

	video.addEventListener('ended', onEnd);

	await video.play();
};

console.debug('ubyoutube installed');

proxyYtInitialPlayerResponse();
proxyJsonParse();

subscribeElements(video => {
	subscribePlaybackEvent(video, skipAdContainer);
});
