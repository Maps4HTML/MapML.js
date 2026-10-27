import { FeatureNode, GeneralEnclosedNode, ParserError, QueryListNode } from "media-query-parser";
export type Kleene3 = "true" | "false" | "unknown";
export declare const not: (kleene3: Kleene3) => Kleene3;
export declare const and: (...kleene3s: Kleene3[]) => Kleene3;
export declare const or: (...kleene3s: Kleene3[]) => Kleene3;
export type SolverConfig = {
    solveUnknownFeature: (node: FeatureNode) => Kleene3;
    solveGeneralEnclosed: (node: GeneralEnclosedNode) => Kleene3;
    isLegacyBrowser: Kleene3;
    isMediaTypeScreen: Kleene3;
    features: Map<string, {
        type: "discrete";
        values: Set<string | number>;
    } | {
        type: "range";
        valueType: "length" | "integer" | "resolution";
        canBeZero: boolean;
        canBeNegative: boolean;
        extraValues: Map<string, number | "unknown">;
    } | {
        type: "range";
        valueType: "ratio";
        canNumeratorBeZero: boolean;
        canDenominatorBeZero: boolean;
        extraValues: Map<string, number | "unknown">;
    }>;
};
export type SolverConfigInput = Partial<Omit<SolverConfig, "features"> & {
    features: Record<string, {
        type: "discrete";
        values: Array<string | number>;
    } | {
        type: "range";
        valueType: "length" | "integer" | "resolution";
        canBeZero: boolean;
        canBeNegative: boolean;
        extraValues?: Record<string, number | "unknown">;
    } | {
        type: "range";
        valueType: "ratio";
        canNumeratorBeZero: boolean;
        canDenominatorBeZero: boolean;
        extraValues?: Record<string, number | "unknown">;
    }>;
}>;
export declare const DEFAULT_KNOWN_FEATURES: SolverConfigInput["features"];
export declare const createSolverConfig: (solverConfigInput?: SolverConfigInput | undefined) => SolverConfig;
export declare const solveMediaQueryList: (mediaQueryList: string | QueryListNode | ParserError, configInput?: SolverConfigInput) => Kleene3;
export declare const solveMediaQueryList_: (mediaQueryList: QueryListNode, config: SolverConfig) => Kleene3;
