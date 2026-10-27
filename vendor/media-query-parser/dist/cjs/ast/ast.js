Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.splitMediaQueryList =
		exports.matchQueryList =
		exports.matchQuery =
		exports.matchConditionWithoutOr =
		exports.matchCondition =
		exports.matchNot =
		exports.matchAnd =
		exports.matchOr =
		exports.matchInParens =
		exports.matchGeneralEnclosed =
		exports.matchFeature =
		exports.matchBoolean =
		exports.matchPlain =
			void 0)
const t = '<'.codePointAt(0),
	e = '>'.codePointAt(0),
	n = '='.codePointAt(0),
	i = '/'.codePointAt(0),
	o = (e, i = 0) => {
		const o = e.at(i)
		if ('delim' === (null == o ? void 0 : o._t) && o.value === t) {
			const t = e.at(i + 1),
				o = 'delim' === (null == t ? void 0 : t._t) && t.value === n && !t.isAfterSpace
			return {t: {t: 'lt', isIncl: o}, i: i + (o ? 2 : 1)}
		}
	},
	r = (t, i = 0) => {
		const o = t.at(i)
		if ('delim' === (null == o ? void 0 : o._t) && o.value === e) {
			const e = t.at(i + 1),
				o = 'delim' === (null == e ? void 0 : e._t) && e.value === n && !e.isAfterSpace
			return {t: {t: 'gt', isIncl: o}, i: i + (o ? 2 : 1)}
		}
	},
	a = (t, e = 0) => {
		var i, a
		return null !== (a = null !== (i = o(t, e)) && void 0 !== i ? i : r(t, e)) && void 0 !== a
			? a
			: ((t, e = 0) => {
					const i = t.at(e)
					if ('delim' === (null == i ? void 0 : i._t) && i.value === n)
						return {t: {t: 'eq'}, i: e + 1}
				})(t, e)
	},
	s = (t, e = 0) => {
		const n = ((t, e = 0) => {
			const n = t.at(e)
			if ('number' === (null == n ? void 0 : n._t) && n.value >= 0) {
				const o = t.at(e + 1)
				if ('delim' === (null == o ? void 0 : o._t) && o.value === i) {
					const i = t.at(e + 2)
					if ('number' === (null == i ? void 0 : i._t) && i.value >= 0)
						return {
							t: {_t: 'ratio', left: n.value, right: i.value, start: n.start, end: i.end},
							i: e + 3
						}
				}
			}
		})(t, e)
		if (n) return n
		const o = t.at(e)
		if (o && ('number' === o._t || 'dimension' === o._t)) {
			return {
				t:
					'number' === o._t
						? {_t: 'number', value: o.value, flag: o.flag, start: o.start, end: o.end}
						: {_t: 'dimension', value: o.value, unit: o.unit, start: o.start, end: o.end},
				i: e + 1
			}
		}
	},
	u = (t, e = 0) => {
		const n = s(t, e)
		if (n) return n
		const i = t.at(e)
		return 'ident' === (null == i ? void 0 : i._t)
			? {t: {_t: 'ident', value: i.value, start: i.start, end: i.end}, i: e + 1}
			: void 0
	}
exports.matchPlain = (t, e = 0) => {
	const n = t.at(e)
	if ('ident' === (null == n ? void 0 : n._t)) {
		const i = t.at(e + 1)
		if ('colon' === (null == i ? void 0 : i._t)) {
			const i = u(t, e + 2)
			if (i)
				return {
					t: {
						_t: 'feature',
						context: 'value',
						feature: n.value,
						value: i.t,
						start: n.start,
						end: i.t.end
					},
					i: i.i
				}
		}
	}
}
exports.matchBoolean = (t, e = 0) => {
	const n = t.at(e)
	if ('ident' === (null == n ? void 0 : n._t))
		return {
			t: {_t: 'feature', context: 'boolean', feature: n.value, start: n.start, end: n.end},
			i: e + 1
		}
}
exports.matchFeature = (t, e = 0) => {
	var n, i
	const s = t.at(e)
	if ('(' === (null == s ? void 0 : s._t)) {
		const s =
			null !==
				(i =
					null !== (n = (0, exports.matchPlain)(t, e + 1)) && void 0 !== n
						? n
						: ((t, e = 0) => {
								var n
								const i = u(t, e)
								if (i) {
									const e = a(t, i.i)
									if (e) {
										const a = u(t, e.i)
										if (a) {
											const s = null !== (n = o(t, a.i)) && void 0 !== n ? n : r(t, a.i)
											if (s) {
												const n = u(t, s.i)
												if (n && 'ident' === a.t._t && 'ident' !== i.t._t && 'ident' !== n.t._t) {
													if ('lt' === e.t.t && 'lt' === s.t.t)
														return {
															t: {
																_t: 'feature',
																context: 'range',
																ops: 2,
																feature: a.t.value,
																minValue: i.t,
																minOp: e.t.isIncl ? '<=' : '<',
																maxOp: s.t.isIncl ? '<=' : '<',
																maxValue: n.t,
																start: i.t.start,
																end: n.t.end
															},
															i: n.i
														}
													if ('gt' === e.t.t && 'gt' === s.t.t)
														return {
															t: {
																_t: 'feature',
																context: 'range',
																ops: 2,
																feature: a.t.value,
																minValue: n.t,
																minOp: s.t.isIncl ? '<=' : '<',
																maxOp: e.t.isIncl ? '<=' : '<',
																maxValue: i.t,
																start: i.t.start,
																end: n.t.end
															},
															i: n.i
														}
												}
											}
											let c = '='
											if (
												('lt' === e.t.t
													? (c = e.t.isIncl ? '<=' : '<')
													: 'gt' === e.t.t && (c = e.t.isIncl ? '>=' : '>'),
												'ident' === i.t._t && 'ident' !== a.t._t)
											)
												return {
													t: {
														_t: 'feature',
														context: 'range',
														feature: i.t.value,
														ops: 1,
														op: c,
														value: a.t,
														start: i.t.start,
														end: a.t.end
													},
													i: a.i
												}
											if ('ident' === a.t._t && 'ident' !== i.t._t) {
												let t = '='
												return (
													'<' === c
														? (t = '>')
														: '<=' === c
															? (t = '>=')
															: '>' === c
																? (t = '<')
																: '>=' === c && (t = '<='),
													{
														t: {
															_t: 'feature',
															context: 'range',
															feature: a.t.value,
															ops: 1,
															op: t,
															value: i.t,
															start: i.t.start,
															end: a.t.end
														},
														i: a.i
													}
												)
											}
										}
									}
								}
							})(t, e + 1)) && void 0 !== i
				? i
				: (0, exports.matchBoolean)(t, e + 1)
		if (s) {
			const e = t.at(s.i)
			if (')' === (null == e ? void 0 : e._t)) return {t: s.t, i: s.i + 1}
		}
	}
}
exports.matchGeneralEnclosed = (t, e = 0) => {
	var n
	const i = t.at(e)
	if (i && ('function' === i._t || '(' === i._t)) {
		const o = ['(']
		let r = e + 1,
			a = t.at(r)
		t: for (; a; ) {
			switch (a._t) {
				case 'function':
				case '(':
					o.push('(')
					break
				case '{':
				case '[':
					o.push(a._t)
					break
				case ')':
					if (('(' === o.at(-1) && o.pop(), 0 === o.length)) break t
					break
				case ']':
					'[' === o.at(-1) && o.pop()
					break
				case '}':
					'{' === o.at(-1) && o.pop()
			}
			a = t.at(++r)
		}
		if (0 === o.length)
			return {
				t: {
					_t: 'general-enclosed',
					tokens: t.slice(e, r),
					start: i.start,
					end: (null !== (n = t.at(r)) && void 0 !== n ? n : t[r - 1]).end
				},
				i: r
			}
	}
}
exports.matchInParens = (t, e = 0) => {
	const n = (0, exports.matchFeature)(t, e)
	if (n) return {t: {_t: 'in-parens', node: n.t}, i: n.i}
	const i = t.at(e)
	if ('(' === (null == i ? void 0 : i._t)) {
		const n = (0, exports.matchCondition)(t, e + 1)
		if (n) {
			const e = t.at(n.i)
			if (')' === (null == e ? void 0 : e._t)) return {t: {_t: 'in-parens', node: n.t}, i: n.i + 1}
		}
	}
	const o = (0, exports.matchGeneralEnclosed)(t, e)
	return o ? {t: {_t: 'in-parens', node: o.t}, i: o.i} : void 0
}
exports.matchOr = (t, e = 0) => {
	const n = t.at(e)
	if ('ident' === (null == n ? void 0 : n._t) && 'or' === n.value) {
		const n = (0, exports.matchInParens)(t, e + 1)
		if (n) return {t: n.t, i: n.i}
	}
}
exports.matchAnd = (t, e = 0) => {
	const n = t.at(e)
	if ('ident' === (null == n ? void 0 : n._t) && 'and' === n.value) {
		const n = (0, exports.matchInParens)(t, e + 1)
		if (n) return {t: n.t, i: n.i}
	}
}
exports.matchNot = (t, e = 0) => {
	const n = t.at(e)
	if ('ident' === (null == n ? void 0 : n._t) && 'not' === n.value) {
		const n = (0, exports.matchInParens)(t, e + 1)
		if (n) return {t: n.t, i: n.i}
	}
}
exports.matchCondition = (t, e = 0) => {
	const n = (0, exports.matchNot)(t, e)
	if (n)
		return {
			t: {_t: 'condition', op: 'not', nodes: [n.t], start: t[e].start, end: t[n.i - 1].end},
			i: n.i
		}
	{
		const n = (0, exports.matchInParens)(t, e)
		if (n) {
			const i = (0, exports.matchAnd)(t, n.i)
			if (i) {
				const o = [i.t]
				let r = i.i,
					a = (0, exports.matchAnd)(t, i.i)
				for (; a; ) o.push(a.t), (r = a.i), (a = (0, exports.matchAnd)(t, a.i))
				return {
					t: {_t: 'condition', op: 'and', nodes: [n.t, ...o], start: t[e].start, end: t[r - 1].end},
					i: r
				}
			}
			const o = (0, exports.matchOr)(t, n.i)
			if (o) {
				const i = [o.t]
				let r = o.i,
					a = (0, exports.matchOr)(t, o.i)
				for (; a; ) i.push(a.t), (r = a.i), (a = (0, exports.matchOr)(t, a.i))
				return {
					t: {_t: 'condition', op: 'or', nodes: [n.t, ...i], start: t[e].start, end: t[r - 1].end},
					i: r
				}
			}
			return {
				t: {_t: 'condition', op: 'and', nodes: [n.t], start: t[e].start, end: t[n.i - 1].end},
				i: n.i
			}
		}
	}
}
exports.matchConditionWithoutOr = (t, e = 0) => {
	const n = (0, exports.matchNot)(t, e)
	if (n)
		return {
			t: {_t: 'condition', op: 'not', nodes: [n.t], start: t[e].start, end: t[n.i - 1].end},
			i: n.i
		}
	{
		const n = (0, exports.matchInParens)(t, e)
		if (n) {
			const i = (0, exports.matchAnd)(t, n.i)
			if (i) {
				const o = [i.t]
				let r = i.i,
					a = (0, exports.matchAnd)(t, i.i)
				for (; a; ) o.push(a.t), (r = a.i), (a = (0, exports.matchAnd)(t, a.i))
				return {
					t: {_t: 'condition', op: 'and', nodes: [n.t, ...o], start: t[e].start, end: t[r - 1].end},
					i: r
				}
			}
			return {
				t: {_t: 'condition', op: 'and', nodes: [n.t], start: t[e].start, end: t[n.i - 1].end},
				i: n.i
			}
		}
	}
}
exports.matchQuery = t => {
	const e = (0, exports.matchCondition)(t, 0)
	if (e) return {t: {_t: 'query', condition: e.t, start: 0, end: t[e.i - 1].end}, i: e.i}
	{
		const e = t.at(0)
		if ('ident' === (null == e ? void 0 : e._t)) {
			if ('not' === e.value || 'only' === e.value) {
				const n = t.at(1)
				if ('ident' === (null == n ? void 0 : n._t)) {
					const i = t.at(2)
					if ('ident' === (null == i ? void 0 : i._t) && 'and' === i.value) {
						const i = (0, exports.matchConditionWithoutOr)(t, 3)
						if (i)
							return {
								t: {
									_t: 'query',
									condition: i.t,
									type: n.value,
									prefix: e.value,
									start: 0,
									end: t[i.i - 1].end
								},
								i: i.i
							}
					}
					return {t: {_t: 'query', type: n.value, prefix: e.value, start: 0, end: n.end}, i: 2}
				}
			}
			const n = t.at(1)
			if ('ident' === (null == n ? void 0 : n._t) && 'and' === n.value) {
				const n = (0, exports.matchConditionWithoutOr)(t, 2)
				if (n)
					return {
						t: {_t: 'query', condition: n.t, type: e.value, start: 0, end: t[n.i - 1].end},
						i: n.i
					}
			}
			return {t: {_t: 'query', type: e.value, start: 0, end: e.end}, i: 1}
		}
	}
}
exports.matchQueryList = t => {
	const e = (0, exports.splitMediaQueryList)(t)
	if (1 === e.length && 0 === e[0].length)
		return {_t: 'query-list', nodes: [{_t: 'query', type: 'all', start: 0, end: 0}]}
	{
		const t = []
		for (const n of e) {
			const e = (0, exports.matchQuery)(n)
			e && e.i === n.length ? t.push(e.t) : t.push(void 0)
		}
		return {_t: 'query-list', nodes: t}
	}
}
exports.splitMediaQueryList = t => {
	const e = [[]],
		n = []
	for (const i of t)
		if ('comma' === i._t && 0 === n.length) e.push([])
		else {
			switch (i._t) {
				case 'function':
				case '(':
					n.push(')')
					break
				case '[':
					n.push(']')
					break
				case '{':
					n.push('}')
					break
				case ')':
				case ']':
				case '}':
					n.at(-1) === i._t && n.pop()
					break
			}
			e[e.length - 1].push(i)
		}
	return e
}
