import { NumberNode, RatioNode, ValueNode, DimensionNode } from "media-query-parser";
type IntegerValueNode = Omit<NumberNode, "flag"> & {
    flag: "integer";
};
type LengthValueNode = (Omit<NumberNode, "flag" | "value"> & {
    flag: "integer";
    value: 0;
}) | (Omit<DimensionNode, "unit"> & {
    unit: LengthUnit;
});
type ResolutionValueNode = Omit<DimensionNode, "unit"> & {
    unit: ResolutionUnit;
};
type RatioValueNode = IntegerValueNode | RatioNode;
export declare const isValueInteger: (value: ValueNode) => value is IntegerValueNode;
export declare const isValueLength: (value: ValueNode) => value is LengthValueNode;
export declare const isValueResolution: (value: ValueNode) => value is ResolutionValueNode;
export declare const isValueRatio: (value: ValueNode) => value is RatioValueNode;
type AbsoluteLengthUnit = "cm" | "mm" | "q" | "in" | "pc" | "pt" | "px";
type RelativeLengthUnit = "em" | "ex" | "cap" | "ch" | "ic" | "rem" | "lh" | "rlh" | "vw" | "vh" | "vi" | "vb" | "vmin" | "vmax" | "svw" | "svh" | "svi" | "svb" | "svmin" | "svmax" | "lvw" | "lvh" | "lvi" | "lvb" | "lvmin" | "lvmax" | "dvw" | "dvh" | "dvi" | "dvb" | "dvmin" | "dvmax" | "cqw" | "cqh" | "cqi" | "cqb" | "cqmin" | "cqmax";
type LengthUnit = AbsoluteLengthUnit | RelativeLengthUnit;
export declare const compareLength: (a: LengthValueNode, b: LengthValueNode) => "lt" | "eq" | "gt" | "unknown";
export declare const compareRatio: (a: RatioValueNode, b: RatioValueNode) => "lt" | "eq" | "gt" | "incomparable";
type ResolutionUnit = "dpi" | "dpcm" | "dppx" | "x";
export declare const compareResolution: (a: ResolutionValueNode, b: ResolutionValueNode) => "lt" | "eq" | "gt";
export {};
