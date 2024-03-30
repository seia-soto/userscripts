import {justifyCallStack} from '../utils/call-stack.js';

export const adshieldDomains = [
	'css-load.com',
	'07c225f3.online',
	'content-loader.com',
	'error-report.com',
];

const adshieldDomainSize = adshieldDomains.length;

// eslint-disable-next-line no-bitwise
export const getRandomAdShieldHost = () => adshieldDomains[(Math.random() * adshieldDomainSize) >>> 0];

export const isAdShieldCall = (trace = justifyCallStack()) => {
	if (trace.length === 0) {
		return false;
	}

	for (const domain of adshieldDomains) {
		if (trace[0].includes(domain)) {
			return true;
		}
	}

	return false;
};
