import * as asKit from 'adshield-defuser/out/loaders/basera1n.js';
import {useDebug, useDisableMethod, useDocumentReady} from '../utils.js';

const debug = useDebug('[asdefuser:basera1n]');

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
		throw new Error('DEFUSER_BASERA1N_TARGET_NOT_FOUND');
	}

	const binary = script.getAttribute('data');

	if (!binary) {
		throw new Error('DEFUSER_BASERA1N_TARGET_DATA_NOT_FOUND');
	}

	return asKit.decode(binary);
};

const restore = (source: string) => {
	debug('restore');

	const data = JSON.parse(source) as {
		api: {
			'/ads/bid': string;
			'/ads/opt-out': string;
			'/analytics/adb': string;
			'/analytics/ads': string;
			'/log': string;
			'/negotiate/dummy-image': string;
			data: {
				'/negotiate/dummy-image/rgb': string;
			};
		};
		hostages: Array<{
			id: string;
			text: string;
		}>;
		inventories: Array<{
			id: string;
			width: number;
			height: number;
			position: {
				selector: string;
				'position-rule': string;
				'insert-rule': Array<{
					rule: string;
					value: string;
				}>;
			};
			'original-ads': Array<{
				selector: string;
			}>;
			attributes: Array<{
				key: string;
				value: string;
			}>;
		}>;
	};

	let failed = 0;

	for (const entry of data.hostages) {
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

	debug(`restore total=${data.hostages.length} failed=${failed}`);
};

export const basera1n = async () => {
	const switchAtob = useDisableMethod(window, 'atob', () => {
		switchAtob();
	});

	const pre: HTMLScriptElement = document.querySelector('script[data]:not([data=""])')!;
	const payload = await extract(pre);

	debug('payload', payload);

	await useDocumentReady(document);

	restore(payload);
};
