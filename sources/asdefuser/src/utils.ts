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
			throw new Error('Invalid Error instance found');
		}

		const lastBreak = error.stack.lastIndexOf('\n');
		const source = getSourceFromStackTraceLine(error.stack.slice(lastBreak));

		return {
			source,
			stack: error.stack,
		} as const;
	}
};

export const isAsSource = (name: string, caller: ReturnType<typeof getCaller>) => {
	if (!caller) {
		return false;
	}

	if (caller.source.includes(location.host)) {
		return false;
	}

	if (caller.source.includes('script.min.js') || caller.source.includes('loader.min.js')) {
		debug(`isAsSource name=${name} caller=${caller.source}`);

		return true;
	}

	return false;
};

export const swapMethod = <Root, Key extends keyof Root>(
	root: Root,
	name: Key,
	feedback: (original: Root[Key], root: Root, name: string, caller: ReturnType<typeof getCaller>) => unknown,
) => {
	let target = root[name];

	Object.defineProperty(root, name, {
		get() {
			if (typeof feedback !== 'function') {
				return target;
			}

			const caller = getCaller();
			const swapWith = feedback(target, root, name.toString(), caller);

			if (swapWith === false) {
				return target;
			}

			debug(`swapMethod name=${name.toString()} caller=${caller.source}`);

			return swapWith;
		},
		set(v: Root[Key]) {
			if (typeof feedback === 'function' && feedback(target, root, name.toString(), getCaller()) === false) {
				target = v;
			}
		},
	});

	debug(`swapMethod name=${name.toString()}`);
};

export const disableMethod = <Root>(
	root: Root,
	name: keyof Root,
	feedback: (name: string, caller: ReturnType<typeof getCaller>) => boolean = isAsSource,
) => {
	swapMethod(root, name, (_original, _root, name, caller) => {
		let shouldDisable = true;

		if (typeof feedback === 'function') {
			shouldDisable = feedback(name, caller);
		}

		return shouldDisable;
	});
};

export const disableMethodGlobally = <Root>(
	root: Root,
	name: keyof Root,
) => {
	swapMethod(root, name, () => true);
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
