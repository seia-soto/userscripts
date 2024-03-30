import {tinywave} from './loaders/ztinywave.js';
import {protectDescriptors, protectFunction, protectFunctionWithArguments} from './utils/secret.js';
import {protectStorageApis} from './utils/storage.js';

const hook = () => {
	// Pollusions
	protectDescriptors(window, 'Error', protectFunctionWithArguments(window.Error));

	// Messaging
	protectDescriptors(window.EventTarget.prototype, 'addEventListener', protectFunctionWithArguments(EventTarget.prototype.addEventListener));
	protectDescriptors(window.MessagePort.prototype, 'postMessage', protectFunctionWithArguments(MessagePort.prototype.postMessage));

	// Breakage
	protectDescriptors(window.Element.prototype, 'remove');
	protectDescriptors(window.Element.prototype, 'removeChild');
	protectDescriptors(window.Element.prototype, 'insertAdjacentElement');
	protectDescriptors(window.Element.prototype, 'insertAdjacentHTML');

	// Timer
	protectDescriptors(window, 'setInterval');
	protectDescriptors(window, 'setTimeout');

	// Scripting
	protectDescriptors(window.Element.prototype, 'setAttribute', protectFunctionWithArguments(Element.prototype.setAttribute));
	protectDescriptors(window.Element.prototype, 'setAttributeNS', protectFunctionWithArguments(Element.prototype.setAttributeNS));
	protectDescriptors(window.document, 'createElement', protectFunctionWithArguments(document.createElement));
	protectDescriptors(window.document, 'createElementNS', protectFunctionWithArguments(document.createElementNS));
	protectDescriptors(window, 'alert', protectFunctionWithArguments(alert));
	protectDescriptors(window, 'confirm', protectFunctionWithArguments(confirm));
	protectDescriptors(window, 'atob', protectFunctionWithArguments(atob, atob.name, true));
	protectDescriptors(window, 'decodeURI', protectFunctionWithArguments(decodeURI));
	protectDescriptors(window, 'decodeURIComponent', protectFunctionWithArguments(decodeURIComponent));

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
