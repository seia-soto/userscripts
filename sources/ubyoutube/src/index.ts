import {documentReady, isSubFrame} from './utils';

if (isSubFrame()) {
	throw new Error('UBYOUTUBE_SUBFRAME_FOUND');
}

const subscribeElements = (videoCallback: (video: HTMLVideoElement) => unknown) => {
	let video = document.querySelector('video');

	if (video) {
		console.debug('subscribeElements found HTMLVideoElement observed=false', video);

		videoCallback(video);
	}

	const observer = new MutationObserver(_records => {
		const next = document.querySelector('video');

		if (next && video !== next) {
			console.debug('subscribeElements found HTMLVideoElement observed=true', video);

			video = next;

			videoCallback(next);
		}
	});

	observer.observe(document.documentElement || document.body, {
		childList: true,
		subtree: true,
	});

	console.debug('subscribeElements started observasion');
};

const subscribePlaybackEvent = (video: HTMLVideoElement, cb: (video: HTMLVideoElement) => unknown) => {
	video.addEventListener('play', () => {
		cb(video);
	});

	if (!video.paused) {
		cb(video);
	}
};

const isAdContainerPresent = () => {
	const scrubber = document.querySelector('.ytp-scrubber-container>div');

	if (!scrubber) {
		return;
	}

	return getComputedStyle(scrubber).backgroundColor.includes('255, 204');
};

const trySkipButton = () => {
	const button: HTMLButtonElement = document.querySelector('button.ytp-ad-skip-button-modern.ytp-button')!;

	if (button) {
		console.debug('trySkipButton', button);

		button.click();

		return true;
	}

	return false;
};

const skipAdContainer = async (video: HTMLVideoElement) => new Promise<number>(resolve => {
	if (!isAdContainerPresent()) {
		console.debug('skipAdContainer valid color signature not found');

		resolve(0);

		return;
	}

	if (trySkipButton()) {
		resolve(2);

		return;
	}

	console.debug('skipAdContainer set={muted,currentTime}');

	video.muted = true;
	video.currentTime = video.duration - 0.1;

	const onEnd = () => {
		video.muted = false;

		trySkipButton();
		resolve(video.duration);
	};

	video.addEventListener('ended', onEnd);

	console.debug('skipAdContainer apply=play');

	void video.play();
});

console.debug('ubyoutube installed');

void documentReady(document).then(() => {
	subscribeElements(video => {
		let lock = false;

		subscribePlaybackEvent(video, async () => {
			if (lock) {
				return;
			}

			lock = true;

			while (isAdContainerPresent()) {
				// eslint-disable-next-line no-await-in-loop
				await skipAdContainer(video);
			}

			lock = false;
		});
	});
});
