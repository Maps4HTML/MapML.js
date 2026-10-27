let e
export const readCodepoints = s => {
	const t = (() => {
			let s
			return e ? (s = e) : ((s = new TextEncoder()), (e = s)), s
		})().encode(s),
		r = [],
		a = t.length
	for (let e = 0; e < a; e += 1) {
		const s = t.at(e)
		if (s < 128)
			switch (s) {
				case 0:
					r.push(65533)
					break
				case 12:
					r.push(10)
					break
				case 13:
					r.push(10), 10 === t.at(e + 1) && (e += 1)
					break
				default:
					r.push(s)
			}
		else
			s < 224
				? r.push(((s << 59) >>> 53) | ((t[++e] << 58) >>> 58))
				: s < 240
					? r.push(((s << 60) >>> 48) | ((t[++e] << 58) >>> 52) | ((t[++e] << 58) >>> 58))
					: r.push(
							((s << 61) >>> 43) |
								((t[++e] << 58) >>> 46) |
								((t[++e] << 58) >>> 52) |
								((t[++e] << 58) >>> 58)
						)
	}
	return r
}
