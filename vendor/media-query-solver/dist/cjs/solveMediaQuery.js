Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.solveMediaQuery_ = exports.solveMediaQuery = void 0)
const e = require('media-query-parser'),
	r = require('./solveMediaQueryList.js'),
	o = require('./solveMediaCondition.js')
exports.solveMediaQuery = (o, i) => {
	const s = 'string' == typeof o ? (0, e.parseMediaQuery)(o) : o
	return (0, e.isParserError)(s)
		? 'false'
		: (0, exports.solveMediaQuery_)(s, (0, r.createSolverConfig)(i))
}
exports.solveMediaQuery_ = (e, i) => {
	if ('true' === i.isLegacyBrowser && 'only' === e.prefix) return 'false'
	let s
	s =
		void 0 === e.type || 'all' === e.type
			? 'true'
			: 'screen' === e.type
				? i.isMediaTypeScreen
				: 'print' === e.type
					? (0, r.not)(i.isMediaTypeScreen)
					: 'false'
	const t = void 0 === e.condition ? 'true' : (0, o.solveMediaCondition_)(e.condition, i),
		n = (0, r.and)(s, t)
	return 'not' === e.prefix ? (0, r.not)(n) : n
}
