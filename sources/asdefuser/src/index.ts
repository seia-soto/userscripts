import {adShieldCallAnalyzer, knownAdShieldOrigins} from './call-validators/analyzers.js';
import {adShieldOriginCheck, adShieldStrictCheck} from './call-validators/suites.js';
import {basedrop} from './loaders/basedrop.js';
import {tinywave} from './loaders/ztinywave.js';
import {isAdShieldObj} from './obj-validators/index.js';
import {secret} from './secret.js';
import {documentReady, getCallStack, makeProxy} from './utils.js';

const bootstrap = () => {
	Element.prototype.remove = makeProxy(Element.prototype.remove, 'Element.prototype.remove');
	Element.prototype.removeChild = makeProxy(Element.prototype.removeChild, 'Element.prototype.removeChild');
	Element.prototype.insertAdjacentHTML = makeProxy(Element.prototype.insertAdjacentHTML, 'Element.prototype.insertAdjacentHTML');

	// Scripting
	Element.prototype.setAttribute = makeProxy(Element.prototype.setAttribute, 'Element.prototype.setAttribute');
	HTMLScriptElement.prototype.setAttribute = new Proxy(HTMLScriptElement.prototype.setAttribute, {
		apply(target, thisArg, argArray: [string, string]) {
			if (argArray[0] === 'src' && typeof argArray[1] === 'string') {
				if (adShieldCallAnalyzer.analyze(argArray[1])) {
					return;
				}
			}

			Reflect.apply(target, thisArg, argArray);
		},
		setPrototypeOf(_target, _v) {
			return false;
		},
	});

	EventTarget.prototype.addEventListener = makeProxy(EventTarget.prototype.addEventListener, 'EventTarget.prototype.addEventListener');
	// Prevent messaging to inline
	MessagePort.prototype.postMessage = makeProxy(MessagePort.prototype.postMessage, 'MessagePort.prototype.postMessage');
	document.createElement = makeProxy(document.createElement, 'document.createElement');
	// Prevent useless timer apis for performance
	window.setInterval = makeProxy(setInterval, 'setInterval');
	window.setTimeout = makeProxy(setTimeout, 'setInterval');

	window.decodeURIComponent = new Proxy(decodeURIComponent, {
		apply(target, thisArg, argArray: [string]) {
			const payload = Reflect.apply(target, thisArg, argArray);

			for (const domain of knownAdShieldOrigins) {
				if (payload.includes(domain)) {
					return '';
				}
			}

			return payload;
		},
	});

	// Local Storage
	localStorage.removeItem('as_profile_cache');
	localStorage.removeItem('adshield-analytics-uuid');

	Storage.prototype.getItem = new Proxy(Storage.prototype.getItem, {
		apply(target, thisArg, argArray) {
			const [key] = argArray as [string, string];

			if (key.startsWith('asdf-protected-') && argArray[1] !== secret) {
				throw new DOMException('QuotaExceededError');
			}

			return Reflect.apply(target, thisArg, argArray) as unknown;
		},
	});

	Storage.prototype.removeItem = new Proxy(Storage.prototype.removeItem, {
		apply(target, thisArg, argArray) {
			const [key] = argArray as [string, string];

			if (key.startsWith('asdf-protected-') && argArray[1] !== secret) {
				throw new DOMException('QuotaExceededError');
			}

			return Reflect.apply(target, thisArg, argArray) as unknown;
		},
	});

	Storage.prototype.setItem = new Proxy(Storage.prototype.setItem, {
		apply(target, thisArg, argArray) {
			const [key] = argArray as [string, string, string];

			if (adShieldStrictCheck(getCallStack()) || key.startsWith('as_') || key.startsWith('as-') || key.includes('adshield')) {
				throw new DOMException('QuotaExceededError');
			}

			if (key.startsWith('asdf-protected-') && argArray[2] !== secret) {
				throw new DOMException('QuotaExceededError');
			}

			return Reflect.apply(target, thisArg, argArray) as unknown;
		},
	});

	// Network/XHR
	window.fetch = makeProxy(fetch, 'fetch');
	window.XMLHttpRequest = new Proxy(XMLHttpRequest, {
		construct(target, argArray, newTarget) {
			if (adShieldStrictCheck(getCallStack())) {
				return {};
			}

			return Reflect.construct(target, argArray, newTarget) as XMLHttpRequest;
		},
	});

	// Error prototype
	window.Error = new Proxy(Error, {
		set() {
			throw new Error('Overriding Error is not allowed!');
		},
		setPrototypeOf() {
			throw new Error('Overriding prototype of Error is not allowed!');
		},
	});

	if (navigator.vendor.includes('Apple')) {
		// Deserialization
		JSON.parse = new Proxy(JSON.parse, {
			apply(target, thisArg, argArray) {
				const obj = Reflect.apply(target, thisArg, argArray) as unknown;

				if (adShieldOriginCheck(getCallStack()) || isAdShieldObj(obj)) {
					return null;
				}

				return obj;
			},
			set() {
				throw new Error('Overriding JSON.parse is not allowed!');
			},
		});

		void documentReady(document).then(() => {
			// Remove already created ad elements
			for (const el of document.querySelectorAll('iframe[src="about:blank"]')) {
				el.remove();
			}

			const observer = new MutationObserver(records => {
				for (const record of records) {
					for (const node of record.addedNodes) {
						if (node instanceof HTMLIFrameElement && node.getAttribute('src') === 'about:blank') {
							node.remove();
						}
					}
				}
			});

			observer.observe(document.documentElement ?? document.body, {
				childList: true,
				subtree: true,
			});

			document.head.insertAdjacentHTML('afterbegin', '<style>iframe[src="about:blank"]{display:none!important}</style>');
		});
	}

	void basedrop();
	void tinywave();
};

bootstrap();
