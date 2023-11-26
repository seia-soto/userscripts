export const createDebug = (namespace: string) => new Proxy(console.debug, {
	apply(target, thisArg, argArray) {
		Reflect.apply(target, thisArg, [`${namespace}`, ...argArray as unknown[]]);
	},
});

const debug = createDebug('[asdefuser:__utils__]');

// Making a reference object is much more safer than using a rng
export const secret = {};

export const isSubFrame = () => {
	try {
		return window.self !== window.top;
	} catch (_error) {
		return true;
	}
};

export const getCallStack = () => {
	const e = new Error();

	if (!e.stack) {
		throw new Error('Stack trace is not available!');
	}

	if (e.stack.includes('@')) {
		const raw = e.stack.split('\n').slice(2);
		const trace: string[] = [];

		if (navigator.userAgent.includes('Firefox/')) {
			raw.splice(-1, 1);
		}

		for (const line of raw) {
			const start = line.indexOf('@') + 1;
			const lastColon = line.lastIndexOf(':');
			const dump = lastColon < 0 ? line.slice(start) : line.slice(start, line.lastIndexOf(':', lastColon - 1));

			trace.push(dump);
		}

		return {
			trace,
			raw,
		};
	}

	const raw = e.stack.slice(6).split('\n').slice(2);
	const trace: string[] = [];

	for (const line of raw) {
		const dump = line.slice(
			(line.indexOf('(') + 1) || line.indexOf('at') + 3,
			line.lastIndexOf(':', line.lastIndexOf(':') - 1),
		);

		trace.push(dump);
	}

	return {
		trace,
		raw,
	};
};

export type FeedbackFunction = (callStack?: ReturnType<typeof getCallStack>) => boolean;

let gotAsCall = false;

const isAsCall = (line: string) => {
	if (line.endsWith('/script.min.js') || line.endsWith('/loader.min.js')) {
		gotAsCall = true;

		return gotAsCall;
	}

	return false;
};

const isAnonCall = (line: string) => line.startsWith('[') || line.startsWith('<');

export const isAsSource: FeedbackFunction = (callStack = getCallStack()) => {
	const {trace} = callStack;
	const lastIndex = trace.length - 1;

	if (
		trace[lastIndex].startsWith('chrome-')
		|| trace[lastIndex].startsWith('webkit-')
		|| trace[lastIndex].startsWith('moz-')
	) {
		return false;
	}

	// Check last index
	if (isAsCall(trace[lastIndex])) {
		return true;
	}

	// Explicit checks for loose environments
	// We'll refactor this code with something like `buildTestSuite` with array of tests, so we can counteract to multiple patterns
	if (gotAsCall && navigator.vendor === 'Apple Computer, Inc.') {
		const fullpath = location.origin + location.pathname;

		if (trace[lastIndex] !== fullpath) {
			return false;
		}

		let checkDirectAsCallSigIter = lastIndex;

		while (checkDirectAsCallSigIter--) {
			if (
				!isAnonCall(trace[checkDirectAsCallSigIter])
				&& trace[checkDirectAsCallSigIter] !== fullpath
			) {
				// No additional checks, so we return immediately
				return false;
			}
		}

		return true;
	}

	return false;
};

export const isAsSourceFull: FeedbackFunction = (callStack = getCallStack()) => {
	const {trace} = callStack;
	const lastIndex = trace.length - 1;

	if (
		trace[lastIndex].startsWith('chrome-')
		|| trace[lastIndex].startsWith('webkit-')
		|| trace[lastIndex].startsWith('moz-')
	) {
		return false;
	}

	for (const line of trace) {
		if (isAsCall(line)) {
			return true;
		}
	}

	return false;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const makeProxy = <F extends Function>(f: F, name = f.name) => {
	const proxy = new Proxy(f, {
		apply(target, thisArg, argArray) {
			const callStack = getCallStack();
			const positive = isAsSource(callStack);

			if (positive && !argArray.includes(secret)) {
				debug(`apply name=${name} argArray=`, argArray, 'stack=', callStack.raw);

				throw new Error('asdefuser');
			}

			return Reflect.apply(target, thisArg, argArray) as F;
		},
		// Prevent ruining the call stack with "explicit" checks
		set(target, p, newValue, receiver) {
			const callStack = getCallStack();
			const positive = isAsSourceFull(callStack);

			if (positive) {
				debug(`set name=${name} stack=`, callStack.raw);

				throw new Error('asdefuser');
			}

			return Reflect.set(target, p, newValue, receiver);
		},
		setPrototypeOf(target, v) {
			const callStack = getCallStack();
			const positive = isAsSourceFull(callStack);

			if (positive) {
				debug(`setPrototypeOf name=${name} stack=`, callStack.raw);

				throw new Error('asdefuser');
			}

			return Reflect.setPrototypeOf(target, v);
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
