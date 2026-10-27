import { BooleanFeatureNode, ConditionNode, ConditionWithoutOrNode, FeatureNode, GeneralEnclosedNode, InParensNode, ParserToken, PlainFeatureNode, QueryListNode, QueryNode } from "../utils.js";
export type Match<T> = {
    t: T;
    i: number;
} | undefined;
export declare const matchPlain: (ts: ParserToken[], i?: number) => Match<PlainFeatureNode>;
export declare const matchBoolean: (ts: ParserToken[], i?: number) => Match<BooleanFeatureNode>;
export declare const matchFeature: (ts: ParserToken[], i?: number) => Match<FeatureNode>;
export declare const matchGeneralEnclosed: (ts: ParserToken[], i?: number) => Match<GeneralEnclosedNode>;
export declare const matchInParens: (ts: ParserToken[], i?: number) => Match<InParensNode>;
export declare const matchOr: (ts: ParserToken[], i?: number) => Match<InParensNode>;
export declare const matchAnd: (ts: ParserToken[], i?: number) => Match<InParensNode>;
export declare const matchNot: (ts: ParserToken[], i?: number) => Match<InParensNode>;
export declare const matchCondition: (ts: ParserToken[], i?: number) => Match<ConditionNode>;
export declare const matchConditionWithoutOr: (ts: ParserToken[], i?: number) => Match<ConditionWithoutOrNode>;
export declare const matchQuery: (ts: ParserToken[]) => Match<QueryNode>;
export declare const matchQueryList: (parsingTokens: ParserToken[]) => QueryListNode;
export declare const splitMediaQueryList: (tokens: ParserToken[]) => Array<ParserToken[]>;
