import * as asKit from 'adshield-defuser/out/loaders/baseshower.js';
import {createDebug, documentReady} from '../utils.js';

const debug = createDebug('[asdefuser:baseshower]');

const extract = async () => {
	let data: string | undefined;

	const useSelector = () => {
		const target: HTMLScriptElement = document.querySelector('script[data]:not([data=""])')!;

		if (target) {
			const dataProperty = target.getAttribute('data');

			if (dataProperty) {
				data = dataProperty;
			}
		}
	};

	debug('html:pre');
	useSelector();

	if (!data) {
		await documentReady(document);

		debug('html:post');
		useSelector();
	}

	if (!data) {
		throw new Error('DEFUSER_BASESHOWER_TARGET_NOT_FOUND');
	}

	return asKit.decode(data);
};

const restore = (source: ReturnType<typeof asKit.decode>) => {
	debug('restore', JSON.stringify(source));

	let failed = 0;

	for (const entry of source) {
		try {
			if (asKit.isTag(entry)) {
				document.head.insertAdjacentHTML('beforeend', entry.tags);

				continue;
			}

			if (asKit.isText(entry)) {
				const node = document.getElementById(entry.text_id);

				if (!node) {
					continue;
				}

				node.before(entry.text_value);
				node.remove();

				continue;
			}
		} catch (error) {
			debug('restore:v1 error=', error);

			failed++;
		}
	}

	debug(`restore total=${source.length} failed=${failed}`);
};

export const baseshower = async () => {
	const payload = await extract();

	debug('payload', payload);

	await documentReady(document);

	restore(payload);
};
