Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.generateIdent =
		exports.generateDimension =
		exports.generateNumber =
		exports.generateRatio =
		exports.generateValue =
		exports.generateFeatureDoubleRange =
		exports.generateFeatureSingleRange =
		exports.generateFeatureRange =
		exports.generateFeatureValue =
		exports.generateFeatureBoolean =
		exports.generateFeature =
		exports.generateCondition =
		exports.generateInParens =
		exports.generateQuery =
		exports.generateQueryList =
			void 0)
exports.generateQueryList = e =>
	e.nodes.map(e => (e ? (0, exports.generateQuery)(e) : 'not all')).join(', ')
exports.generateQuery = e => {
	var t
	let r = ''
	e.prefix && (r += e.prefix + ' ')
	return (
		(void 0 !== e.prefix || !e.condition || void 0 !== e.type) &&
			((r += null !== (t = e.type) && void 0 !== t ? t : 'all'), e.condition && (r += ' and')),
		e.condition && ('' !== r && (r += ' '), (r += (0, exports.generateCondition)(e.condition))),
		r
	)
}
exports.generateInParens = e =>
	'condition' === e.node._t
		? '(' + (0, exports.generateCondition)(e.node) + ')'
		: 'feature' === e.node._t
			? (0, exports.generateFeature)(e.node)
			: '(general enclosed)'
exports.generateCondition = e => {
	var t
	return 'not' === e.op
		? 'not ' + (0, exports.generateInParens)(e.nodes[0])
		: (null !== (t = e.nodes) && void 0 !== t ? t : [])
				.map(e => `${(0, exports.generateInParens)(e)}`)
				.join(` ${e.op} `)
}
exports.generateFeature = e => {
	let t = '('
	return (
		'boolean' === e.context
			? (t += (0, exports.generateFeatureBoolean)(e))
			: 'value' === e.context
				? (t += (0, exports.generateFeatureValue)(e))
				: (t += (0, exports.generateFeatureRange)(e)),
		(t += ')'),
		t
	)
}
exports.generateFeatureBoolean = e => e.feature
exports.generateFeatureValue = e => e.feature + ': ' + (0, exports.generateValue)(e.value)
exports.generateFeatureRange = e =>
	1 === e.ops
		? (0, exports.generateFeatureSingleRange)(e)
		: (0, exports.generateFeatureDoubleRange)(e)
exports.generateFeatureSingleRange = e =>
	`${e.feature} ${e.op} ${(0, exports.generateValue)(e.value)}`
exports.generateFeatureDoubleRange = e =>
	`${(0, exports.generateValue)(e.minValue)} ${e.minOp} ${e.feature} ${e.maxOp} ${(0, exports.generateValue)(e.maxValue)}`
exports.generateValue = e =>
	'dimension' === e._t
		? (0, exports.generateDimension)(e)
		: 'ident' === e._t
			? (0, exports.generateIdent)(e)
			: 'ratio' === e._t
				? (0, exports.generateRatio)(e)
				: (0, exports.generateNumber)(e)
exports.generateRatio = e => `${e.left}/${e.right}`
exports.generateNumber = e => `${e.value}`
exports.generateDimension = e => `${e.value}${e.unit}`
exports.generateIdent = e => e.value
