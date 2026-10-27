import { LexerToken, ParserToken, ParserError } from "../utils.js";
export declare const convertToParserTokens: (cssTokens: LexerToken[]) => ParserToken[] | ParserError;
