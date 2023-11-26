import {isAsSource, makeProxy} from '../utils';

export const interceptNetwork = () => {
	window.fetch = makeProxy(fetch, 'fetch');

	window.XMLHttpRequest = new Proxy(XMLHttpRequest, {
		construct(target, argArray, newTarget) {
			if (isAsSource()) {
				return {};
			}

			return Reflect.construct(target, argArray, newTarget) as XMLHttpRequest;
		},
	});
};
