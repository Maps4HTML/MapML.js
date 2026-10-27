import { Simplify } from "./internals.js";
type FileRange = {
    start: number;
    end: number;
};
export type LexerToken = WhitespaceToken | StringToken | HashToken | DelimToken | CommaToken | LeftParenToken | RightParenToken | DimensionToken | NumberToken | PercentageToken | IdentToken | FunctionToken | UrlToken | CDCToken | ColonToken | SemicolonToken | CDOToken | AtKeywordToken | LeftBracketToken | RightBracketToken | LeftCurlyToken | RightCurlyToken | EOFToken;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-whitespace-token */
export type WhitespaceToken = Simplify<{
    _t: "whitespace";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-string-token */
export type StringToken = Simplify<{
    _t: "string";
    value: string;
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-hash-token */
export type HashToken = Simplify<{
    _t: "hash";
    value: string;
    flag: "id" | "unrestricted";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-delim-token */
export type DelimToken = Simplify<{
    _t: "delim";
    value: number;
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-comma-token */
export type CommaToken = Simplify<{
    _t: "comma";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-paren */
export type LeftParenToken = Simplify<{
    _t: "(";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-paren */
export type RightParenToken = Simplify<{
    _t: ")";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-dimension-token */
export type DimensionToken = Simplify<{
    _t: "dimension";
    value: number;
    unit: string;
    flag: "number";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-number-token */
export type NumberToken = Simplify<{
    _t: "number";
    value: number;
    flag: "number" | "integer";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-percentage-token */
export type PercentageToken = Simplify<{
    _t: "percentage";
    value: number;
    flag: "number";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-cdc-token */
export type CDCToken = Simplify<{
    _t: "CDC";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-colon-token */
export type ColonToken = Simplify<{
    _t: "colon";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-semicolon-token */
export type SemicolonToken = Simplify<{
    _t: "semicolon";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-cdo-token */
export type CDOToken = Simplify<{
    _t: "CDO";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-at-keyword-token */
export type AtKeywordToken = Simplify<{
    _t: "at-keyword";
    value: string;
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-square */
export type LeftBracketToken = Simplify<{
    _t: "[";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-square */
export type RightBracketToken = Simplify<{
    _t: "]";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-curly */
export type LeftCurlyToken = Simplify<{
    _t: "{";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-curly */
export type RightCurlyToken = Simplify<{
    _t: "}";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-ident-token */
export type IdentToken = Simplify<{
    _t: "ident";
    value: string;
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-function-token */
export type FunctionToken = Simplify<{
    _t: "function";
    value: string;
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-url-token */
export type UrlToken = Simplify<{
    _t: "url";
    value: string;
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-eof-token */
export type EOFToken = Simplify<{
    _t: "EOF";
} & FileRange>;
/** https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokenization */
export type ParserToken = Simplify<Exclude<LexerToken, WhitespaceToken | EOFToken> & {
    isAfterSpace: boolean;
}>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-media-query-list */
export type QueryListNode = {
    _t: "query-list";
    nodes: Array<QueryNode | undefined>;
};
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-media-query */
export type QueryNode = Simplify<({
    _t: "query";
    prefix?: undefined;
    type?: undefined;
    condition: ConditionNode;
} | {
    _t: "query";
    prefix?: "not" | "only";
    type: string;
    condition?: ConditionWithoutOrNode;
}) & FileRange>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-media-feature */
export type FeatureNode = BooleanFeatureNode | PlainFeatureNode | SingleRangeFeatureNode | DoubleRangeFeatureNode;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-mf-boolean */
export type BooleanFeatureNode = Simplify<{
    _t: "feature";
    context: "boolean";
    feature: string;
} & FileRange>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-mf-plain */
export type PlainFeatureNode = Simplify<{
    _t: "feature";
    context: "value";
    feature: string;
    value: ValueNode;
} & FileRange>;
/** first 2 productions of https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-mf-range */
export type SingleRangeFeatureNode = Simplify<{
    _t: "feature";
    context: "range";
    ops: 1;
    feature: string;
    op: ">" | ">=" | "<" | "<=" | "=";
    value: NumericValueNode;
} & FileRange>;
/** last 2 productions of https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-mf-range */
export type DoubleRangeFeatureNode = Simplify<{
    _t: "feature";
    context: "range";
    ops: 2;
    feature: string;
    minOp: "<" | "<=";
    minValue: NumericValueNode;
    maxOp: "<" | "<=";
    maxValue: NumericValueNode;
} & FileRange>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-mf-range */
export type RangeFeatureNode = SingleRangeFeatureNode | DoubleRangeFeatureNode;
/** https://www.w3.org/TR/2023/WD-css-values-4-20231218/#numbers */
export type NumberNode = Simplify<{
    _t: "number";
    value: number;
    flag: "number" | "integer";
} & FileRange>;
/** https://www.w3.org/TR/2023/WD-css-values-4-20231218/#dimensions */
export type DimensionNode = Simplify<{
    _t: "dimension";
    value: number;
    unit: string;
} & FileRange>;
/** https://www.w3.org/TR/2023/WD-css-values-4-20231218/#ratios */
export type RatioNode = Simplify<{
    _t: "ratio";
    left: number;
    right: number;
} & FileRange>;
/** https://www.w3.org/TR/2023/WD-css-values-4-20231218/#keywords */
export type IdentNode = Simplify<{
    _t: "ident";
    value: string;
} & FileRange>;
/**
 * https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-mf-value
 *
 * (spec change pending: https://github.com/w3c/csswg-drafts/issues/8998#issuecomment-1663108401)
 */
export type NumericValueNode = NumberNode | DimensionNode | RatioNode;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-mf-value */
export type ValueNode = NumericValueNode | IdentNode;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-media-not */
export type NotConditionNode = Simplify<{
    _t: "condition";
    op: "not";
    nodes: [InParensNode];
} & FileRange>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-media-and */
export type AndConditionNode = Simplify<{
    _t: "condition";
    op: "and";
    nodes: [InParensNode, ...InParensNode[]];
} & FileRange>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-media-or */
export type OrConditionNode = Simplify<{
    _t: "condition";
    op: "or";
    nodes: [InParensNode, ...InParensNode[]];
} & FileRange>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-media-condition */
export type ConditionNode = Simplify<NotConditionNode | AndConditionNode | OrConditionNode>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-media-condition-without-or */
export type ConditionWithoutOrNode = Simplify<NotConditionNode | AndConditionNode>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-general-enclosed */
export type GeneralEnclosedNode = Simplify<{
    _t: "general-enclosed";
    tokens: ParserToken[];
} & FileRange>;
/** https://www.w3.org/TR/2021/WD-mediaqueries-5-20211218/#typedef-media-in-parens */
export type InParensNode = Simplify<{
    _t: "in-parens";
    node: ConditionNode | FeatureNode | GeneralEnclosedNode;
}>;
export type ParserErrId = "INVALID_QUERY" | "INVALID_CONDITION" | "INVALID_FEATURE" | "INVALID_STRING" | "NO_LCURLY" | "NO_SEMICOLON";
/**
 * Metadata about the error including an id that can be used for i18n error messages
 */
export type ParserError = {
    _errid: ParserErrId;
    start: number;
    end: number;
    child?: ParserError;
};
/**
 * a type guard that asserts whether `value` is of type ParserError
 *
 * tolerant of any input type, you can assume it will be true if (and only if) it is a ParserError
 */
export declare const isParserError: (value: unknown) => value is ParserError;
export {};
