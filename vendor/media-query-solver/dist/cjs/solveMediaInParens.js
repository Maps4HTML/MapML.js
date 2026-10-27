Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.solveMediaInParens_ = exports.solveMediaInParens = void 0)
const e = require('media-query-parser'),
	r = require('./solveMediaQueryList.js'),
	o = require('./solveMediaCondition.js'),
	s = require('./solveMediaFeature.js')
exports.solveMediaInParens = (o, s) => {
	let i
	if ('string' == typeof o) {
		const r = (0, e.parseMediaCondition)('(' + o + ')')
		i = (0, e.isParserError)(r) ? r : r.nodes[0]
	} else i = o
	return (0, e.isParserError)(i)
		? 'false'
		: (0, exports.solveMediaInParens_)(i, (0, r.createSolverConfig)(s))
}
exports.solveMediaInParens_ = (e, r) =>
	'condition' === e.node._t
		? (0, o.solveMediaCondition_)(e.node, r)
		: 'feature' === e.node._t
			? (0, s.solveMediaFeature_)(e.node, r)
			: r.solveGeneralEnclosed(e.node)
