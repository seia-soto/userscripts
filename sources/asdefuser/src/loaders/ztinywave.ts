import * as cache from '../__generated__/ztinywave.cache.js';
import {secret} from '../secret.js';
import {createDebug, documentReady, getRandomAdShieldHost} from '../utils.js';

type Data = Array<{tags: string}>;

const debug = createDebug('[asdefuser:tinywave]');

const decode = (payload: string) => {
	const id = payload.slice(0, 4);
	const key = cache.source.find(store => store.id === id);

	if (!key) {
		throw new Error('DEFUSER_TINYWAVE_KEY_NOT_FOUND');
	}

	const ra = String.fromCharCode(key.reserved1);
	const rb = String.fromCharCode(key.reserved2);

	const unwrap = (input: string, output: string, char: string) => {
		const index = output.indexOf(char);

		if (index >= 0) {
			return input[index];
		}

		return char;
	};

	let mode = 0;

	const data = payload
		.slice(4)
		.split('')
		.map(char => {
			if (!mode) {
				if (char === ra) {
					mode = 1;

					return '';
				}

				if (char === rb) {
					mode = 2;

					return '';
				}
			}

			if (mode === 1) {
				mode = 0;

				if (key.reserved1Output.includes(char)) {
					return unwrap(key.reserved1Input, key.reserved1Output, char);
				}

				return unwrap(key.input, key.output, char) + char;
			}

			if (mode === 2) {
				mode = 0;

				if (key.reserved2Output.includes(char)) {
					return unwrap(key.reserved2Input, key.reserved2Output, char);
				}

				return unwrap(key.input, key.output, char) + char;
			}

			return unwrap(key.input, key.output, char);
		})
		.join('');

	return JSON.parse(data) as Data;
};

const restore = (data: Data) => {
	debug('restore');

	let failed = 0;

	const far: {
		createdAt: number;
		tags: string[];
	} = {
		createdAt: Date.now(),
		tags: [],
	};

	for (const entry of data) {
		try {
			if (entry.tags) {
				if (/href=['"]resources:\/\/.+['"]/.test(entry.tags)) {
					const [, endpoint] = /href=['"]resources:\/\/(.+)['"]/.exec(entry.tags)!;
					const url = 'https://' + getRandomAdShieldHost() + '/resources/' + endpoint + '?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiIiwiZW1haWwiOiIiLCJleHAiOjE3MTE3OTAwNTIsImlhdCI6MTcxMTcwMzY1Mn0.27MjdPtrJN6BA7y2TWNPypwO_ipROd-bCk0eq4LFzTQ';

					void (async () => {
						const response = await fetch(url);
						const text = await response.text();

						if (!text) {
							return;
						}

						far.tags.push(`<style>${text}</style>`);

						// @ts-expect-error asdf-protected
						localStorage.setItem('asdf-protected-far', JSON.stringify(far), secret);
					})();

					entry.tags = `<link rel="stylesheet" href="${url}">`;
				}

				document.head.insertAdjacentHTML('beforeend', entry.tags);
			}
		} catch (error) {
			debug('restore error=', error);

			failed++;
		}
	}

	debug(`restore total=${data.length} failed=${failed}`);
};

const extract = async () => {
	let source: {
		script: string;
		data: string;
	} | undefined;

	const pick = () => {
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

	pick();

	if (!source) {
		await documentReady(document);

		pick();
	}

	if (!source) {
		throw new Error('DEFUSER_SHORTWAVE_TARGET_NOT_FOUND');
	}

	return decode(source.data);
};

export const tinywave = async () => {
	try {
		// @ts-expect-error asdf-protected
		const resource = localStorage.getItem('asdf-protected-far', secret);

		if (resource) {
			const data = JSON.parse(resource) as {createdAt: number; tags: string[]};

			if (JSON.stringify(data.tags) !== '[""]' && Date.now() - data.createdAt < 1000 * 60 * 60 * 24 * 30) {
				debug('far loaded', data);

				for (const tag of data.tags) {
					document.head.insertAdjacentHTML('beforeend', tag);
				}

				return;
			}

			debug('far expired');
		}
	} catch (e) {
		debug('failed to initialise far', e);
	}

	const payload = await extract();

	debug('payload', payload);

	restore(payload);
};
