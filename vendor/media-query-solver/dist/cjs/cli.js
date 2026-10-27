#!/usr/bin/env node
Object.defineProperty(exports, '__esModule', {value: !0})
const e = require('./solveMediaQueryList.js'),
	o = !process.env.NO_COLOR,
	s = (e, s) => `${o ? `[${s}m` : ''}${e}${o ? '[0m' : ''}`,
	l = process.argv.slice(2)
if (0 === l.length) console.log('usage:\n\nmedia-query-solver <media-query>'), process.exit(1)
else {
	console.log(s('solving this media query:', '36')),
		console.log(''),
		console.log(s('@media ', '37') + l[0] + s(' { /* ... */ }', '37')),
		console.log('')
	const o = (0, e.solveMediaQueryList)(l[0])
	console.log(`${s('=>', '37')} ${s(s(o, '1'), '33')}`),
		console.log(''),
		'unknown' === o
			? console.log(s('some (but not all browsers) will match this media query', '33  '))
			: 'true' === o
				? console.log(
						s(
							'all browsers will match this media query\n\nit is equivalent to @media all {}',
							'33 '
						)
					)
				: console.log(
						s(
							'no browsers will match this media query\n\nit can safely be removed along with its contents',
							'33 '
						)
					)
}
