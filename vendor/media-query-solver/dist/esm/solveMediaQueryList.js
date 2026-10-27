import {isParserError as e, parseMediaQueryList as n} from 'media-query-parser'
import {solveMediaQuery_ as r} from './solveMediaQuery.js'
export const not = e => ('true' === e ? 'false' : 'false' === e ? 'true' : 'unknown')
export const and = (...e) =>
	e.reduce(
		(e, n) =>
			'false' === e || 'false' === n
				? 'false'
				: 'unknown' === e || 'unknown' === n
					? 'unknown'
					: 'true',
		'true'
	)
export const or = (...e) =>
	e.reduce(
		(e, n) =>
			'true' === e || 'true' === n
				? 'true'
				: 'unknown' === e || 'unknown' === n
					? 'unknown'
					: 'false',
		'false'
	)
export const DEFAULT_KNOWN_FEATURES = {
	'color-gamut': {type: 'discrete', values: ['srgb', 'p3', 'rec2020']},
	'display-mode': {type: 'discrete', values: ['fullscreen', 'standalone', 'minimal-ui', 'browser']},
	'dynamic-range': {type: 'discrete', values: ['standard', 'high']},
	'environment-blending': {type: 'discrete', values: ['opaque', 'additive', 'subtractive']},
	orientation: {type: 'discrete', values: ['portrait', 'landscape']},
	'prefers-color-scheme': {type: 'discrete', values: ['light', 'dark']},
	'prefers-contrast': {type: 'discrete', values: ['no-preference', 'less', 'more', 'custom']},
	'prefers-reduced-data': {type: 'discrete', values: ['no-preference', 'reduce']},
	'prefers-reduced-motion': {type: 'discrete', values: ['no-preference', 'reduce']},
	'prefers-reduced-transparency': {type: 'discrete', values: ['no-preference', 'reduce']},
	scan: {type: 'discrete', values: ['interlace', 'progressive']},
	'video-color-gamut': {type: 'discrete', values: ['srgb', 'p3', 'rec2020']},
	'video-dynamic-range': {type: 'discrete', values: ['standard', 'high']},
	'any-hover': {type: 'discrete', values: ['none', 'hover']},
	'any-pointer': {type: 'discrete', values: ['none', 'coarse', 'fine']},
	'forced-colors': {type: 'discrete', values: ['none', 'active']},
	hover: {type: 'discrete', values: ['none', 'hover']},
	'inverted-colors': {type: 'discrete', values: ['none', 'inverted']},
	'nav-controls': {type: 'discrete', values: ['none', 'back']},
	'overflow-block': {type: 'discrete', values: ['none', 'scroll', 'paged']},
	'overflow-inline': {type: 'discrete', values: ['none', 'scroll']},
	pointer: {type: 'discrete', values: ['none', 'coarse', 'fine']},
	update: {type: 'discrete', values: ['none', 'slow', 'fast']},
	scripting: {type: 'discrete', values: ['none', 'initial-only', 'enabled']},
	grid: {type: 'discrete', values: [0, 1]},
	resolution: {
		type: 'range',
		valueType: 'resolution',
		canBeZero: !0,
		canBeNegative: !1,
		extraValues: {infinite: Number.POSITIVE_INFINITY}
	},
	'device-height': {type: 'range', valueType: 'length', canBeZero: !0, canBeNegative: !1},
	'device-width': {type: 'range', valueType: 'length', canBeZero: !0, canBeNegative: !1},
	height: {type: 'range', valueType: 'length', canBeZero: !0, canBeNegative: !1},
	width: {type: 'range', valueType: 'length', canBeZero: !0, canBeNegative: !1},
	'device-aspect-ratio': {
		type: 'range',
		valueType: 'ratio',
		canNumeratorBeZero: !0,
		canDenominatorBeZero: !0
	},
	'aspect-ratio': {
		type: 'range',
		valueType: 'ratio',
		canNumeratorBeZero: !0,
		canDenominatorBeZero: !0
	},
	color: {type: 'range', valueType: 'integer', canBeZero: !0, canBeNegative: !1},
	'horizontal-viewport-segments': {
		type: 'range',
		valueType: 'integer',
		canBeZero: !0,
		canBeNegative: !1
	},
	'color-index': {type: 'range', valueType: 'integer', canBeZero: !0, canBeNegative: !1},
	monochrome: {type: 'range', valueType: 'integer', canBeZero: !0, canBeNegative: !1},
	'vertical-viewport-segments': {
		type: 'range',
		valueType: 'integer',
		canBeZero: !0,
		canBeNegative: !1
	}
}
const t = e => Object.entries(e)
export const createSolverConfig = e => {
	var n, r, a, o, s, i
	const l = new Map()
	for (const [a, o] of t({...DEFAULT_KNOWN_FEATURES, ...(null == e ? void 0 : e.features)}))
		'discrete' === o.type
			? l.set(a, {...o, values: new Set(null !== (n = o.values) && void 0 !== n ? n : [])})
			: l.set(a, {
					...o,
					extraValues: new Map(
						t(null !== (r = null == o ? void 0 : o.extraValues) && void 0 !== r ? r : {})
					)
				})
	return {
		solveUnknownFeature:
			null !== (a = null == e ? void 0 : e.solveUnknownFeature) && void 0 !== a
				? a
				: () => 'unknown',
		solveGeneralEnclosed:
			null !== (o = null == e ? void 0 : e.solveGeneralEnclosed) && void 0 !== o
				? o
				: () => 'unknown',
		isMediaTypeScreen:
			null !== (s = null == e ? void 0 : e.isMediaTypeScreen) && void 0 !== s ? s : 'unknown',
		isLegacyBrowser:
			null !== (i = null == e ? void 0 : e.isLegacyBrowser) && void 0 !== i ? i : 'unknown',
		features: l
	}
}
export const solveMediaQueryList = (r, t) => {
	const a = 'string' == typeof r ? n(r) : r
	return e(a) ? 'false' : solveMediaQueryList_(a, createSolverConfig(t))
}
export const solveMediaQueryList_ = (e, n) => {
	const t = e.nodes.map(e => (void 0 === e ? 'false' : r(e, n)))
	if (0 === t.length) return 'true'
	{
		let e = 'false'
		for (const n of t) {
			if ('true' === n) return 'true'
			'unknown' === n && (e = 'unknown')
		}
		return e
	}
}
