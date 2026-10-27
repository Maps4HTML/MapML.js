export const convertToParserTokens = e => {
	const r = []
	let t = !1
	for (const s of e)
		switch (s._t) {
			case '{':
				return {_errid: 'NO_LCURLY', start: s.start, end: s.end}
			case 'semicolon':
				return {_errid: 'NO_SEMICOLON', start: s.start, end: s.end}
			case 'whitespace':
				t = !0
				break
			case 'EOF':
				break
			default:
				r.push({...s, isAfterSpace: t}), (t = !1)
		}
	return r
}
