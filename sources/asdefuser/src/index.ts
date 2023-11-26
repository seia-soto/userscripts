import {interceptNetwork} from './interceptors/network.js';
import {interceptStorage} from './interceptors/storage.js';
import {basedrop} from './loaders/basedrop.js';
import {tinywave} from './loaders/ztinywave.js';
import {isSubFrame, makeProxy} from './utils.js';

const bootstrap = () => {
	if (isSubFrame()) {
		return;
	}

	interceptNetwork();
	interceptStorage();
	Element.prototype.remove = makeProxy(Element.prototype.remove, 'Element.prototype.remove');
	Element.prototype.removeChild = makeProxy(Element.prototype.removeChild, 'Element.prototype.removeChild');
	Element.prototype.append = makeProxy(Element.prototype.append, 'Element.prototype.append');
	Element.prototype.appendChild = makeProxy(Element.prototype.appendChild, 'Element.prototype.appendChild');
	Element.prototype.insertBefore = makeProxy(Element.prototype.insertBefore, 'Element.prototype.insertBefore');
	Element.prototype.insertAdjacentHTML = makeProxy(Element.prototype.insertAdjacentHTML, 'Element.prototype.insertAdjacentHTML');
	Element.prototype.insertAdjacentText = makeProxy(Element.prototype.insertAdjacentText, 'Element.prototype.insertAdjacentText');
	EventTarget.prototype.addEventListener = makeProxy(EventTarget.prototype.addEventListener, 'EventTarget.prototype.addEventListener');
	MessagePort.prototype.postMessage = makeProxy(MessagePort.prototype.postMessage, 'MessagePort.prototype.postMessage');
	document.createElement = makeProxy(document.createElement, 'document.createElement');
	window.setInterval = makeProxy(setInterval, 'setInterval');
	window.setTimeout = makeProxy(setTimeout, 'setInterval');

	void basedrop();
	void tinywave();
};

bootstrap();
