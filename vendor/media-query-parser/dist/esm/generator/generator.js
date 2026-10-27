export const generateQueryList = e =>
	e.nodes.map(e => (e ? generateQuery(e) : 'not all')).join(', ')
export const generateQuery = e => {
	var t
	let n = ''
	e.prefix && (n += e.prefix + ' ')
	return (
		(void 0 !== e.prefix || !e.condition || void 0 !== e.type) &&
			((n += null !== (t = e.type) && void 0 !== t ? t : 'all'), e.condition && (n += ' and')),
		e.condition && ('' !== n && (n += ' '), (n += generateCondition(e.condition))),
		n
	)
}
export const generateInParens = e =>
	'condition' === e.node._t
		? '(' + generateCondition(e.node) + ')'
		: 'feature' === e.node._t
			? generateFeature(e.node)
			: '(general enclosed)'
export const generateCondition = e => {
	var t
	return 'not' === e.op
		? 'not ' + generateInParens(e.nodes[0])
		: (null !== (t = e.nodes) && void 0 !== t ? t : [])
				.map(e => `${generateInParens(e)}`)
				.join(` ${e.op} `)
}
export const generateFeature = e => {
	let t = '('
	return (
		'boolean' === e.context
			? (t += generateFeatureBoolean(e))
			: 'value' === e.context
				? (t += generateFeatureValue(e))
				: (t += generateFeatureRange(e)),
		(t += ')'),
		t
	)
}
export const generateFeatureBoolean = e => e.feature
export const generateFeatureValue = e => e.feature + ': ' + generateValue(e.value)
export const generateFeatureRange = e =>
	1 === e.ops ? generateFeatureSingleRange(e) : generateFeatureDoubleRange(e)
export const generateFeatureSingleRange = e => `${e.feature} ${e.op} ${generateValue(e.value)}`
export const generateFeatureDoubleRange = e =>
	`${generateValue(e.minValue)} ${e.minOp} ${e.feature} ${e.maxOp} ${generateValue(e.maxValue)}`
export const generateValue = e =>
	'dimension' === e._t
		? generateDimension(e)
		: 'ident' === e._t
			? generateIdent(e)
			: 'ratio' === e._t
				? generateRatio(e)
				: generateNumber(e)
export const generateRatio = e => `${e.left}/${e.right}`
export const generateNumber = e => `${e.value}`
export const generateDimension = e => `${e.value}${e.unit}`
export const generateIdent = e => e.value
