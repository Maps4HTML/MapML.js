Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.compareResolution =
		exports.compareRatio =
		exports.compareLength =
		exports.isValueRatio =
		exports.isValueResolution =
		exports.isValueLength =
		exports.isValueInteger =
			void 0)
exports.isValueInteger = e => 'number' === e._t && 'integer' === e.flag
exports.isValueLength = e =>
	('dimension' === e._t && r(e.unit)) ||
	('number' === e._t && 'integer' === e.flag && 0 === e.value)
exports.isValueResolution = e => 'dimension' === e._t && u(e.unit)
exports.isValueRatio = e => 'ratio' === e._t || ((0, exports.isValueInteger)(e) && e.value >= 0)
const e = new Set(['cm', 'mm', 'q', 'in', 'pc', 'pt', 'px']),
	t = t => e.has(t.unit),
	n = new Set([
		...e,
		'em',
		'ex',
		'cap',
		'ch',
		'ic',
		'rem',
		'lh',
		'rlh',
		'vw',
		'vh',
		'vi',
		'vb',
		'vmin',
		'vmax',
		'svw',
		'svh',
		'svi',
		'svb',
		'svmin',
		'svmax',
		'lvw',
		'lvh',
		'lvi',
		'lvb',
		'lvmin',
		'lvmax',
		'dvw',
		'dvh',
		'dvi',
		'dvb',
		'dvmin',
		'dvmax',
		'cqw',
		'cqh',
		'cqi',
		'cqb',
		'cqmin',
		'cqmax'
	]),
	r = e => n.has(e)
exports.compareLength = (e, n) => {
	const r =
			'number' === e._t ? {_t: 'dimension', value: 0, unit: 'px', start: e.start, end: n.end} : e,
		i = 'number' === n._t ? {_t: 'dimension', value: 0, unit: 'px', start: e.start, end: n.end} : n
	if (t(r)) {
		const e = o(r)
		if (t(i)) {
			const t = o(i)
			return e === t ? 'eq' : e > t ? 'gt' : 'lt'
		}
		return 0 === e && 0 === i.value ? 'eq' : 'unknown'
	}
	if (t(i)) {
		const e = (0, exports.compareLength)(i, r)
		return 'lt' === e ? 'gt' : 'gt' === e ? 'lt' : e
	}
	return 0 === r.value && 0 === i.value ? 'eq' : 'unknown'
}
const i = new Map([
		['cm', 96 / 2.54],
		['mm', 96 / 25.4],
		['q', 96 / 101.6],
		['in', 96],
		['pc', 16],
		['pt', 96 / 72]
	]),
	o = e => {
		var t
		return e.value * (null !== (t = i.get(e.unit)) && void 0 !== t ? t : 1)
	}
exports.compareRatio = (e, t) => {
	const n = 'number' === e._t ? e.value : e.left,
		r = 'number' === e._t ? 1 : e.right,
		i = 'number' === t._t ? t.value : t.left,
		o = 'number' === t._t ? 1 : t.right
	if (0 === n && 0 === r) return 0 === i && 0 === o ? 'eq' : 'incomparable'
	if (0 === i && 0 === o) return 'incomparable'
	if (0 === n && 0 === i) return 'eq'
	if (0 === r && 0 === o) return 'eq'
	if (0 !== n && 0 !== i && 0 !== r && 0 !== o && n * o == i * r) return 'eq'
	const s = n / r,
		u = i / o
	return s > u ? 'gt' : s < u ? 'lt' : 'eq'
}
const s = new Set(['dpi', 'dpcm', 'dppx', 'x']),
	u = e => s.has(e)
exports.compareResolution = (e, t) => {
	const n = l(e),
		r = l(t)
	return n === r ? 'eq' : n > r ? 'gt' : 'lt'
}
const a = new Map([
		['dpi', 96],
		['dpcm', 96 / 2.54],
		['dppx', 1]
	]),
	l = e => {
		var t
		return e.value * (null !== (t = a.get(e.unit)) && void 0 !== t ? t : 1)
	}
