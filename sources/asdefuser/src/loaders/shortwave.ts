import * as asKit from 'adshield-defuser/out/loaders/shortwave.js';
import {useDebug, useDisableMethod, useDocumentReady} from '../utils.js';
import * as cache from '../__generated__/shortwave.cache.js';

const debug = useDebug('[asdefuser:shortwave]');

const extract = async (pre?: HTMLScriptElement) => {
	debug('html:pre');

	let script = pre;

	if (!script) {
		debug('html:post');

		await useDocumentReady(document);

		const post: HTMLScriptElement = document.querySelector('script[data]:not([data=""])')!;

		script = post;
	}

	if (!script) {
		debug('html:live');

		const response = await fetch('');
		const content = await response.text();

		const div = document.createElement('div');
		div.innerHTML = content;

		const live: HTMLScriptElement = div.querySelector('script[data]:not([data=""])')!;

		script = live;
	}

	if (!script) {
		throw new Error('DEFUSER_SHORTWAVE_TARGET_NOT_FOUND');
	}

	const binary = script.getAttribute('data');
	const source = script.getAttribute('src');

	if (!binary) {
		throw new Error('DEFUSER_SHORTWAVE_TARGET_DATA_NOT_FOUND');
	}

	try {
		debug('bin:cached');

		return asKit.getDecoded(binary, cache.source);
	} catch (e) {
		debug('bin:cached', e);
	}

	if (!source) {
		throw new Error('DEFUSER_SHORTWAVE_TARGET_SOURCE_NOT_FOUND');
	}

	debug('bin:live');

	const response = await fetch(source);
	const content = await response.text();

	return asKit.getDecoded(binary, content);
};

const restoreV1 = (entries: ReturnType<typeof asKit['getDecoded']>['details']) => {
	debug('restore:v1');

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
			debug('restore:v1 error=', error);

			failed++;
		}
	}

	debug(`restore:v1 total=${entries.length} failed=${failed}`);
};

export const shortwave = async () => {
	const switchSentryFlag = useDisableMethod(window, '__SENTRY_BROWSER_BUNDLE__', () => {
		switchSentryFlag();
	});

	const pre: HTMLScriptElement = document.querySelector('script[data]:not([data=""])')!;
	const payload = await extract(pre);

	debug('payload', payload);

	if (payload.meta.version?.wireType !== asKit.ProtobufWireTypes.Uint32) {
		throw new Error('DEFUSER_SHORTWAVE_UNSUPPORTED_PAYLOAD_VERSION');
	}

	await useDocumentReady(document);

	switch (payload.meta.version.value) {
		case 1: {
			restoreV1(payload.details);

			break;
		}

		default: {
			throw new Error('DEFUSER_SHORTWAVE_UNSUPPORTED_PAYLOAD_VERSION');
		}
	}
};
