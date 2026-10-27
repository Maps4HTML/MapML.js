#!/usr/bin/env node
import {solveMediaQueryList as o} from './solveMediaQueryList.js'
const e = !process.env.NO_COLOR,
	l = (o, l) => `${e ? `[${l}m` : ''}${o}${e ? '[0m' : ''}`,
	s = process.argv.slice(2)
if (0 === s.length) console.log('usage:\n\nmedia-query-solver <media-query>'), process.exit(1)
else {
	console.log(l('solving this media query:', '36')),
		console.log(''),
		console.log(l('@media ', '37') + s[0] + l(' { /* ... */ }', '37')),
		console.log('')
	const e = o(s[0])
	console.log(`${l('=>', '37')} ${l(l(e, '1'), '33')}`),
		console.log(''),
		'unknown' === e
			? console.log(l('some (but not all browsers) will match this media query', '33  '))
			: 'true' === e
				? console.log(
						l(
							'all browsers will match this media query\n\nit is equivalent to @media all {}',
							'33 '
						)
					)
				: console.log(
						l(
							'no browsers will match this media query\n\nit can safely be removed along with its contents',
							'33 '
						)
					)
}
