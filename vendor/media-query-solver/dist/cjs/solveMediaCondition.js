Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.solveMediaCondition_ = exports.solveMediaCondition = void 0)
const e = require('media-query-parser'),
	o = require('./solveMediaQueryList.js'),
	r = require('./solveMediaInParens.js')
exports.solveMediaCondition = (r, s) => {
	const i = 'string' == typeof r ? (0, e.parseMediaCondition)(r) : r
	return (0, e.isParserError)(i)
		? 'false'
		: (0, exports.solveMediaCondition_)(i, (0, o.createSolverConfig)(s))
}
exports.solveMediaCondition_ = (e, s) =>
	'and' === e.op
		? (0, o.and)(...e.nodes.map(e => (0, r.solveMediaInParens_)(e, s)))
		: 'or' === e.op
			? (0, o.or)(...e.nodes.map(e => (0, r.solveMediaInParens_)(e, s)))
			: (0, o.not)((0, r.solveMediaInParens_)(e.nodes[0], s))
