import {isParserError as e, parseMediaQuery as r} from 'media-query-parser'
import {and as o, createSolverConfig as i, not as t} from './solveMediaQueryList.js'
import {solveMediaCondition_ as s} from './solveMediaCondition.js'
export const solveMediaQuery = (o, t) => {
	const s = 'string' == typeof o ? r(o) : o
	return e(s) ? 'false' : solveMediaQuery_(s, i(t))
}
export const solveMediaQuery_ = (e, r) => {
	if ('true' === r.isLegacyBrowser && 'only' === e.prefix) return 'false'
	let i
	i =
		void 0 === e.type || 'all' === e.type
			? 'true'
			: 'screen' === e.type
				? r.isMediaTypeScreen
				: 'print' === e.type
					? t(r.isMediaTypeScreen)
					: 'false'
	const n = void 0 === e.condition ? 'true' : s(e.condition, r),
		p = o(i, n)
	return 'not' === e.prefix ? t(p) : p
}
