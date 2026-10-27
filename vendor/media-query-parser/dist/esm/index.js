/**! media-query-parser | Tom Golden <oss@tom.bio> (https://tom.bio) | @license MIT  */
/*! v3.0.2 */
import {
	matchCondition as t,
	matchFeature as r,
	matchQuery as e,
	matchQueryList as n
} from './ast/ast.js'
import {
	generateQueryList as o,
	generateQuery as i,
	generateCondition as s,
	generateFeature as a,
	generateValue as d
} from './generator/generator.js'
import {lexer as l} from './lexer/lexer.js'
import {isParserError as u} from './utils.js'
export const parseMediaQueryList = t => {
	const r = l(t)
	return u(r) ? r : n(r)
}
export const parseMediaQuery = t => {
	var r, n, o, i
	const s = l(t)
	if (u(s)) return s
	{
		const t = e(s)
		return t && t.i === s.length
			? t.t
			: {
					_errid: 'INVALID_QUERY',
					start:
						null !== (n = null === (r = s.at(0)) || void 0 === r ? void 0 : r.start) && void 0 !== n
							? n
							: 0,
					end:
						null !== (i = null === (o = s.at(-1)) || void 0 === o ? void 0 : o.end) && void 0 !== i
							? i
							: 0
				}
	}
}
export const parseMediaCondition = r => {
	var e, n, o, i
	const s = l(r)
	if (u(s)) return s
	{
		const r = t(s)
		return r && r.i === s.length
			? r.t
			: {
					_errid: 'INVALID_CONDITION',
					start:
						null !== (n = null === (e = s.at(0)) || void 0 === e ? void 0 : e.start) && void 0 !== n
							? n
							: 0,
					end:
						null !== (i = null === (o = s.at(-1)) || void 0 === o ? void 0 : o.end) && void 0 !== i
							? i
							: 0
				}
	}
}
export const parseMediaFeature = t => {
	var e, n, o, i
	const s = l(t)
	if (u(s)) return s
	{
		const t = r(s)
		return t && t.i === s.length
			? t.t
			: {
					_errid: 'INVALID_FEATURE',
					start:
						null !== (n = null === (e = s.at(0)) || void 0 === e ? void 0 : e.start) && void 0 !== n
							? n
							: 0,
					end:
						null !== (i = null === (o = s.at(-1)) || void 0 === o ? void 0 : o.end) && void 0 !== i
							? i
							: 0
				}
	}
}
export const stringify = t => {
	switch (t._t) {
		case 'query-list':
			return o(t)
		case 'query':
			return i(t)
		case 'condition':
			return s(t)
		case 'feature':
			return a(t)
		default:
			return d(t)
	}
}
export * from './utils.js'
