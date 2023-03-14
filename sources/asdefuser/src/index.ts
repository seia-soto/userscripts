import {basera1n} from './loaders/basera1n';
import {shortwave} from './loaders/shortwave';

(() => {
	void Promise.allSettled([
		basera1n(),
		shortwave(),
	]);
})();
