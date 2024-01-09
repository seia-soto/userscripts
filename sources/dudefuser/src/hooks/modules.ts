export const hookCompiledModuleLoader = () => {
	Object.defineProperty = new Proxy(Object.defineProperty, {
		apply(target, thisArg, argArray: Parameters<typeof Object['defineProperty']>) {
			if (
				argArray.length !== 3
        || typeof argArray[1] !== 'string'
				|| typeof argArray[2] !== 'object'
			) {
				return;
			}

			const name = argArray[1];

			if (name === 'isDevToolOpen') {
				argArray[2].value = false;
			} else if (name === 'isOpen' || name === 'isEnable') {
				argArray[2].value = () => false;
			} else if (name === 'onDevToolOpen' || name === 'detect') {
				argArray[2].value = () => null;
			}

			return Reflect.apply(target, thisArg, argArray);
		},
	});
};
