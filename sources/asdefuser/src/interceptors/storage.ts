import {createDebug, isAsSource} from '../utils';

const debug = createDebug('[asdefuser:storageInterceptor]');

export const interceptStorage = () => {
	localStorage.removeItem('as_profile_cache');
	localStorage.removeItem('adshield-analytics-uuid');

	Storage.prototype.setItem = new Proxy(Storage.prototype.setItem, {
		apply(target, thisArg, argArray) {
			const [key] = argArray as [string, string];

			if (isAsSource()) {
				debug('prevented storage set request of key=' + key);

				throw new DOMException('QuotaExceededError');
			}

			return Reflect.apply(target, thisArg, argArray) as unknown;
		},
	});
};
