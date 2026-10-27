Object.defineProperty(exports, '__esModule', {value: !0}),
	(exports.consumeIdentLike =
		exports.consumeUrl =
		exports.consumeIdent =
		exports.consumeIdentUnsafe =
		exports.consumeNumber =
		exports.consumeNumeric =
		exports.consumeEscape =
		exports.wouldStartIdentifier =
		exports.consumeString =
		exports.codepointsToTokens =
			void 0)
const t = 10,
	e = 32,
	n = 45,
	s = 48,
	r = 57,
	u = 65,
	o = 92,
	l = 97,
	i = 122,
	a = 128
exports.codepointsToTokens = (f, c = 0) => {
	const p = []
	for (; c < f.length; c += 1) {
		const d = f.at(c),
			m = c
		if (47 === d && 42 === f.at(c + 1)) {
			c += 2
			for (let t = f.at(c); void 0 !== t; t = f.at(++c))
				if (42 === t && 47 === f.at(c + 1)) {
					c += 1
					break
				}
		} else if (9 === d || d === e || d === t) {
			let n = f.at(++c)
			for (; 9 === n || n === e || n === t; ) n = f.at(++c)
			c -= 1
			const s = p.at(-1)
			'whitespace' === (null == s ? void 0 : s._t)
				? (p.pop(), p.push({_t: 'whitespace', start: s.start, end: c}))
				: p.push({_t: 'whitespace', start: m, end: c})
		} else if (34 === d) {
			const t = (0, exports.consumeString)(f, c)
			if (null === t) return {_errid: 'INVALID_STRING', start: c, end: c}
			const [e, n] = t
			;(c = e), p.push({_t: 'string', value: n, start: m, end: c})
		} else if (35 === d) {
			if (c + 1 < f.length) {
				const e = f.at(c + 1)
				if (
					95 === e ||
					(e >= u && e <= 90) ||
					(e >= l && e <= i) ||
					e >= a ||
					(e >= s && e <= r) ||
					(e === o && c + 2 < f.length && f.at(c + 2) !== t)
				) {
					const t = (0, exports.wouldStartIdentifier)(f, c + 1) ? 'id' : 'unrestricted',
						e = (0, exports.consumeIdentUnsafe)(f, c + 1)
					if (null !== e) {
						const [n, s] = e
						;(c = n), p.push({_t: 'hash', value: s.toLowerCase(), flag: t, start: m, end: c})
						continue
					}
				}
			}
			p.push({_t: 'delim', value: d, start: m, end: c})
		} else if (39 === d) {
			const t = (0, exports.consumeString)(f, c)
			if (null === t) return {_errid: 'INVALID_STRING', start: c, end: c}
			const [e, n] = t
			;(c = e), p.push({_t: 'string', value: n, start: m, end: c})
		} else if (40 === d) p.push({_t: '(', start: m, end: c})
		else if (41 === d) p.push({_t: ')', start: m, end: c})
		else if (43 === d) {
			const t = (0, exports.consumeNumeric)(f, c)
			if (null === t) p.push({_t: 'delim', value: d, start: m, end: c})
			else {
				const [e, n] = t
				;(c = e),
					'dimension' === n[0]
						? p.push({
								_t: 'dimension',
								value: n[1],
								unit: n[2].toLowerCase(),
								flag: 'number',
								start: m,
								end: c
							})
						: 'number' === n[0]
							? p.push({_t: n[0], value: n[1], flag: n[2], start: m, end: c})
							: p.push({_t: n[0], value: n[1], flag: 'number', start: m, end: c})
			}
		} else if (44 === d) p.push({_t: 'comma', start: m, end: c})
		else if (d === n) {
			const t = (0, exports.consumeNumeric)(f, c)
			if (null !== t) {
				const [e, n] = t
				;(c = e),
					'dimension' === n[0]
						? p.push({
								_t: 'dimension',
								value: n[1],
								unit: n[2].toLowerCase(),
								flag: 'number',
								start: m,
								end: c
							})
						: 'number' === n[0]
							? p.push({_t: n[0], value: n[1], flag: n[2], start: m, end: c})
							: p.push({_t: n[0], value: n[1], flag: 'number', start: m, end: c})
				continue
			}
			if (c + 2 < f.length) {
				const t = f.at(c + 1),
					e = f.at(c + 2)
				if (t === n && 62 === e) {
					;(c += 2), p.push({_t: 'CDC', start: m, end: c})
					continue
				}
			}
			const e = (0, exports.consumeIdentLike)(f, c)
			if (null !== e) {
				const [t, n, s] = e
				;(c = t), p.push({_t: s, value: n, start: m, end: c})
				continue
			}
			p.push({_t: 'delim', value: d, start: m, end: c})
		} else if (46 === d) {
			const t = (0, exports.consumeNumeric)(f, c)
			if (null !== t) {
				const [e, n] = t
				;(c = e),
					'dimension' === n[0]
						? p.push({
								_t: 'dimension',
								value: n[1],
								unit: n[2].toLowerCase(),
								flag: 'number',
								start: m,
								end: c
							})
						: 'number' === n[0]
							? p.push({_t: n[0], value: n[1], flag: n[2], start: m, end: c})
							: p.push({_t: n[0], value: n[1], flag: 'number', start: m, end: c})
				continue
			}
			p.push({_t: 'delim', value: d, start: m, end: c})
		} else if (58 === d) p.push({_t: 'colon', start: m, end: c})
		else if (59 === d) p.push({_t: 'semicolon', start: m, end: c})
		else if (60 === d) {
			if (c + 3 < f.length) {
				const t = f.at(c + 1),
					e = f.at(c + 2),
					s = f.at(c + 3)
				if (33 === t && e === n && s === n) {
					;(c += 3), p.push({_t: 'CDO', start: m, end: c})
					continue
				}
			}
			p.push({_t: 'delim', value: d, start: m, end: c})
		} else if (64 === d) {
			const t = (0, exports.consumeIdent)(f, c + 1)
			if (null !== t) {
				const [e, n] = t
				;(c = e), p.push({_t: 'at-keyword', value: n.toLowerCase(), start: m, end: c})
				continue
			}
			p.push({_t: 'delim', value: d, start: m, end: c})
		} else if (91 === d) p.push({_t: '[', start: m, end: c})
		else if (93 === d) p.push({_t: ']', start: m, end: c})
		else if (123 === d) p.push({_t: '{', start: m, end: c})
		else if (125 === d) p.push({_t: '}', start: m, end: c})
		else if (d >= s && d <= r) {
			const t = (0, exports.consumeNumeric)(f, c),
				[e, n] = t
			;(c = e),
				'dimension' === n[0]
					? p.push({
							_t: 'dimension',
							value: n[1],
							unit: n[2].toLowerCase(),
							flag: 'number',
							start: m,
							end: c
						})
					: 'number' === n[0]
						? p.push({_t: n[0], value: n[1], flag: n[2], start: m, end: c})
						: p.push({_t: n[0], value: n[1], flag: 'number', start: m, end: c})
		} else if (95 === d || (d >= u && d <= 90) || (d >= l && d <= i) || d >= a || d === o) {
			const t = (0, exports.consumeIdentLike)(f, c)
			if (null === t) p.push({_t: 'delim', value: d, start: m, end: c})
			else {
				const [e, n, s] = t
				;(c = e), p.push({_t: s, value: n, start: m, end: c})
			}
		} else p.push({_t: 'delim', value: d, start: m, end: c})
	}
	return p.push({_t: 'EOF', start: c, end: c}), p
}
exports.consumeString = (e, n) => {
	if (e.length <= n + 1) return null
	const s = e.at(n),
		r = []
	for (let u = n + 1; u < e.length; u += 1) {
		const n = e.at(u)
		if (n === s) return [u, String.fromCodePoint(...r)]
		if (n === o) {
			const t = (0, exports.consumeEscape)(e, u)
			if (null === t) return null
			const [n, s] = t
			r.push(s), (u = n)
		} else {
			if (n === t) return null
			r.push(n)
		}
	}
	return null
}
exports.wouldStartIdentifier = (e, s) => {
	const r = e.at(s)
	if (void 0 === r) return !1
	if (r === n) {
		const r = e.at(s + 1)
		if (void 0 === r) return !1
		if (r === n || 95 === r || (r >= u && r <= 90) || (r >= l && r <= i) || r >= a) return !0
		if (r === o) {
			if (e.length <= s + 2) return !1
			return e.at(s + 2) !== t
		}
		return !1
	}
	if (95 === r || (r >= u && r <= 90) || (r >= l && r <= i) || r >= a) return !0
	if (r === o) {
		if (e.length <= s + 1) return !1
		return e.at(s + 1) !== t
	}
	return !1
}
exports.consumeEscape = (n, i) => {
	if (n.length <= i + 1) return null
	if (n.at(i) !== o) return null
	const a = n.at(i + 1)
	if (a === t) return null
	if ((a >= s && a <= r) || (a >= u && a <= 70) || (a >= l && a <= 102)) {
		const o = [a],
			f = Math.min(i + 7, n.length)
		let c = i + 2
		for (; c < f; c += 1) {
			const t = n.at(c)
			if (!((t >= s && t <= r) || (t >= u && t <= 70) || (t >= l && t <= 102))) break
			o.push(t)
		}
		if (c < n.length) {
			const s = n.at(c)
			;(9 !== s && s !== e && s !== t) || (c += 1)
		}
		return [c - 1, Number.parseInt(String.fromCodePoint(...o), 16)]
	}
	return [i + 1, a]
}
exports.consumeNumeric = (t, e) => {
	const n = (0, exports.consumeNumber)(t, e)
	if (null === n) return null
	const [s, r, u] = n,
		o = (0, exports.consumeIdent)(t, s + 1)
	if (null !== o) {
		const [t, e] = o
		return [t, ['dimension', r, e]]
	}
	return s + 1 < t.length && 37 === t.at(s + 1) ? [s + 1, ['percentage', r]] : [s, ['number', r, u]]
}
exports.consumeNumber = (t, e) => {
	const u = t.at(e)
	if (void 0 === u) return null
	let o = 'integer'
	const l = []
	for ((43 !== u && u !== n) || ((e += 1), u === n && l.push(n)); e < t.length; ) {
		const n = t.at(e)
		if (!(n >= s && n <= r)) break
		l.push(n), (e += 1)
	}
	if (e + 1 < t.length) {
		const n = t.at(e),
			u = t.at(e + 1)
		if (46 === n && u >= s && u <= r)
			for (l.push(n, u), o = 'number', e += 2; e < t.length; ) {
				const n = t.at(e)
				if (!(n >= s && n <= r)) break
				l.push(n), (e += 1)
			}
	}
	if (e + 1 < t.length) {
		const u = t.at(e),
			i = t.at(e + 1),
			a = t.at(e + 2)
		if (69 === u || 101 === u) {
			let u = !1
			if (
				(i >= s && i <= r
					? (l.push(69, i), (e += 2), (u = !0))
					: (i === n || 43 === i) &&
						void 0 !== a &&
						a >= s &&
						a <= r &&
						(l.push(69), i === n && l.push(n), l.push(a), (e += 3), (u = !0)),
				u)
			)
				for (o = 'number'; e < t.length; ) {
					const n = t.at(e)
					if (!(n >= s && n <= r)) break
					l.push(n), (e += 1)
				}
		}
	}
	const i = String.fromCodePoint(...l)
	let a = 'number' === o ? Number.parseFloat(i) : Number.parseInt(i)
	return 0 === a && (a = 0), Number.isNaN(a) ? null : [e - 1, a, o]
}
exports.consumeIdentUnsafe = (t, e) => {
	if (t.length <= e) return null
	const o = []
	for (let f = t.at(e); e < t.length; f = t.at(++e)) {
		if (
			!(
				f === n ||
				95 === f ||
				(f >= u && f <= 90) ||
				(f >= l && f <= i) ||
				f >= a ||
				(f >= s && f <= r)
			)
		) {
			{
				const n = (0, exports.consumeEscape)(t, e)
				if (null !== n) {
					const [t, s] = n
					o.push(s), (e = t)
					continue
				}
			}
			break
		}
		o.push(f)
	}
	return 0 === e ? null : [e - 1, String.fromCodePoint(...o)]
}
exports.consumeIdent = (t, e) =>
	(0, exports.wouldStartIdentifier)(t, e) ? (0, exports.consumeIdentUnsafe)(t, e) : null
exports.consumeUrl = (n, s) => {
	let r = n.at(s)
	for (; 9 === r || r === e || r === t; ) r = n.at(++s)
	const u = []
	let l = !1
	for (; s < n.length; ) {
		if (41 === r) return [s, String.fromCodePoint(...u)]
		if (34 === r || 39 === r || 40 === r) return null
		if (9 === r || r === e || r === t) !l && u.length > 0 && (l = !0)
		else if (r === o) {
			const t = (0, exports.consumeEscape)(n, s)
			if (null === t || l) return null
			const [e, r] = t
			u.push(r), (s = e)
		} else {
			if (l) return null
			u.push(r)
		}
		r = n.at(++s)
	}
	return null
}
exports.consumeIdentLike = (n, s) => {
	const r = (0, exports.consumeIdent)(n, s)
	if (null === r) return null
	const [u, o] = r
	if ('url' === o.toLowerCase()) {
		if (n.length > u + 1) {
			if (40 === n.at(u + 1)) {
				for (let s = 2; u + s < n.length; s += 1) {
					const r = n.at(u + s)
					if (34 === r || 39 === r) return [u + 1, o.toLowerCase(), 'function']
					if (9 !== r && r !== e && r !== t) {
						const t = (0, exports.consumeUrl)(n, u + s)
						if (null === t) return null
						const [e, r] = t
						return [e, r, 'url']
					}
				}
				return [u + 1, o.toLowerCase(), 'function']
			}
		}
	} else if (n.length > u + 1) {
		if (40 === n.at(u + 1)) return [u + 1, o.toLowerCase(), 'function']
	}
	return [u, o.toLowerCase(), 'ident']
}
