import {useNetworkInterceptor} from './interceptors/network.js';
import {basera1n} from './loaders/basera1n.js';
import {baseshower} from './loaders/baseshower.js';
import {shortwave} from './loaders/shortwave.js';
import {useDisableMethod, useIsSubframe} from './utils.js';

const bootstrap = () => {
	useNetworkInterceptor();
	useDisableMethod(Element.prototype, 'remove');
	useDisableMethod(Element.prototype, 'removeChild');
	useDisableMethod(Element.prototype, 'append');
	useDisableMethod(Element.prototype, 'appendChild');
	useDisableMethod(Element.prototype, 'insertBefore');
	useDisableMethod(Element.prototype, 'attachShadow');
	useDisableMethod(document, 'createElement');

	if (useIsSubframe()) {
		return;
	}

	void shortwave();
	void baseshower();
	void basera1n();
};

bootstrap();
