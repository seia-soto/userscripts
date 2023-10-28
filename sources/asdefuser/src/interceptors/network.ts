import {isAsSource, createDebug, disableMethod, swapMethod} from '../utils';

const debug = createDebug('[asdefuser:networkInterceptor]');

export const interceptNetwork = () => {
	disableMethod(window, 'fetch');
	swapMethod(window, 'XMLHttpRequest', (Original: new () => XMLHttpRequest, _root, name, caller) => {
		if (!isAsSource(name, caller)) {
			return false;
		}

		return new Proxy(Original, {
			construct(target, argArray, newTarget) {
				const xhr = Reflect.construct(target, argArray, newTarget) as XMLHttpRequest;

				xhr.open = (method: string, url: string) => {
					debug(`XMLHttpRequest:open:null ${method} ${url}`);
				};

				xhr.send = () => {
					debug('XMLHttpRequest:send:null');
				};

				return xhr;
			},
		});
	});
};
