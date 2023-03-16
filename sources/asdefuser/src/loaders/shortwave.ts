import * as asKit from 'adshield-defuser/out/loaders/shortwave.js';
import {useDebug, useDisableMethod, useDocumentReady} from '../utils.js';
import * as cache from '../__generated__/shortwave.cache.js';

const debug = useDebug('[asdefuser:shortwave]');

const extract = async () => {
	let source: {
		script: string;
		data: string;
	} | undefined;

	const useSelector = () => {
		const target: HTMLScriptElement = document.querySelector('script[data]:not([data=""])')!;

		if (target) {
			const script = target.getAttribute('src');
			const data = target.getAttribute('data');

			if (script && data) {
				source = {
					script,
					data,
				};
			}
		}
	};

	debug('html:pre');
	useSelector();

	if (!source) {
		await useDocumentReady(document);

		debug('html:post');
		useSelector();
	}

	if (!source) {
		debug('html:live');

		const response = await fetch('');
		const html = await response.text();
		const match = /<script[ \w"=/-]+ src="([\w:/.-]+)" data="([\w_-]+)">/.exec(html);

		if (match && match.length === 2) {
			const [, script, data] = match;

			source = {
				script,
				data,
			};
		}
	}

	if (!source) {
		throw new Error('DEFUSER_SHORTWAVE_TARGET_NOT_FOUND');
	}

	try {
		debug('bin:cached');

		return asKit.getDecoded(source.data, cache.source);
	} catch (e) {
		debug('bin:cached', e);
	}

	if (!source) {
		throw new Error('DEFUSER_SHORTWAVE_TARGET_SOURCE_NOT_FOUND');
	}

	debug('bin:live');

	const response = await fetch(source.script);
	const content = await response.text();

	return asKit.getDecoded(source.data, content);
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
	// @ts-expect-error __SENTRY_BROWSER_BUNDLE__ is used in their source
	useDisableMethod(window, '__SENTRY_BROWSER_BUNDLE__');
	useDisableMethod(window, 'atob');

	const payload = await extract();

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
