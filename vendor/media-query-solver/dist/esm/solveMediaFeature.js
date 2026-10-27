import {isParserError as e, parseMediaFeature as a} from 'media-query-parser'
import {createSolverConfig as t} from './solveMediaQueryList.js'
import {
	compareLength as n,
	compareRatio as r,
	compareResolution as u,
	isValueInteger as l,
	isValueLength as o,
	isValueRatio as v,
	isValueResolution as i
} from './valueHelpers.js'
import {solveMediaCondition_ as s} from './solveMediaCondition.js'
export const solveMediaFeature = (n, r) => {
	const u = 'string' == typeof n ? a(n) : n
	return e(u) ? 'false' : solveMediaFeature_(u, t(r))
}
export const solveMediaFeature_ = (e, a) => {
	const t = e.feature.startsWith('min-'),
		c = e.feature.startsWith('max-')
	if ((t || c) && 'value' === e.context && 'ident' !== e.value._t)
		return solveMediaFeature_(
			{
				_t: 'feature',
				context: 'range',
				ops: 1,
				feature: e.feature.slice(4),
				op: t ? '>=' : '<=',
				value: e.value,
				start: e.start,
				end: e.end
			},
			a
		)
	{
		const t = a.features.get(e.feature)
		if (t) {
			if ('boolean' === e.context) {
				return ('discrete' === t.type && (t.values.has('none') || t.values.has(0))) ||
					('range' === t.type && ('ratio' === t.valueType ? t.canNumeratorBeZero : t.canBeZero))
					? a.solveUnknownFeature(e)
					: 'true'
			}
			if ('value' === e.context) {
				if ('discrete' === t.type) {
					let n
					if ('ident' === e.value._t) n = e.value.value
					else {
						if ('number' !== e.value._t || 'integer' !== e.value.flag) return 'false'
						n = e.value.value
					}
					return t.values.has(n) ? a.solveUnknownFeature(e) : 'false'
				}
				if ('integer' === t.valueType) {
					if (l(e.value)) {
						return (e.value.value < 0 && !t.canBeNegative) || (0 === e.value.value && !t.canBeZero)
							? 'false'
							: a.solveUnknownFeature(e)
					}
					return 'false'
				}
				if ('length' === t.valueType) {
					if (o(e.value)) {
						const r = n(e.value, {_t: 'number', value: 0, flag: 'integer', start: 0, end: 0})
						return ('lt' === r && !t.canBeNegative) || ('eq' === r && !t.canBeZero)
							? 'false'
							: a.solveUnknownFeature(e)
					}
					return 'false'
				}
				if ('ratio' === t.valueType) {
					if (v(e.value)) {
						return 'eq' ===
							r(e.value, {_t: 'number', value: 0, flag: 'integer', start: 0, end: 0}) &&
							!t.canNumeratorBeZero
							? 'false'
							: a.solveUnknownFeature(e)
					}
					return 'false'
				}
				if (i(e.value)) {
					const n = u(e.value, {_t: 'dimension', value: 0, unit: 'x', start: 0, end: 0})
					return ('lt' === n && !t.canBeNegative) || ('eq' === n && !t.canBeZero)
						? 'false'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ('discrete' === t.type) return 'false'
			if (2 === e.ops)
				return s(
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
			if ('ratio' === t.valueType) {
				if (v(e.value)) {
					const n = 'number' === e.value._t ? e.value.value : e.value.left,
						r = 'number' === e.value._t ? 1 : e.value.right
					if (
						(0 === n &&
							0 !== r &&
							(('=' === e.op && !t.canNumeratorBeZero) ||
								('<=' === e.op && !t.canNumeratorBeZero) ||
								'<' === e.op)) ||
						(0 === n &&
							0 === r &&
							(!t.canNumeratorBeZero || !t.canDenominatorBeZero) &&
							('<' === e.op || '>' === e.op))
					)
						return 'false'
					return ('>=' === e.op && 0 === n && 0 !== r && !t.canDenominatorBeZero) ||
						('>' === e.op &&
							0 === n &&
							0 !== r &&
							!t.canNumeratorBeZero &&
							t.canDenominatorBeZero) ||
						('<=' === e.op &&
							0 !== n &&
							0 === r &&
							!(t.canNumeratorBeZero && t.canDenominatorBeZero)) ||
						('<' === e.op && 0 !== n && 0 === r && !t.canDenominatorBeZero)
						? 'true'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ('integer' === t.valueType) {
				if (l(e.value)) {
					if (
						('=' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('=' === e.op && !t.canBeZero && 0 === e.value.value) ||
						('<=' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('<=' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value) ||
						('<' === e.op && !t.canBeNegative && e.value.value <= 0) ||
						('<' === e.op && !t.canBeNegative && !t.canBeZero && 1 === e.value.value)
					)
						return 'false'
					return ('>=' === e.op && !t.canBeNegative && e.value.value <= 0) ||
						('>=' === e.op && !t.canBeNegative && !t.canBeZero && 1 === e.value.value) ||
						('>' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('>' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value)
						? 'true'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if ('length' === t.valueType) {
				if (o(e.value)) {
					if (
						('=' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('=' === e.op && !t.canBeZero && 0 === e.value.value) ||
						('<=' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('<=' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value) ||
						('<' === e.op && !t.canBeNegative && e.value.value <= 0)
					)
						return 'false'
					return ('>=' === e.op && !t.canBeNegative && e.value.value <= 0) ||
						('>' === e.op && !t.canBeNegative && e.value.value < 0) ||
						('>' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value)
						? 'true'
						: a.solveUnknownFeature(e)
				}
				return 'false'
			}
			if (i(e.value)) {
				if (
					('=' === e.op && !t.canBeNegative && e.value.value < 0) ||
					('=' === e.op && !t.canBeZero && 0 === e.value.value) ||
					('<=' === e.op && !t.canBeNegative && e.value.value < 0) ||
					('<=' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value) ||
					('<' === e.op && !t.canBeNegative && e.value.value <= 0)
				)
					return 'false'
				return ('>=' === e.op && !t.canBeNegative && e.value.value <= 0) ||
					('>' === e.op && !t.canBeNegative && e.value.value < 0) ||
					('>' === e.op && !t.canBeNegative && !t.canBeZero && 0 === e.value.value)
					? 'true'
					: a.solveUnknownFeature(e)
			}
			return 'false'
		}
		return 'false'
	}
}
