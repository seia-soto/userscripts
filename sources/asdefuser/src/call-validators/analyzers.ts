type Analyzer = (line: string) => boolean;

class MemoizedCallAnalyzer {
	private readonly cache: Map<string, boolean>;
	private readonly analyzer: Analyzer;

	constructor(analyzer: Analyzer) {
		this.cache = new Map();
		this.analyzer = analyzer;
	}

	analyze(line: string) {
		if (this.cache.has(line)) {
			return this.cache.get(line)!;
		}

		const result = this.analyzer(line);

		this.cache.set(line, result);

		return result;
	}
}

export const annoymousCallAnalyzer = new MemoizedCallAnalyzer(line => line.startsWith('[') || line.startsWith('<'));

export const extensionCallAnalyzer = new MemoizedCallAnalyzer(line => line.startsWith('chrome') || line.startsWith('webkit') || line.startsWith('moz'));

export const knownAdShieldOrigins = [
	'07c225f3.online',
	'css-load.com',
	'content-loader.com',
];

export const adShieldCallAnalyzer = new MemoizedCallAnalyzer(line => {
	if (line.endsWith('/script.min.js') || line.endsWith('/loader.min.js')) {
		return true;
	}

	for (const origin of knownAdShieldOrigins) {
		if (line.includes(origin)) {
			return true;
		}
	}

	return false;
});
