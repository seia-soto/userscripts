import {tinywave} from './loaders/ztinywave.js';
import {protectDescriptors} from './utils/secret.js';
import {protectStorageApis} from './utils/storage.js';

const hook = () => {
	// Pollusions
	protectDescriptors(window, 'Error');

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
	protectDescriptors(window, 'atob');
	protectDescriptors(window, 'decodeURI');
	protectDescriptors(window, 'decodeURIComponent');

	// Storage
	protectStorageApis();
};

const style = () => {
	const selectors = [
		'[class][style*="bottom: 0"][style*="justify-content: center"]',
		'iframe[src*="error-report.com"]'
	]

	document.head.insertAdjacentHTML('beforeend', `<style>${selectors.join(',')}{display:none !important}</style>`)
}

const bootstrap = () => {
	hook();
	style();

	void tinywave();
};

bootstrap();
