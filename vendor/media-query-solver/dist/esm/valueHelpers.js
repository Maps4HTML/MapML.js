export const isValueInteger = t => 'number' === t._t && 'integer' === t.flag
export const isValueLength = t =>
	('dimension' === t._t && r(t.unit)) ||
	('number' === t._t && 'integer' === t.flag && 0 === t.value)
export const isValueResolution = t => 'dimension' === t._t && o(t.unit)
export const isValueRatio = t => 'ratio' === t._t || (isValueInteger(t) && t.value >= 0)
const t = new Set(['cm', 'mm', 'q', 'in', 'pc', 'pt', 'px']),
	e = e => t.has(e.unit),
	n = new Set([
		...t,
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
	r = t => n.has(t)
export const compareLength = (t, n) => {
	const r =
			'number' === t._t ? {_t: 'dimension', value: 0, unit: 'px', start: t.start, end: n.end} : t,
		i = 'number' === n._t ? {_t: 'dimension', value: 0, unit: 'px', start: t.start, end: n.end} : n
	if (e(r)) {
		const t = u(r)
		if (e(i)) {
			const e = u(i)
			return t === e ? 'eq' : t > e ? 'gt' : 'lt'
		}
		return 0 === t && 0 === i.value ? 'eq' : 'unknown'
	}
	if (e(i)) {
		const t = compareLength(i, r)
		return 'lt' === t ? 'gt' : 'gt' === t ? 'lt' : t
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
	u = t => {
		var e
		return t.value * (null !== (e = i.get(t.unit)) && void 0 !== e ? e : 1)
	}
export const compareRatio = (t, e) => {
	const n = 'number' === t._t ? t.value : t.left,
		r = 'number' === t._t ? 1 : t.right,
		i = 'number' === e._t ? e.value : e.left,
		u = 'number' === e._t ? 1 : e.right
	if (0 === n && 0 === r) return 0 === i && 0 === u ? 'eq' : 'incomparable'
	if (0 === i && 0 === u) return 'incomparable'
	if (0 === n && 0 === i) return 'eq'
	if (0 === r && 0 === u) return 'eq'
	if (0 !== n && 0 !== i && 0 !== r && 0 !== u && n * u == i * r) return 'eq'
	const a = n / r,
		o = i / u
	return a > o ? 'gt' : a < o ? 'lt' : 'eq'
}
const a = new Set(['dpi', 'dpcm', 'dppx', 'x']),
	o = t => a.has(t)
export const compareResolution = (t, e) => {
	const n = l(t),
		r = l(e)
	return n === r ? 'eq' : n > r ? 'gt' : 'lt'
}
const s = new Map([
		['dpi', 96],
		['dpcm', 96 / 2.54],
		['dppx', 1]
	]),
	l = t => {
		var e
		return t.value * (null !== (e = s.get(t.unit)) && void 0 !== e ? e : 1)
	}
