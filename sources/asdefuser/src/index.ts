import {tinywave} from './loaders/ztinywave.js';
import {protectFunctionDescriptors} from './utils/secret.js';
import {protectStorageApis} from './utils/storage.js';

const hook = () => {
	// Pollusions
	protectFunctionDescriptors(window, 'Error');

	// Messaging
	protectFunctionDescriptors(window.EventTarget.prototype, 'addEventListener');
	protectFunctionDescriptors(window.MessagePort.prototype, 'postMessage');

	// Breakage
	protectFunctionDescriptors(window.Element.prototype, 'remove');
	protectFunctionDescriptors(window.Element.prototype, 'removeChild');
	protectFunctionDescriptors(window.Element.prototype, 'insertAdjacentElement');
	protectFunctionDescriptors(window.Element.prototype, 'insertAdjacentHTML');

	// Timer
	protectFunctionDescriptors(window, 'setInterval');
	protectFunctionDescriptors(window, 'setTimeout');

	// Scripting
	protectFunctionDescriptors(window.Element.prototype, 'setAttribute', {checkArguments: true});
	protectFunctionDescriptors(window.Element.prototype, 'setAttributeNS', {checkArguments: true});
	protectFunctionDescriptors(window.document, 'createElement');
	protectFunctionDescriptors(window.document, 'createElementNS');
	protectFunctionDescriptors(window, 'alert', {checkArguments: true});
	protectFunctionDescriptors(window, 'confirm', {checkArguments: true});
	protectFunctionDescriptors(window, 'atob', {checkOutputs: true});
	protectFunctionDescriptors(window, 'decodeURI');
	protectFunctionDescriptors(window, 'decodeURIComponent');

	// Storage
	protectStorageApis();

	// Networking
	protectFunctionDescriptors(window, 'fetch', {checkArguments: true});
};

const bootstrap = () => {
	hook();

	void tinywave();
};

bootstrap();
