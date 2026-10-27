import { ParserToken, ParserError } from "../utils.js";
export declare const lexer: (cssStr: string) => ParserToken[] | ParserError;
