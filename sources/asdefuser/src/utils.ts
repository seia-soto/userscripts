export const useDebug = (namespace: string) => new Proxy(console.debug, {
	apply(target, thisArg, argArray) {
		Reflect.apply(target, thisArg, [`${namespace} (${location.href})`, ...argArray as unknown[]]);
	},
});

const debug = useDebug('[asdefuser:__utils__]');

export const useCaller = () => {
	try {
		throw new Error('feedback');
	} catch (error: unknown) {
		if (!(error instanceof Error) || !error.stack) {
			throw new Error('Failed to validate feedback function or stack trace is not available!');
		}

		let self = '';

		for (const line of error.stack.split('\n').slice(1)) {
			const protocolEndAt = line.indexOf('//');

			if (protocolEndAt < 0) {
				continue;
			}

			const endAt = line.indexOf(':', protocolEndAt);

			if (endAt < 0) {
				continue;
			}

			const source = line.slice(protocolEndAt + 2, endAt);

			if (!self) {
				self = source;

				continue;
			}

			if (source === self) {
				continue;
			}

			return source;
		}

		return error.stack;
	}
};

export const useAsSourceFeedback = (name: string, caller: string) => {
	if (!caller.includes(location.host) && caller.includes('script.min.js')) {
		debug(`useAsSourceFeedback name=${name} caller=${caller}`);

		return true;
	}

	return false;
};

type PermitableAsRoot = Record<PropertyKey, unknown> | (Window & typeof globalThis);

export const createMethodHookEntries = (): Array<{root: PermitableAsRoot; name: PropertyKey}> => [];

const __useSwapMethodEntries = createMethodHookEntries();

export const useSwapMethod = <Root extends PermitableAsRoot>(
	root: Root,
	name: keyof Root,
	feedback: (name: string, caller: string) => false | Root[keyof Root],
) => {
	for (const entry of __useSwapMethodEntries) {
		if (entry.root === root && entry.name === name) {
			debug(`useSwapMethod name=${name.toString()} duplicated=true`);

			return;
		}
	}

	let target = root[name];

	Object.defineProperty(root, name, {
		get() {
			if (typeof feedback !== 'function') {
				return target;
			}

			const useSwap = feedback(name.toString(), useCaller());

			if (!useSwap) {
				return target;
			}

			return useSwap;
		},
		set(v: Root[keyof Root]) {
			if (typeof feedback === 'function' && feedback(name.toString(), useCaller())) {
				target = v;
			}
		},
	});

	__useSwapMethodEntries.push({
		root,
		name,
	});

	debug(`useSwapMethod name=${name.toString()}`);
};

export const useDisableMethod = <Root extends PermitableAsRoot>(
	root: Root,
	name: keyof Root,
	feedback: (name: string, caller: string) => boolean = useAsSourceFeedback,
) => {
	useSwapMethod(root, name, (name, caller) => {
		let shouldDisable = true;

		if (typeof feedback === 'function') {
			shouldDisable = feedback(name, caller);
		}

		if (shouldDisable) {
			throw new TypeError(`${name} is not a function`);
		}

		return false;
	});
};

export const useDocumentReady = async (document: Document) => {
	if (document.readyState !== 'loading') {
		return true;
	}

	return new Promise(resolve => {
		document.addEventListener('readystatechange', () => {
			resolve(true);
		});
	});
};
