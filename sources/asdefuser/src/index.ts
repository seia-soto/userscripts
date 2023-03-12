import * as asKit from 'adshield-defuser';
import * as cache from './__generated__/cache.js';

const useDisableMethod = (root: unknown, name: string, callback?: (...args: any[]) => any) => {
	// @ts-expect-error Not sure what is `root` at all
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const original = root[name];
	let isDisabled = true;

	Object.defineProperty(root, name, {
		get() {
			if (callback) {
				callback();
			}

			if (isDisabled) {
				throw new TypeError(`${name} is not a function`);
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return original;
		},
	});

	return () => {
		isDisabled = !isDisabled;
	};
};

const useDocumentReady = async (document: Document) => {
	if (document.readyState !== 'loading') {
		return true;
	}

	return new Promise(resolve => {
		document.addEventListener('readystatechange', () => {
			resolve(true);
		});
	});
};

const usePayload = async (pre?: HTMLScriptElement) => {
	console.debug('html:pre');

	let script = pre;

	if (!script) {
		console.debug('html:post');

		await useDocumentReady(document);

		const post: HTMLScriptElement = document.querySelector('script[data]:not([data=""])')!;

		script = post;
	}

	if (!script) {
		console.debug('html:live');

		const response = await fetch('/index.html');
		const content = await response.text();

		const div = document.createElement('div');
		div.innerHTML = content;

		const live: HTMLScriptElement = div.querySelector('script[data]:not([data=""])')!;

		script = live;
	}

	if (!script) {
		throw new Error('DEFUSER_TARGET_NOT_FOUND');
	}

	const binary = script.getAttribute('data');
	const source = script.getAttribute('src');

	if (!binary) {
		throw new Error('DEFUSER_TARGET_DATA_NOT_FOUND');
	}

	try {
		console.debug('bin:cached');

		return asKit.getDecoded(binary, cache.source);
	} catch (e) {
		console.debug('bin:cached', e);
	}

	if (!source) {
		throw new Error('DEFUSER_TARGET_SOURCE_NOT_FOUND');
	}

	console.debug('bin:live');

	const response = await fetch(source);
	const content = await response.text();

	return asKit.getDecoded(binary, content);
};

const restoreV1 = (entries: ReturnType<typeof asKit['getDecoded']>['details']) => {
	console.debug('restore:v1');

	let failed = 0;

	for (const entry of entries) {
		try {
			const node = document.querySelector(`#${entry.id}`);

			if (!node) {
				continue;
			}

			node.before(entry.text);
			node.remove();
		} catch (error) {
			console.debug('restore:v1 error=', error);

			failed++;
		}
	}

	console.debug(`restore:v1 total=${entries.length} failed=${failed}`);
};

const bootstrap = async (pre?: HTMLScriptElement) => {
	const payload = await usePayload(pre);

	console.debug('payload', payload);

	if (payload.meta.version?.wireType !== asKit.ProtobufWireTypes.Uint32) {
		throw new Error('DEFUSER_UNSUPPORTED_PAYLOAD_VERSION');
	}

	await useDocumentReady(document);

	switch (payload.meta.version.value) {
		case 1: {
			restoreV1(payload.details);

			break;
		}

		default: {
			throw new Error('DEFUSER_UNSUPPORTED_PAYLOAD_VERSION');
		}
	}
};

(() => {
	useDisableMethod(window, '__SENTRY_BROWSER_BUNDLE__');

	const pre: HTMLScriptElement = document.querySelector('script[data]:not([data=""])')!;

	void bootstrap(pre);
})();
