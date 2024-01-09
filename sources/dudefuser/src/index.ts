import {format} from 'date-fns';
import QueryString from 'qs';
import {hookCompiledModuleLoader} from './hooks/modules';
import {decode, encode} from './hooks/token';
import {makeProxy} from './utils';

const bootstrap = () => {
	hookCompiledModuleLoader();

	console.clear = makeProxy(console.clear, 'console.clear');

	document.querySelector = new Proxy(document.querySelector, {
		apply(target, thisArg, argArray) {
			if (argArray[1] === '.adsbox') {
				return document.body;
			}

			return Reflect.apply(target, thisArg, argArray) as unknown;
		},
	});

	XMLHttpRequest.prototype.send = new Proxy(XMLHttpRequest.prototype.send, {
		apply(target, thisArg: XMLHttpRequest, argArray) {
			if (typeof argArray[0] !== 'string') {
				Reflect.apply(target, thisArg, argArray);

				return;
			}

			const q = QueryString.parse(argArray[0]) as Record<'msg', string>;

			if (!q.msg) {
				Reflect.apply(target, thisArg, argArray);

				return;
			}

			let content = decode(q.msg)
				.replace(/\[scr=undefined\]/g, '')
				.replace(/\[scr=chrome-extension:[^\]]+\]/g, '')
				.replace('[referer=]', `[referer=${location.host}]`)
				.replace('[finum=0]', '[finum=6]')
				.replace('[finun=0]', '[finun=2]')
				.replace('[fivis=0]', '[fivis=1]')
				.replace('[vidn=1]', '[vidn=2]')
				.replace('[fdref42=inline]', '[fdref42=block]')
				.replace(/\[fdref44=[a-z]+\]/g, '[fdref44=1273.41px]');

			content += `[scr=https://securepubads.g.doubleclick.net/pagead/managed/js/gpt/m${format(new Date(), 'yyyymmdd')}${Math.floor(Math.random() * 3999)}/pubads_impl.js?cb=${Math.floor(Math.random() * 10e6)}]`;

			const refined = encode(content);

			q.msg = refined;

			Reflect.apply(target, thisArg, [QueryString.stringify(q)]);
		},
	});
};

bootstrap();
