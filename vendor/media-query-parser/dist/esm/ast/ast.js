const t = '<'.codePointAt(0),
	n = '>'.codePointAt(0),
	e = '='.codePointAt(0),
	i = '/'.codePointAt(0),
	a = (n, i = 0) => {
		const a = n.at(i)
		if ('delim' === (null == a ? void 0 : a._t) && a.value === t) {
			const t = n.at(i + 1),
				a = 'delim' === (null == t ? void 0 : t._t) && t.value === e && !t.isAfterSpace
			return {t: {t: 'lt', isIncl: a}, i: i + (a ? 2 : 1)}
		}
	},
	o = (t, i = 0) => {
		const a = t.at(i)
		if ('delim' === (null == a ? void 0 : a._t) && a.value === n) {
			const n = t.at(i + 1),
				a = 'delim' === (null == n ? void 0 : n._t) && n.value === e && !n.isAfterSpace
			return {t: {t: 'gt', isIncl: a}, i: i + (a ? 2 : 1)}
		}
	},
	r = (t, n = 0) => {
		var i, r
		return null !== (r = null !== (i = a(t, n)) && void 0 !== i ? i : o(t, n)) && void 0 !== r
			? r
			: ((t, n = 0) => {
					const i = t.at(n)
					if ('delim' === (null == i ? void 0 : i._t) && i.value === e)
						return {t: {t: 'eq'}, i: n + 1}
				})(t, n)
	},
	s = (t, n = 0) => {
		const e = ((t, n = 0) => {
			const e = t.at(n)
			if ('number' === (null == e ? void 0 : e._t) && e.value >= 0) {
				const a = t.at(n + 1)
				if ('delim' === (null == a ? void 0 : a._t) && a.value === i) {
					const i = t.at(n + 2)
					if ('number' === (null == i ? void 0 : i._t) && i.value >= 0)
						return {
							t: {_t: 'ratio', left: e.value, right: i.value, start: e.start, end: i.end},
							i: n + 3
						}
				}
			}
		})(t, n)
		if (e) return e
		const a = t.at(n)
		if (a && ('number' === a._t || 'dimension' === a._t)) {
			return {
				t:
					'number' === a._t
						? {_t: 'number', value: a.value, flag: a.flag, start: a.start, end: a.end}
						: {_t: 'dimension', value: a.value, unit: a.unit, start: a.start, end: a.end},
				i: n + 1
			}
		}
	},
	c = (t, n = 0) => {
		const e = s(t, n)
		if (e) return e
		const i = t.at(n)
		return 'ident' === (null == i ? void 0 : i._t)
			? {t: {_t: 'ident', value: i.value, start: i.start, end: i.end}, i: n + 1}
			: void 0
	}
export const matchPlain = (t, n = 0) => {
	const e = t.at(n)
	if ('ident' === (null == e ? void 0 : e._t)) {
		const i = t.at(n + 1)
		if ('colon' === (null == i ? void 0 : i._t)) {
			const i = c(t, n + 2)
			if (i)
				return {
					t: {
						_t: 'feature',
						context: 'value',
						feature: e.value,
						value: i.t,
						start: e.start,
						end: i.t.end
					},
					i: i.i
				}
		}
	}
}
export const matchBoolean = (t, n = 0) => {
	const e = t.at(n)
	if ('ident' === (null == e ? void 0 : e._t))
		return {
			t: {_t: 'feature', context: 'boolean', feature: e.value, start: e.start, end: e.end},
			i: n + 1
		}
}
export const matchFeature = (t, n = 0) => {
	var e, i
	const s = t.at(n)
	if ('(' === (null == s ? void 0 : s._t)) {
		const s =
			null !==
				(i =
					null !== (e = matchPlain(t, n + 1)) && void 0 !== e
						? e
						: ((t, n = 0) => {
								var e
								const i = c(t, n)
								if (i) {
									const n = r(t, i.i)
									if (n) {
										const r = c(t, n.i)
										if (r) {
											const s = null !== (e = a(t, r.i)) && void 0 !== e ? e : o(t, r.i)
											if (s) {
												const e = c(t, s.i)
												if (e && 'ident' === r.t._t && 'ident' !== i.t._t && 'ident' !== e.t._t) {
													if ('lt' === n.t.t && 'lt' === s.t.t)
														return {
															t: {
																_t: 'feature',
																context: 'range',
																ops: 2,
																feature: r.t.value,
																minValue: i.t,
																minOp: n.t.isIncl ? '<=' : '<',
																maxOp: s.t.isIncl ? '<=' : '<',
																maxValue: e.t,
																start: i.t.start,
																end: e.t.end
															},
															i: e.i
														}
													if ('gt' === n.t.t && 'gt' === s.t.t)
														return {
															t: {
																_t: 'feature',
																context: 'range',
																ops: 2,
																feature: r.t.value,
																minValue: e.t,
																minOp: s.t.isIncl ? '<=' : '<',
																maxOp: n.t.isIncl ? '<=' : '<',
																maxValue: i.t,
																start: i.t.start,
																end: e.t.end
															},
															i: e.i
														}
												}
											}
											let u = '='
											if (
												('lt' === n.t.t
													? (u = n.t.isIncl ? '<=' : '<')
													: 'gt' === n.t.t && (u = n.t.isIncl ? '>=' : '>'),
												'ident' === i.t._t && 'ident' !== r.t._t)
											)
												return {
													t: {
														_t: 'feature',
														context: 'range',
														feature: i.t.value,
														ops: 1,
														op: u,
														value: r.t,
														start: i.t.start,
														end: r.t.end
													},
													i: r.i
												}
											if ('ident' === r.t._t && 'ident' !== i.t._t) {
												let t = '='
												return (
													'<' === u
														? (t = '>')
														: '<=' === u
															? (t = '>=')
															: '>' === u
																? (t = '<')
																: '>=' === u && (t = '<='),
													{
														t: {
															_t: 'feature',
															context: 'range',
															feature: r.t.value,
															ops: 1,
															op: t,
															value: i.t,
															start: i.t.start,
															end: r.t.end
														},
														i: r.i
													}
												)
											}
										}
									}
								}
							})(t, n + 1)) && void 0 !== i
				? i
				: matchBoolean(t, n + 1)
		if (s) {
			const n = t.at(s.i)
			if (')' === (null == n ? void 0 : n._t)) return {t: s.t, i: s.i + 1}
		}
	}
}
export const matchGeneralEnclosed = (t, n = 0) => {
	var e
	const i = t.at(n)
	if (i && ('function' === i._t || '(' === i._t)) {
		const a = ['(']
		let o = n + 1,
			r = t.at(o)
		t: for (; r; ) {
			switch (r._t) {
				case 'function':
				case '(':
					a.push('(')
					break
				case '{':
				case '[':
					a.push(r._t)
					break
				case ')':
					if (('(' === a.at(-1) && a.pop(), 0 === a.length)) break t
					break
				case ']':
					'[' === a.at(-1) && a.pop()
					break
				case '}':
					'{' === a.at(-1) && a.pop()
			}
			r = t.at(++o)
		}
		if (0 === a.length)
			return {
				t: {
					_t: 'general-enclosed',
					tokens: t.slice(n, o),
					start: i.start,
					end: (null !== (e = t.at(o)) && void 0 !== e ? e : t[o - 1]).end
				},
				i: o
			}
	}
}
export const matchInParens = (t, n = 0) => {
	const e = matchFeature(t, n)
	if (e) return {t: {_t: 'in-parens', node: e.t}, i: e.i}
	const i = t.at(n)
	if ('(' === (null == i ? void 0 : i._t)) {
		const e = matchCondition(t, n + 1)
		if (e) {
			const n = t.at(e.i)
			if (')' === (null == n ? void 0 : n._t)) return {t: {_t: 'in-parens', node: e.t}, i: e.i + 1}
		}
	}
	const a = matchGeneralEnclosed(t, n)
	return a ? {t: {_t: 'in-parens', node: a.t}, i: a.i} : void 0
}
export const matchOr = (t, n = 0) => {
	const e = t.at(n)
	if ('ident' === (null == e ? void 0 : e._t) && 'or' === e.value) {
		const e = matchInParens(t, n + 1)
		if (e) return {t: e.t, i: e.i}
	}
}
export const matchAnd = (t, n = 0) => {
	const e = t.at(n)
	if ('ident' === (null == e ? void 0 : e._t) && 'and' === e.value) {
		const e = matchInParens(t, n + 1)
		if (e) return {t: e.t, i: e.i}
	}
}
export const matchNot = (t, n = 0) => {
	const e = t.at(n)
	if ('ident' === (null == e ? void 0 : e._t) && 'not' === e.value) {
		const e = matchInParens(t, n + 1)
		if (e) return {t: e.t, i: e.i}
	}
}
export const matchCondition = (t, n = 0) => {
	const e = matchNot(t, n)
	if (e)
		return {
			t: {_t: 'condition', op: 'not', nodes: [e.t], start: t[n].start, end: t[e.i - 1].end},
			i: e.i
		}
	{
		const e = matchInParens(t, n)
		if (e) {
			const i = matchAnd(t, e.i)
			if (i) {
				const a = [i.t]
				let o = i.i,
					r = matchAnd(t, i.i)
				for (; r; ) a.push(r.t), (o = r.i), (r = matchAnd(t, r.i))
				return {
					t: {_t: 'condition', op: 'and', nodes: [e.t, ...a], start: t[n].start, end: t[o - 1].end},
					i: o
				}
			}
			const a = matchOr(t, e.i)
			if (a) {
				const i = [a.t]
				let o = a.i,
					r = matchOr(t, a.i)
				for (; r; ) i.push(r.t), (o = r.i), (r = matchOr(t, r.i))
				return {
					t: {_t: 'condition', op: 'or', nodes: [e.t, ...i], start: t[n].start, end: t[o - 1].end},
					i: o
				}
			}
			return {
				t: {_t: 'condition', op: 'and', nodes: [e.t], start: t[n].start, end: t[e.i - 1].end},
				i: e.i
			}
		}
	}
}
export const matchConditionWithoutOr = (t, n = 0) => {
	const e = matchNot(t, n)
	if (e)
		return {
			t: {_t: 'condition', op: 'not', nodes: [e.t], start: t[n].start, end: t[e.i - 1].end},
			i: e.i
		}
	{
		const e = matchInParens(t, n)
		if (e) {
			const i = matchAnd(t, e.i)
			if (i) {
				const a = [i.t]
				let o = i.i,
					r = matchAnd(t, i.i)
				for (; r; ) a.push(r.t), (o = r.i), (r = matchAnd(t, r.i))
				return {
					t: {_t: 'condition', op: 'and', nodes: [e.t, ...a], start: t[n].start, end: t[o - 1].end},
					i: o
				}
			}
			return {
				t: {_t: 'condition', op: 'and', nodes: [e.t], start: t[n].start, end: t[e.i - 1].end},
				i: e.i
			}
		}
	}
}
export const matchQuery = t => {
	const n = matchCondition(t, 0)
	if (n) return {t: {_t: 'query', condition: n.t, start: 0, end: t[n.i - 1].end}, i: n.i}
	{
		const n = t.at(0)
		if ('ident' === (null == n ? void 0 : n._t)) {
			if ('not' === n.value || 'only' === n.value) {
				const e = t.at(1)
				if ('ident' === (null == e ? void 0 : e._t)) {
					const i = t.at(2)
					if ('ident' === (null == i ? void 0 : i._t) && 'and' === i.value) {
						const i = matchConditionWithoutOr(t, 3)
						if (i)
							return {
								t: {
									_t: 'query',
									condition: i.t,
									type: e.value,
									prefix: n.value,
									start: 0,
									end: t[i.i - 1].end
								},
								i: i.i
							}
					}
					return {t: {_t: 'query', type: e.value, prefix: n.value, start: 0, end: e.end}, i: 2}
				}
			}
			const e = t.at(1)
			if ('ident' === (null == e ? void 0 : e._t) && 'and' === e.value) {
				const e = matchConditionWithoutOr(t, 2)
				if (e)
					return {
						t: {_t: 'query', condition: e.t, type: n.value, start: 0, end: t[e.i - 1].end},
						i: e.i
					}
			}
			return {t: {_t: 'query', type: n.value, start: 0, end: n.end}, i: 1}
		}
	}
}
export const matchQueryList = t => {
	const n = splitMediaQueryList(t)
	if (1 === n.length && 0 === n[0].length)
		return {_t: 'query-list', nodes: [{_t: 'query', type: 'all', start: 0, end: 0}]}
	{
		const t = []
		for (const e of n) {
			const n = matchQuery(e)
			n && n.i === e.length ? t.push(n.t) : t.push(void 0)
		}
		return {_t: 'query-list', nodes: t}
	}
}
export const splitMediaQueryList = t => {
	const n = [[]],
		e = []
	for (const i of t)
		if ('comma' === i._t && 0 === e.length) n.push([])
		else {
			switch (i._t) {
				case 'function':
				case '(':
					e.push(')')
					break
				case '[':
					e.push(']')
					break
				case '{':
					e.push('}')
					break
				case ')':
				case ']':
				case '}':
					e.at(-1) === i._t && e.pop()
					break
			}
			n[n.length - 1].push(i)
		}
	return n
}
