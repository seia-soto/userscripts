import {interceptNetwork} from './interceptors/network.js';
import {baseshower} from './loaders/baseshower.js';
import {shortwave} from './loaders/shortwave.js';
import {tinywave} from './loaders/ztinywave.js';
import {disableMethod, disableMethodGlobally, isSubFrame} from './utils.js';

const bootstrap = () => {
	interceptNetwork();
	disableMethod(Element.prototype, 'remove');
	disableMethod(Element.prototype, 'removeChild');
	disableMethod(Element.prototype, 'append');
	disableMethod(Element.prototype, 'appendChild');
	disableMethod(Element.prototype, 'insertBefore');
	disableMethod(Element.prototype, 'attachShadow');
	disableMethod(document, 'createElement');
	disableMethod(window, 'postMessage');
	disableMethod(window, 'Event');

	if (isSubFrame()) {
		return;
	}

	void baseshower();
	void shortwave();
	void tinywave();
};

bootstrap();
