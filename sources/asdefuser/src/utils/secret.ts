import {config} from '../config.js';
import {adshieldKeywords, isAdShieldCall} from '../adshield/validators.js';
import {generateCallStack} from './call-stack.js';
import {createDebug} from './logger.js';

// eslint-disable-next-line @typescript-eslint/semi, @typescript-eslint/ban-types
type ArbitaryObject = object

const debug = createDebug('secret');

export const secret = (Date.now() * Math.random()).toString(36);

export type ProtectedFunctionCreationOptions = {
	arguments: boolean;
}

const pprintCall = (name: string, wasBlocked: boolean, v: unknown) => debug(wasBlocked ? '-' : '+', 'name=' + name, 'v=', v, 'stack=', generateCallStack());

export const protectFunction = <F extends (...args: any[]) => any>(f: F, name = f.name, options: Partial<ProtectedFunctionCreationOptions> = {}) => {
	debug('creating protected function', name);

	return new Proxy(f, {
		apply(target, thisArg, argArray) {
			if (isAdShieldCall()) {
				pprintCall(name, true, argArray);

				throw new Error();
			}

			if (options.arguments) {
				for (const arg of argArray) {
					if (typeof arg === 'string') {
						for (const domain of adshieldKeywords) {
							if (arg.includes(domain)) {
								pprintCall(name, true, argArray);

								throw new Error();
							}
						}
					}
				}
			}

			if (config.debug) {
				pprintCall(name, false, argArray);
			}

			return Reflect.apply(target, thisArg, argArray) as unknown;
		},
		setPrototypeOf(target, v) {
			pprintCall(name, true, v);

			throw new Error();
		},
	});
};

export const protectedDescriptors = new Set<unknown>();

export const protectDescriptors = <T extends ArbitaryObject, K extends keyof T>(o: T, property: K, newProperty?: T[K]) => {
	if (protectedDescriptors.size === 0) {
		debug('! creating protected object property descriptor handlers');

		const definePropertyNames = ['defineProperty', 'defineProperties'] as const

		const defineProperty = new Proxy(Object.defineProperty, {
			apply(target, thisArg, argArray) {
				const [targetObject, targetProperty] = argArray as [T, K, PropertyDescriptor];

				if (
					protectedDescriptors.has(targetObject[targetProperty])
					|| isAdShieldCall()
				) {
					pprintCall(definePropertyNames[0], true, argArray);

					throw new Error();
				}

				if (config.debug) {
					pprintCall(definePropertyNames[0], false, argArray);
				}

				return Reflect.apply(target, thisArg, argArray) as unknown;
			},
		});
		const defineProperties = new Proxy(Object.defineProperties, {
			apply(target, thisArg, argArray) {
				if (isAdShieldCall()) {
					pprintCall(definePropertyNames[1], true, argArray);

					throw new Error();
				}

				const [targetObject, targetProperties] = argArray as [T, Record<K, PropertyDescriptor>];

				for (const targetProperty of Object.keys(targetProperties) as K[]) {
					if (protectedDescriptors.has(targetObject[targetProperty])) {
						pprintCall(definePropertyNames[1], true, argArray);

						throw new Error();
					}
				}

				if (config.debug) {
					pprintCall(definePropertyNames[1], false, argArray);
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
