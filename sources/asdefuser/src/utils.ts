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

const isSafari = navigator.userAgent.includes('Safari') && navigator.userAgent.includes(') Version/');

export const getStackTrace = () => {
	const e = new Error();

	if (!e.stack) {
		throw new Error('Stack trace is not available!');
	}

	const href = location.origin + location.pathname;

	if (isSafari) {
		const trace = e.stack.split('\n');
		const stack: string[] = [];

		for (const line of trace) {
			const start = line.indexOf('@') + 1;
			const lastColon = line.lastIndexOf(':');
			const dump = lastColon < 0 ? line.slice(start) : line.slice(start, line.lastIndexOf(':', lastColon - 1));

			if (dump.startsWith('[')) {
				continue;
			}

			stack.push(dump);
		}

		return stack;
	}

	// Not Apple
	const trace = e.stack.slice(6).split('\n');
	const stack: string[] = [];

	for (const line of trace) {
		const dump = line.slice(
			(line.indexOf('(') + 1) || line.indexOf('at') + 3,
			line.lastIndexOf(':', line.lastIndexOf(':') - 1),
		);

		if (
			dump.startsWith('<')
			|| href === dump
		) {
			continue;
		}

		stack.push(dump);
	}

	return stack;
};

export type FeedbackFunction = () => unknown;

const isAsCall = (line: string) => line.includes('/script.min.js') || line.includes('loader.min.js');

const isInlineCall = (line: string, fullpath: string) => line === fullpath;

export const isAsSource: FeedbackFunction = () => {
	const stack = getStackTrace();

	if (
		stack[0].startsWith('https://local.adguard.org/')
		|| stack[0].startsWith('webkit')
		|| stack[0].startsWith('chrome')
	) {
		return;
	}

	const fullpath = location.origin + location.pathname;
	const report = stack.map(line => {
		if (isInlineCall(line, fullpath)) {
			return 1;
		}

		if (isAsCall(line)) {
			return 2;
		}

		return 0;
	});

	const firstPositive = report.indexOf(2);

	if (firstPositive < 0) {
		return;
	}

	if (report.slice(0, firstPositive).reduce<number>((state, test) => state + test, 0) === firstPositive) {
		debug('isAsSource stack=dumped', stack);

		return true;
	}

	if (report.reduce<number>((state, test) => state + test, 0) === report.length * 2) {
		debug('isAsSource stack=clean', stack);

		return true;
	}
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const makeProxy = <F extends Function>(f: F, feedback: FeedbackFunction) => {
	const proxy = new Proxy(f, {
		apply(target, thisArg, argArray) {
			const alt = feedback();

			if (typeof alt === 'undefined') {
				return Reflect.apply(target, thisArg, argArray) as F;
			}

			debug(`makeProxy name=${f?.name} args=`, argArray);

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
