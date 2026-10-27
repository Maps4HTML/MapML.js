import { ParserError, QueryNode } from "media-query-parser";
import { Kleene3, SolverConfig, SolverConfigInput } from "./solveMediaQueryList.js";
export declare const solveMediaQuery: (mediaQuery: string | QueryNode | ParserError, configInput?: SolverConfigInput) => Kleene3;
export declare const solveMediaQuery_: (mediaQuery: QueryNode, config: SolverConfig) => Kleene3;
