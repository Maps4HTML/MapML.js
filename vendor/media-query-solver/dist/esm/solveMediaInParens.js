import {isParserError as e, parseMediaCondition as o} from 'media-query-parser'
import {createSolverConfig as n} from './solveMediaQueryList.js'
import {solveMediaCondition_ as r} from './solveMediaCondition.js'
import {solveMediaFeature_ as s} from './solveMediaFeature.js'
export const solveMediaInParens = (r, s) => {
	let t
	if ('string' == typeof r) {
		const n = o('(' + r + ')')
		t = e(n) ? n : n.nodes[0]
	} else t = r
	return e(t) ? 'false' : solveMediaInParens_(t, n(s))
}
export const solveMediaInParens_ = (e, o) =>
	'condition' === e.node._t
		? r(e.node, o)
		: 'feature' === e.node._t
			? s(e.node, o)
			: o.solveGeneralEnclosed(e.node)
