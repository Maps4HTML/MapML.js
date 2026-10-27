import {isParserError as o} from '../utils.js'
import {readCodepoints as r} from './codepoints.js'
import {convertToParserTokens as s} from './process.js'
import {codepointsToTokens as t} from './tokens.js'
export const lexer = m => {
	const e = t(r(m))
	return o(e) ? e : s(e)
}
