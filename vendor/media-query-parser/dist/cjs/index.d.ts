import { ConditionNode, FeatureNode, ParserError, QueryListNode, QueryNode, ValueNode } from "./utils.js";
/**
 * creates an AST from a **media-query-list** string; parses comma-separated media queries correctly
 *
 * Important:
 *
 * - _an invalid media-query child **does not** make the media-query-list invalid_
 *  - each invalid media query child is replaced with undefined
 * - can **return** a ParserError (e.g. when there is a CSS syntax error, like an invalid string)
 *
 * @example
 * ```ts
 * console.log(parseMediaQueryList(`print, #invalid, (min-width: 1000px)`));
 * // {
 * //   _t: "query-list",
 * //   nodes: [
 * //     { _t: "query", type: "print", start: 0, end: 4 },
 * //     undefined,
 * //     {
 * //       _t: "query",
 * //       condition: {
 * //         _t: "condition",
 * //         op: "and",
 * //         nodes: [
 * //           {
 * //             _t: "in-parens",
 * //             node: {
 * //               _t: "feature",
 * //               context: "value",
 * //               feature: "min-width",
 * //               value: { _t: "dimension", value: 1000, unit: "px", start: 29, end: 34 },
 * //               start: 18,
 * //               end: 34,
 * //             },
 * //           },
 * //         ],
 * //         start: 17,
 * //         end: 35,
 * //       },
 * //       start: 0,
 * //       end: 35,
 * //     },
 * //   ],
 * // }
 * ```
 */
export declare const parseMediaQueryList: (str: string) => QueryListNode | ParserError;
/**
 * creates an AST from a **media-query** string
 * @example
 * ```ts
 * console.log(parseMediaQuery(`screen and (monochrome)`));
 * // {
 * //   _t: "query",
 * //   condition: {
 * //     _t: "condition",
 * //     op: "and",
 * //     nodes: [
 * //       {
 * //         _t: "in-parens",
 * //         node: { _t: "feature", context: "boolean", feature: "monochrome", start: 12, end: 21 },
 * //       },
 * //     ],
 * //     start: 11,
 * //     end: 22,
 * //   },
 * //   type: "screen",
 * //   start: 0,
 * //   end: 22,
 * // }
 * ```
 */
export declare const parseMediaQuery: (str: string) => QueryNode | ParserError;
/**
 * creates an AST from a **media-condition** string
 *
 * @example
 * ```ts
 * console.log(parseMediaCondition(`((aspect-ratio > 1/2) or (monochrome))`));
 * // {
 * //   _t: "condition",
 * //   op: "and",
 * //   nodes: [
 * //     {
 * //       _t: "in-parens",
 * //       node: {
 * //         _t: "condition",
 * //         op: "or",
 * //         nodes: [
 * //           {
 * //             _t: "in-parens",
 * //             node: {
 * //               _t: "feature",
 * //               context: "range",
 * //               feature: "aspect-ratio",
 * //               ops: 1,
 * //               op: ">",
 * //               value: { _t: "ratio", left: 1, right: 2, start: 17, end: 19 },
 * //               start: 2,
 * //               end: 19,
 * //             },
 * //           },
 * //           {
 * //             _t: "in-parens",
 * //             node: { _t: "feature", context: "boolean", feature: "monochrome", start: 26, end: 35 },
 * //           },
 * //         ],
 * //         start: 1,
 * //         end: 36,
 * //       },
 * //     },
 * //   ],
 * //   start: 0,
 * //   end: 37,
 * // }
 * ```
 */
export declare const parseMediaCondition: (str: string) => ConditionNode | ParserError;
/**
 * creates an AST from a **media-feature** string - including parentheses
 *
 * @example
 * ```ts
 * console.log(parseMediaFeature(`(min-width: 768px)`));
 * // {
 * //   _t: "feature",
 * //   context: "value",
 * //   feature: "min-width",
 * //   value: { _t: "dimension", value: 768, unit: "px", start: 12, end: 16 },
 * //   start: 1,
 * //   end: 16,
 * // }
 * ```
 */
export declare const parseMediaFeature: (str: string) => FeatureNode | ParserError;
/**
 * turns an AST into an equivalent string
 *
 * @example
 * ```ts
 * console.log(
 *   stringify({
 *     "_t": "query",
 *     "condition": {
 *       "_t": "condition",
 *       "op": "and",
 *       "nodes": [
 *         {
 *           "_t": "in-parens",
 *           "node": {
 *             "_t": "feature",
 *             "context": "boolean",
 *             "feature": "monochrome",
 *           }
 *         }
 *       ],
 *     },
 *     "type": "screen",
 *   })
 * );
 * // 'screen and (monochrome)'
 * ```
 */
export declare const stringify: (node: QueryListNode | QueryNode | ConditionNode | FeatureNode | ValueNode) => string;
export * from "./utils.js";
