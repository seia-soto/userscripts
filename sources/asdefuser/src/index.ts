import {interceptNetwork} from './interceptors/network.js';
import {interceptStorage} from './interceptors/storage.js';
import {basedrop} from './loaders/basedrop.js';
import {tinywave} from './loaders/ztinywave.js';
import {disableMethod, isSubFrame} from './utils.js';

const bootstrap = () => {
	interceptNetwork();
	interceptStorage();
	disableMethod(Element.prototype, 'remove');
	disableMethod(Element.prototype, 'removeChild');
	disableMethod(Element.prototype, 'append');
	disableMethod(Element.prototype, 'appendChild');
	disableMethod(Element.prototype, 'insertBefore');
	disableMethod(Element.prototype, 'attachShadow');
	disableMethod(Function.prototype, 'call');
	disableMethod(document, 'createElement');
	disableMethod(window, 'postMessage');
	disableMethod(window, 'Event');

	if (isSubFrame()) {
		return;
	}

	void tinywave();
	void basedrop();
};

bootstrap();
