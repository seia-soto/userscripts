const bootstrap = () => {
	HTMLScriptElement.prototype.getAttribute = new Proxy(HTMLScriptElement.prototype.getAttribute, {
		apply(target, thisArg, argArray) {
			const result = Reflect.apply(target, thisArg, argArray) as unknown;

			if (typeof result === 'string' && result.includes('extension://')) {
				return undefined;
			}

			return result;
		},
	});

	Element.prototype.hasAttribute = new Proxy(Element.prototype.hasAttribute, {
		apply(target, thisArg, argArray) {
			if (argArray[0] === 'hidden') {
				return false;
			}

			return Reflect.apply(target, thisArg, argArray) as unknown;
		},
	});
};

bootstrap();
