export const interceptError = () => {
	window.Error = new Proxy(Error, {
		setPrototypeOf(_target, _v) {
			throw new Error('Overriding prototype of Error is not allowed!');
		},
	});
};
