import {isParserError as o, parseMediaCondition as e} from 'media-query-parser'
import {and as s, createSolverConfig as i, not as n, or as r} from './solveMediaQueryList.js'
import {solveMediaInParens_ as t} from './solveMediaInParens.js'
export const solveMediaCondition = (s, n) => {
	const r = 'string' == typeof s ? e(s) : s
	return o(r) ? 'false' : solveMediaCondition_(r, i(n))
}
export const solveMediaCondition_ = (o, e) =>
	'and' === o.op
		? s(...o.nodes.map(o => t(o, e)))
		: 'or' === o.op
			? r(...o.nodes.map(o => t(o, e)))
			: n(t(o.nodes[0], e))
