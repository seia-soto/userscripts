import {basera1n} from './loaders/basera1n';
import {shortwave} from './loaders/shortwave';
import {useDisableMethod} from './utils';

(() => {
	useDisableMethod(window, 'XMLHttpRequest');
	useDisableMethod(window, 'fetch');

	// Mitigate in loose environments
	useDisableMethod(Element.prototype, 'remove');
	useDisableMethod(Element.prototype, 'removeChild');
	useDisableMethod(Element.prototype, 'attachShadow');

	void basera1n();
	void shortwave();
})();
