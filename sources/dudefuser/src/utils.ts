export const createDebug = (namespace: string) => new Proxy(console.debug, {
	apply(target, thisArg, argArray) {
		Reflect.apply(target, thisArg, [`${namespace}`, ...argArray as unknown[]]);
	},
});

export const isFirefox = navigator.userAgent.includes('Firefox/');

// eslint-disable-next-line @typescript-eslint/ban-types
export const makeProxy = <F extends Function>(f: F, name = f.name) => {
	const proxy = new Proxy(f, {
		apply(target, thisArg, argArray) {
			return null;
		},
		setPrototypeOf(target, v) {
			return false;
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

export const generateYyyyMmDd = (date: Date) => {
	let str = date.getFullYear().toString();

	str += (date.getMonth() + 1).toString().padStart(2, '0');
	str += (date.getDate()).toString().padStart(2, '0');

	return str;
};
