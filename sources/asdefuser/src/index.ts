import {basera1n} from './loaders/basera1n';
import {shortwave} from './loaders/shortwave';
import {useDisableMethod} from './utils';

(() => {
	useDisableMethod(window, 'XMLHttpRequest');
	useDisableMethod(window, 'fetch');

	void basera1n();
	void shortwave();
})();
