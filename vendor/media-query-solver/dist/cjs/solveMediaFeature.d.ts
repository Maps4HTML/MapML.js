import { FeatureNode, ParserError } from "media-query-parser";
import { Kleene3, SolverConfig, SolverConfigInput } from "./solveMediaQueryList.js";
export declare const solveMediaFeature: (feature: string | FeatureNode | ParserError, configInput?: SolverConfigInput) => Kleene3;
export declare const solveMediaFeature_: (feature: FeatureNode, config: SolverConfig) => Kleene3;
