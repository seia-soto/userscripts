import {tinywave} from './loaders/ztinywave.js';
import {protectDescriptors, protectFunction} from './utils/secret.js';
import {protectStorageApis} from './utils/storage.js';

const hook = () => {
	// Pollusions
	window.Error = protectFunction(window.Error, 'Error');

	// Messaging
	protectDescriptors(window.EventTarget.prototype, 'addEventListener');
	protectDescriptors(window.MessagePort.prototype, 'postMessage');

	// Breakage
	protectDescriptors(window.Element.prototype, 'remove');
	protectDescriptors(window.Element.prototype, 'removeChild');
	protectDescriptors(window.Element.prototype, 'insertAdjacentElement');
	protectDescriptors(window.Element.prototype, 'insertAdjacentHTML');

	// Timer
	protectDescriptors(window, 'setInterval');
	protectDescriptors(window, 'setTimeout');

	// Scripting
	protectDescriptors(window.Element.prototype, 'setAttribute');
	protectDescriptors(window.Element.prototype, 'setAttributeNS');
	protectDescriptors(window.document, 'createElement');
	protectDescriptors(window.document, 'createElementNS');
	protectDescriptors(window, 'alert');
	protectDescriptors(window, 'confirm');

	// Storage
	protectStorageApis();
};

const bootstrap = () => {
	hook();

	void tinywave();
};

bootstrap();
