export const createDebug = (namespace: string) => new Proxy(console.debug, {
	apply(target, thisArg, argArray) {
		Reflect.apply(target, thisArg, [`${namespace} (${location.href})`, ...argArray as unknown[]]);
	},
});

const debug = createDebug('[asdefuser:__utils__]');

export const isSubFrame = () => {
	try {
		return window.self !== window.top;
	} catch (_error) {
		return true;
	}
};

export const getSourceFromStackTraceLine = (line: string) => {
	const protocolEndAt = line.indexOf('//');

	if (protocolEndAt < 0) {
		return '';
	}

	const endAt = line.indexOf(':', protocolEndAt);

	if (endAt < 0) {
		return '';
	}

	const source = line.slice(protocolEndAt + 2, endAt);

	return source;
};

export const getCaller = () => {
	try {
		throw new Error('feedback');
	} catch (error: unknown) {
		if (!(error instanceof Error) || !error.stack) {
			return {
				source: '',
				stack: '',
			};
		}

		const lastBreak = error.stack.lastIndexOf('\n');
		const source = getSourceFromStackTraceLine(error.stack.slice(lastBreak));

		return {
			source,
			stack: error.stack,
		} as const;
	}
};

export type FeedbackFunction = (caller: ReturnType<typeof getCaller>) => unknown;

export const isAsSource: FeedbackFunction = caller => {
	if (caller.source.length + caller.stack.length === 0) {
		debug('isAsSource caller information is not available');

		return;
	}

	if (caller.source.includes(location.host)) {
		return;
	}

	if (caller.source.includes('script.min.js') || caller.source.includes('loader.min.js')) {
		debug(`isAsSource caller=${caller.source}`);

		return true;
	}
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const makeProxy = <F extends Function>(f: F, feedback: (caller: ReturnType<typeof getCaller>) => unknown) => {
	const proxy = new Proxy(f, {
		apply(target, thisArg, argArray) {
			const caller = getCaller();
			const alt = feedback(caller);

			if (typeof alt === 'undefined') {
				return Reflect.apply(target, thisArg, argArray) as F;
			}

			debug(`makeProxy name=${f?.name ?? '(anon)'} caller=${caller.source}`);

			return alt;
		},
	});

	return proxy;
};

export const documentReady = async (document: Document) => {
	if (document.readyState !== 'loading') {
		return true;
	}

	return new Promise(resolve => {
		document.addEventListener('readystatechange', () => {
			resolve(true);
		});
	});
};
