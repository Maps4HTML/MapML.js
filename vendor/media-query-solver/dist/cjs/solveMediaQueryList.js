Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.solveMediaQueryList_ =
		exports.solveMediaQueryList =
		exports.createSolverConfig =
		exports.DEFAULT_KNOWN_FEATURES =
		exports.or =
		exports.and =
		exports.not =
			void 0)
const e = require('media-query-parser'),
	r = require('./solveMediaQuery.js')
exports.not = e => ('true' === e ? 'false' : 'false' === e ? 'true' : 'unknown')
exports.and = (...e) =>
	e.reduce(
		(e, r) =>
			'false' === e || 'false' === r
				? 'false'
				: 'unknown' === e || 'unknown' === r
					? 'unknown'
					: 'true',
		'true'
	)
;(exports.or = (...e) =>
	e.reduce(
		(e, r) =>
			'true' === e || 'true' === r
				? 'true'
				: 'unknown' === e || 'unknown' === r
					? 'unknown'
					: 'false',
		'false'
	)),
	(exports.DEFAULT_KNOWN_FEATURES = {
		'color-gamut': {type: 'discrete', values: ['srgb', 'p3', 'rec2020']},
		'display-mode': {
			type: 'discrete',
			values: ['fullscreen', 'standalone', 'minimal-ui', 'browser']
		},
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
	})
const n = e => Object.entries(e)
exports.createSolverConfig = e => {
	var r, t, a, o, s, i
	const l = new Map()
	for (const [a, o] of n(
		Object.assign(
			Object.assign({}, exports.DEFAULT_KNOWN_FEATURES),
			null == e ? void 0 : e.features
		)
	))
		'discrete' === o.type
			? l.set(
					a,
					Object.assign(Object.assign({}, o), {
						values: new Set(null !== (r = o.values) && void 0 !== r ? r : [])
					})
				)
			: l.set(
					a,
					Object.assign(Object.assign({}, o), {
						extraValues: new Map(
							n(null !== (t = null == o ? void 0 : o.extraValues) && void 0 !== t ? t : {})
						)
					})
				)
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
exports.solveMediaQueryList = (r, n) => {
	const t = 'string' == typeof r ? (0, e.parseMediaQueryList)(r) : r
	return (0, e.isParserError)(t)
		? 'false'
		: (0, exports.solveMediaQueryList_)(t, (0, exports.createSolverConfig)(n))
}
exports.solveMediaQueryList_ = (e, n) => {
	const t = e.nodes.map(e => (void 0 === e ? 'false' : (0, r.solveMediaQuery_)(e, n)))
	if (0 === t.length) return 'true'
	{
		let e = 'false'
		for (const r of t) {
			if ('true' === r) return 'true'
			'unknown' === r && (e = 'unknown')
		}
		return e
	}
}
