import * as asKit from 'adshield-defuser';
import * as cache from './__generated__/cache.js';

const useDisableMethod = (root: unknown, name: string, callback?: (...args: any[]) => any) => {
	// @ts-expect-error Not sure what is `root` at all
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const original = root[name];
	let isDisabled = true;

	Object.defineProperty(root, name, {
		get() {
			if (callback) {
				callback();
			}

			if (isDisabled) {
				throw new TypeError(`${name} is not a function`);
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return original;
		},
	});

	return () => {
		isDisabled = !isDisabled;
	};
};

const useDocumentReady = async (document: Document) => {
	if (document.readyState !== 'loading') {
		return true;
	}

	return new Promise(resolve => {
		document.addEventListener('readystatechange', () => {
			resolve(true);
		});
	});
};

const usePayload = async () => {
	const script = document.querySelector('script[data]:not([data=""])');

	if (!script) {
		throw new Error('DEFUSER_TARGET_NOT_FOUND');
	}

	const binary = script.getAttribute('data');
	const source = script.getAttribute('src');

	if (!binary) {
		throw new Error('DEFUSER_TARGET_DATA_NOT_FOUND');
	}

	try {
		return asKit.getDecoded(binary, cache.source);
	} catch (e) {
		console.debug('failed to apply cached source');
		console.error(e);
	}

	if (!source) {
		throw new Error('DEFUSER_TARGET_SOURCE_NOT_FOUND');
	}

	const response = await fetch(source);
	const content = await response.text();

	return asKit.getDecoded(binary, content);
};

const restoreV1 = (entries: ReturnType<typeof asKit['getDecoded']>['details']) => {
	for (const entry of entries) {
		try {
			const node = document.querySelector(`#${entry.id}`);

			if (!node) {
				continue;
			}

			node.before(entry.text);
			node.remove();
		} catch (error) {
			console.warn('failed to restore node');
			console.warn(error);
		}
	}
};

(async () => {
	const switchParseInt = useDisableMethod(window, 'parseInt', () => {
		switchParseInt();
	});

	await useDocumentReady(document);

	const payload = await usePayload();

	if (payload.meta.version?.wireType !== asKit.ProtobufWireTypes.Uint32) {
		throw new Error('DEFUSER_UNSUPPORTED_PAYLOAD_VERSION');
	}

	switch (payload.meta.version.value) {
		case 1: {
			restoreV1(payload.details);

			break;
		}

		default: {
			throw new Error('DEFUSER_UNSUPPORTED_PAYLOAD_VERSION');
		}
	}
})();
