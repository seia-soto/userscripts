export const useDisableMethod = (root: unknown, name: string, callback?: (...args: any[]) => any) => {
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

export const useDebug = (namespace: string) => new Proxy(console.debug, {
	apply(target, thisArg, argArray) {
		Reflect.apply(target, thisArg, [namespace, ...argArray as unknown[]]);
	},
});
