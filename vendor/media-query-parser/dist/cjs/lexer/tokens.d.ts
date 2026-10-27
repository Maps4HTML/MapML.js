import { LexerToken, ParserError } from "../utils.js";
export declare const codepointsToTokens: (codepoints: number[], index?: number) => LexerToken[] | ParserError;
export declare const consumeString: (codepoints: number[], index: number) => [number, string] | null;
export declare const wouldStartIdentifier: (codepoints: number[], index: number) => boolean;
export declare const consumeEscape: (codepoints: number[], index: number) => [number, number] | null;
export declare const consumeNumeric: (codepoints: number[], index: number) => [
    number,
    (["number", number, "number" | "integer"] | ["percentage", number] | ["dimension", number, string])
] | null;
export declare const consumeNumber: (codepoints: number[], index: number) => [number, number, "integer" | "number"] | null;
export declare const consumeIdentUnsafe: (codepoints: number[], index: number) => [number, string] | null;
export declare const consumeIdent: (codepoints: number[], index: number) => [number, string] | null;
export declare const consumeUrl: (codepoints: number[], index: number) => [number, string] | null;
export declare const consumeIdentLike: (codepoints: number[], index: number) => [number, string, "ident" | "function" | "url"] | null;
