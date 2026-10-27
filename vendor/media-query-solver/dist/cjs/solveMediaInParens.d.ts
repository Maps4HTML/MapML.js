import { InParensNode, ParserError } from "media-query-parser";
import { Kleene3, SolverConfig, SolverConfigInput } from "./solveMediaQueryList.js";
export declare const solveMediaInParens: (inParens: string | InParensNode | ParserError, configInput?: SolverConfigInput) => Kleene3;
export declare const solveMediaInParens_: (inParens: InParensNode, config: SolverConfig) => Kleene3;
