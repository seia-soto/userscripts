import {config} from '../config.js';
import {adshieldKeywords, isAdShieldCall} from '../adshield/validators.js';
import {generateCallStack} from './call-stack.js';
import {createDebug} from './logger.js';

// eslint-disable-next-line @typescript-eslint/semi, @typescript-eslint/ban-types
type ArbitaryObject = object

const debug = createDebug('secret');

export const secret = (Date.now() * Math.random()).toString(36);

export const protectFunction = <F extends (...args: any[]) => any>(f: F, name = f.name) => {
	debug('creating protected function', name);

	return new Proxy(f, {
		apply(target, thisArg, argArray) {
			if (isAdShieldCall()) {
				debug('- apply name=' + name, 'args=', argArray, 'stack=', generateCallStack());

				throw new Error();
			}

			if (config.debug) {
				debug('+ apply name=' + name, 'args=', argArray, 'stack=', generateCallStack());
			}

			return Reflect.apply(target, thisArg, argArray) as unknown;
		},
		setPrototypeOf(target, v) {
			debug('- setPrototypeOf name=' + name, 'v=', v, 'stack=', generateCallStack());

			throw new Error();
		},
	});
};

export const protectFunctionWithArguments = <F extends (...args: any[]) => any>(f: F, name = f.name, checkOutput = false) => {
	debug('creating protected function', name);

	return new Proxy(f, {
		apply(target, thisArg, argArray) {
			for (const arg of argArray) {
				if (typeof arg === 'string') {
					for (const domain of adshieldKeywords) {
						if (arg.includes(domain)) {
							debug('- apply name=' + name, 'args=', argArray, 'stack=', generateCallStack());

							throw new Error();
						}
					}
				}
			}

			if (isAdShieldCall()) {
				debug('- apply name=' + name, 'args=', argArray, 'stack=', generateCallStack());

				throw new Error();
			}

			if (config.debug) {
				debug('+ apply name=' + name, 'args=', argArray, 'stack=', generateCallStack());
			}

			const result = Reflect.apply(target, thisArg, argArray) as unknown;

			if (!checkOutput) {
				return result;
			}

			for (const domain of adshieldKeywords) {
				if ((result as string).includes(domain)) {
					debug('- ~apply name=' + name, 'args=', argArray, 'stack=', generateCallStack());

					throw new Error();
				}
			}

			return result;
		},
		setPrototypeOf(target, v) {
			debug('- setPrototypeOf name=' + name, 'v=', v, 'stack=', generateCallStack());

			throw new Error();
		},
	});
};

export const protectedDescriptors = new Set<unknown>();

export const protectDescriptors = <T extends ArbitaryObject, K extends keyof T>(o: T, property: K, newProperty?: T[K]) => {
	if (protectedDescriptors.size === 0) {
		debug('! creating protected object property descriptor handlers');

		const defineProperty = new Proxy(Object.defineProperty, {
			apply(target, thisArg, argArray) {
				const [targetObject, targetProperty] = argArray as [T, K, PropertyDescriptor];

				if (
					protectedDescriptors.has(targetObject[targetProperty])
					|| isAdShieldCall()
				) {
					debug('- apply name=Object.defineProperty', 'args=', argArray, 'stack=', generateCallStack());

					throw new Error();
				}

				if (config.debug) {
					debug('+ apply name=Object.defineProperty', 'args=', argArray, 'stack=', generateCallStack());
				}

				return Reflect.apply(target, thisArg, argArray) as unknown;
			},
		});
		const defineProperties = new Proxy(Object.defineProperties, {
			apply(target, thisArg, argArray) {
				const [targetObject, targetProperties] = argArray as [T, Record<K, PropertyDescriptor>];

				for (const targetProperty of Object.keys(targetProperties) as K[]) {
					if (protectedDescriptors.has(targetObject[targetProperty])) {
						debug('- apply name=Object.defineProperty', 'args=', argArray, 'stack=', generateCallStack());

						throw new Error();
					}
				}

				if (isAdShieldCall()) {
					debug('- apply name=Object.defineProperty', 'args=', argArray, 'stack=', generateCallStack());

					throw new Error();
				}

				if (config.debug) {
					debug('+ apply name=Object.defineProperty', 'args=', argArray, 'stack=', generateCallStack());
				}

				return Reflect.apply(target, thisArg, argArray) as unknown;
			},
		});

		protectedDescriptors.add(defineProperties);
		protectedDescriptors.add(defineProperty);

		Object.defineProperty(window.Object, 'defineProperty', {
			get() {
				return defineProperty;
			},
		});
		Object.defineProperties(window.Object, {
			defineProperty: {
				get() {
					return defineProperty;
				},
			},
			defineProperties: {
				get() {
					return defineProperties;
				},
			},
		});
	}

	if (newProperty === undefined && typeof o[property] === 'function') {
		newProperty = protectFunction(o[property] as (...args: unknown[]) => unknown) as T[K];
	}

	Object.defineProperty(o, property, {
		value: newProperty,
	});

	protectedDescriptors.add(newProperty);
};
