import { ConditionNode, ParserError } from "media-query-parser";
import { Kleene3, SolverConfig, SolverConfigInput } from "./solveMediaQueryList.js";
export declare const solveMediaCondition: (condition: string | ConditionNode | ParserError, configInput?: SolverConfigInput) => Kleene3;
export declare const solveMediaCondition_: (condition: ConditionNode, config: SolverConfig) => Kleene3;
