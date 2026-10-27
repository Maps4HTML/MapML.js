Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.solveMediaFeature_ = exports.solveMediaFeature = void 0)
const e = require('media-query-parser'),
	a = require('./solveMediaQueryList.js'),
	t = require('./valueHelpers.js'),
	r = require('./solveMediaCondition.js')
exports.solveMediaFeature = (t, r) => {
	const u = 'string' == typeof t ? (0, e.parseMediaFeature)(t) : t
	return (0, e.isParserError)(u)
		? 'false'
		: (0, exports.solveMediaFeature_)(u, (0, a.createSolverConfig)(r))
}
exports.solveMediaFeature_ = (e, a) => {
	const u = e.feature.startsWith('min-'),
		n = e.feature.startsWith('max-')
	if ((u || n) && 'value' === e.context && 'ident' !== e.value._t)
		return (0, exports.solveMediaFeature_)(
			{
				_t: 'feature',
				context: 'range',
				ops: 1,
				feature: e.feature.slice(4),
				op: u ? '>=' : '<=',
				value: e.value,
				start: e.start,
				end: e.end
			},
			a
		)
	{
		const u = a.features.get(e.feature)
		if (u) {
			if ('boolean' === e.context) {
				return ('discrete' === u.type && (u.values.has('none') || u.values.has(0))) ||
					('range' === u.type && ('ratio' === u.valueType ? u.canNumeratorBeZero : u.canBeZero))
					? a.solveUnknownFeature(e)
					: 'true'
			}
			if ('value' === e.context) {
				if ('discrete' === u.type) {
					let t
					if ('ident' === e.value._t) t = e.value.value
					else {
						if ('number' !== e.value._t || 'integer' !== e.value.flag) return 'false'
						t = e.value.value
					}
					return u.values.has(t) ? a.solveUnknownFeature(e) : 'false'
				}
				if ('integer' === u.valueType) {
					if ((0, t.isValueInteger)(e.value)) {
						return (e.value.value < 0 && !u.canBeNegative) || (0 === e.value.value && !u.canBeZero)
							? 'false'
							: a.solveUnknownFeature(e)
					}
					return 'false'
				}
				if ('length' === u.valueType) {
					if ((0, t.isValueLength)(e.value)) {
						const r = (0, t.compareLength)(e.value, {
							_t: 'number',
							value: 0,
							flag: 'integer',
							start: 0,
							end: 0
						})
						return ('lt' === r && !u.canBeNegative) || ('eq' === r && !u.canBeZero)
							? 'false'
							: a.solveUnknownFeature(e)
					}
					return 'false'
				}
				if ('ratio' === u.valueType) {
					if ((0, t.isValueRatio)(e.value)) {
						return 'eq' ===
							(0, t.compareRatio)(e.value, {
								_t: 'number',
								value: 0,
								flag: 'integer',
								start: 0,
								end: 0
							}) && !u.canNumeratorBeZero
							? 'false'
							: a.solveUnknownFeature(e)
					}
					return 'false'
				}
				if ((0, t.isValueResolution)(e.value)) {
					const r = (0, t.compareResolution)(e.value, {
						_t: 'dimension',
						value: 0,
						unit: 'x',
						start: 0,
						end: 0
					})
					return ('lt' === r && !u.canBeNegative) || ('eq' === r && !u.canBeZero)
						? 'false'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ('discrete' === u.type) return 'false'
			if (2 === e.ops)
				return (0, r.solveMediaCondition_)(
					{
						_t: 'condition',
						op: 'and',
						nodes: [
							{
								_t: 'in-parens',
								node: {
									_t: 'feature',
									context: 'range',
									ops: 1,
									feature: e.feature,
									op: '<' === e.minOp ? '>' : '>=',
									value: e.minValue,
									start: e.minValue.start,
									end: e.minValue.end
								}
							},
							{
								_t: 'in-parens',
								node: {
									_t: 'feature',
									context: 'range',
									ops: 1,
									feature: e.feature,
									op: e.maxOp,
									value: e.maxValue,
									start: e.maxValue.start,
									end: e.maxValue.end
								}
							}
						],
						start: e.start,
						end: e.end
					},
					a
				)
			if ('ratio' === u.valueType) {
				if ((0, t.isValueRatio)(e.value)) {
					const t = 'number' === e.value._t ? e.value.value : e.value.left,
						r = 'number' === e.value._t ? 1 : e.value.right
					if (
						(0 === t &&
							0 !== r &&
							(('=' === e.op && !u.canNumeratorBeZero) ||
								('<=' === e.op && !u.canNumeratorBeZero) ||
								'<' === e.op)) ||
						(0 === t &&
							0 === r &&
							(!u.canNumeratorBeZero || !u.canDenominatorBeZero) &&
							('<' === e.op || '>' === e.op))
					)
						return 'false'
					return ('>=' === e.op && 0 === t && 0 !== r && !u.canDenominatorBeZero) ||
						('>' === e.op &&
							0 === t &&
							0 !== r &&
							!u.canNumeratorBeZero &&
							u.canDenominatorBeZero) ||
						('<=' === e.op &&
							0 !== t &&
							0 === r &&
							!(u.canNumeratorBeZero && u.canDenominatorBeZero)) ||
						('<' === e.op && 0 !== t && 0 === r && !u.canDenominatorBeZero)
						? 'true'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ('integer' === u.valueType) {
				if ((0, t.isValueInteger)(e.value)) {
					if (
						('=' === e.op && !u.canBeNegative && e.value.value < 0) ||
						('=' === e.op && !u.canBeZero && 0 === e.value.value) ||
						('<=' === e.op && !u.canBeNegative && e.value.value < 0) ||
						('<=' === e.op && !u.canBeNegative && !u.canBeZero && 0 === e.value.value) ||
						('<' === e.op && !u.canBeNegative && e.value.value <= 0) ||
						('<' === e.op && !u.canBeNegative && !u.canBeZero && 1 === e.value.value)
					)
						return 'false'
					return ('>=' === e.op && !u.canBeNegative && e.value.value <= 0) ||
						('>=' === e.op && !u.canBeNegative && !u.canBeZero && 1 === e.value.value) ||
						('>' === e.op && !u.canBeNegative && e.value.value < 0) ||
						('>' === e.op && !u.canBeNegative && !u.canBeZero && 0 === e.value.value)
						? 'true'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ('length' === u.valueType) {
				if ((0, t.isValueLength)(e.value)) {
					if (
						('=' === e.op && !u.canBeNegative && e.value.value < 0) ||
						('=' === e.op && !u.canBeZero && 0 === e.value.value) ||
						('<=' === e.op && !u.canBeNegative && e.value.value < 0) ||
						('<=' === e.op && !u.canBeNegative && !u.canBeZero && 0 === e.value.value) ||
						('<' === e.op && !u.canBeNegative && e.value.value <= 0)
					)
						return 'false'
					return ('>=' === e.op && !u.canBeNegative && e.value.value <= 0) ||
						('>' === e.op && !u.canBeNegative && e.value.value < 0) ||
						('>' === e.op && !u.canBeNegative && !u.canBeZero && 0 === e.value.value)
						? 'true'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ((0, t.isValueResolution)(e.value)) {
				if (
					('=' === e.op && !u.canBeNegative && e.value.value < 0) ||
					('=' === e.op && !u.canBeZero && 0 === e.value.value) ||
					('<=' === e.op && !u.canBeNegative && e.value.value < 0) ||
					('<=' === e.op && !u.canBeNegative && !u.canBeZero && 0 === e.value.value) ||
					('<' === e.op && !u.canBeNegative && e.value.value <= 0)
				)
					return 'false'
				return ('>=' === e.op && !u.canBeNegative && e.value.value <= 0) ||
					('>' === e.op && !u.canBeNegative && e.value.value < 0) ||
					('>' === e.op && !u.canBeNegative && !u.canBeZero && 0 === e.value.value)
					? 'true'
					: a.solveUnknownFeature(e)
			}
			return 'false'
		}
		return 'false'
	}
}
