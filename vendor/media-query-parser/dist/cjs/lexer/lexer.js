Object.defineProperty(exports, '__esModule', {value: !0}), (exports.lexer = void 0)
const e = require('../utils.js'),
	r = require('./codepoints.js'),
	o = require('./process.js'),
	s = require('./tokens.js')
exports.lexer = t => {
	const i = (0, s.codepointsToTokens)((0, r.readCodepoints)(t))
	return (0, e.isParserError)(i) ? i : (0, o.convertToParserTokens)(i)
}
