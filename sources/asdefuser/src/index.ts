import {interceptError} from './interceptors/error.js';
import {interceptNetwork} from './interceptors/network.js';
import {interceptStorage} from './interceptors/storage.js';
import {basedrop} from './loaders/basedrop.js';
import {tinywave} from './loaders/ztinywave.js';
import {isSubFrame, makeProxy} from './utils.js';

const bootstrap = () => {
	interceptError();
	interceptNetwork();
	interceptStorage();
	Element.prototype.remove = makeProxy(Element.prototype.remove, 'Element.prototype.remove');
	Element.prototype.removeChild = makeProxy(Element.prototype.removeChild, 'Element.prototype.removeChild');
	// Safari problem
	// Element.prototype.insertAdjacentHTML = makeProxy(Element.prototype.insertAdjacentHTML, 'Element.prototype.insertAdjacentHTML');
	EventTarget.prototype.addEventListener = makeProxy(EventTarget.prototype.addEventListener, 'EventTarget.prototype.addEventListener');
	MessagePort.prototype.postMessage = makeProxy(MessagePort.prototype.postMessage, 'MessagePort.prototype.postMessage');
	document.createElement = makeProxy(document.createElement, 'document.createElement');
	window.setInterval = makeProxy(setInterval, 'setInterval');
	window.setTimeout = makeProxy(setTimeout, 'setInterval');

	if (isSubFrame()) {
		return;
	}

	void basedrop();
	void tinywave();
};

bootstrap();
