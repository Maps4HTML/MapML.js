/**! media-query-parser | Tom Golden <oss@tom.bio> (https://tom.bio) | @license MIT  */
/*! v3.0.2 */
var e =
		(this && this.__createBinding) ||
		(Object.create
			? function (e, r, t, i) {
					void 0 === i && (i = t)
					var n = Object.getOwnPropertyDescriptor(r, t)
					;(n && !('get' in n ? !r.__esModule : n.writable || n.configurable)) ||
						(n = {
							enumerable: !0,
							get: function () {
								return r[t]
							}
						}),
						Object.defineProperty(e, i, n)
				}
			: function (e, r, t, i) {
					void 0 === i && (i = t), (e[i] = r[t])
				}),
	r =
		(this && this.__exportStar) ||
		function (r, t) {
			for (var i in r) 'default' === i || Object.prototype.hasOwnProperty.call(t, i) || e(t, r, i)
		}
Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.stringify =
		exports.parseMediaFeature =
		exports.parseMediaCondition =
		exports.parseMediaQuery =
		exports.parseMediaQueryList =
			void 0)
const t = require('./ast/ast.js'),
	i = require('./generator/generator.js'),
	n = require('./lexer/lexer.js'),
	o = require('./utils.js')
exports.parseMediaQueryList = e => {
	const r = (0, n.lexer)(e)
	return (0, o.isParserError)(r) ? r : (0, t.matchQueryList)(r)
}
exports.parseMediaQuery = e => {
	var r, i, a, s
	const u = (0, n.lexer)(e)
	if ((0, o.isParserError)(u)) return u
	{
		const e = (0, t.matchQuery)(u)
		return e && e.i === u.length
			? e.t
			: {
					_errid: 'INVALID_QUERY',
					start:
						null !== (i = null === (r = u.at(0)) || void 0 === r ? void 0 : r.start) && void 0 !== i
							? i
							: 0,
					end:
						null !== (s = null === (a = u.at(-1)) || void 0 === a ? void 0 : a.end) && void 0 !== s
							? s
							: 0
				}
	}
}
exports.parseMediaCondition = e => {
	var r, i, a, s
	const u = (0, n.lexer)(e)
	if ((0, o.isParserError)(u)) return u
	{
		const e = (0, t.matchCondition)(u)
		return e && e.i === u.length
			? e.t
			: {
					_errid: 'INVALID_CONDITION',
					start:
						null !== (i = null === (r = u.at(0)) || void 0 === r ? void 0 : r.start) && void 0 !== i
							? i
							: 0,
					end:
						null !== (s = null === (a = u.at(-1)) || void 0 === a ? void 0 : a.end) && void 0 !== s
							? s
							: 0
				}
	}
}
exports.parseMediaFeature = e => {
	var r, i, a, s
	const u = (0, n.lexer)(e)
	if ((0, o.isParserError)(u)) return u
	{
		const e = (0, t.matchFeature)(u)
		return e && e.i === u.length
			? e.t
			: {
					_errid: 'INVALID_FEATURE',
					start:
						null !== (i = null === (r = u.at(0)) || void 0 === r ? void 0 : r.start) && void 0 !== i
							? i
							: 0,
					end:
						null !== (s = null === (a = u.at(-1)) || void 0 === a ? void 0 : a.end) && void 0 !== s
							? s
							: 0
				}
	}
}
;(exports.stringify = e => {
	switch (e._t) {
		case 'query-list':
			return (0, i.generateQueryList)(e)
		case 'query':
			return (0, i.generateQuery)(e)
		case 'condition':
			return (0, i.generateCondition)(e)
		case 'feature':
			return (0, i.generateFeature)(e)
		default:
			return (0, i.generateValue)(e)
	}
}),
	r(require('./utils.js'), exports)
