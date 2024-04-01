import {isAdShieldCall} from '../adshield/validators.js';
import {config} from '../config.js';
import {generateCallStack} from './call-stack.js';
import {createDebug} from './logger.js';
import {protectDescriptors, secret} from './secret.js';

const debug = createDebug('storage');

export const protectStorageApis = () => {
	protectDescriptors(window.Storage.prototype, 'setItem', new Proxy(Storage.prototype.setItem, {
		apply(target, thisArg, argArray) {
			const [key, value, givenSecret] = argArray as [string, string, string];

			if (
				isAdShieldCall()
        || (key.startsWith('asdf') && givenSecret !== secret)
			) {
				debug('- apply name=Storage.prototype.setItem', 'args=', argArray, 'stack=', generateCallStack());

				return false;
			}

			if (config.debug) {
				debug('+ apply name=Storage.prototype.setItem', 'args=', argArray, 'stack=', generateCallStack());
			}

			Reflect.apply(target, thisArg, [key, value]);
		},
	}));
	protectDescriptors(window.Storage.prototype, 'removeItem', new Proxy(Storage.prototype.removeItem, {
		apply(target, thisArg, argArray) {
			const [key, givenSecret] = argArray as [string, string];

			if (
				isAdShieldCall()
        || (key.startsWith('asdf') && givenSecret !== secret)
			) {
				debug('- apply name=Storage.prototype.removeItem', 'args=', argArray, 'stack=', generateCallStack());

				return false;
			}

			if (config.debug) {
				debug('+ apply name=Storage.prototype.removeItem', 'args=', argArray, 'stack=', generateCallStack());
			}

			Reflect.apply(target, thisArg, [key]);
		},
	}));
	protectDescriptors(window.Storage.prototype, 'clear');
};

export const pull = (key: string): string | undefined =>
// @ts-expect-error secret is used to validate internal calls
	localStorage.getItem('asdf-' + key, secret);

export const push = (key: string, value: string): void => {
	// @ts-expect-error secret is used to validate internal calls
	localStorage.setItem('asdf-' + key, value, secret);
};
