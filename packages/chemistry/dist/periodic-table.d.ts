/**
 * Standard atomic weights (IUPAC 2021 conventional values, g/mol).
 * Source: IUPAC Commission on Isotopic Abundances and Atomic Weights.
 * Values are the conventional standard atomic weights; verify against an
 * authoritative source before use in critical/quantitative contexts.
 */
export interface Element {
    readonly number: number;
    readonly symbol: string;
    readonly name: string;
    readonly weight: number;
}
export declare const ELEMENTS: readonly Element[];
export declare const ELEMENT_BY_SYMBOL: ReadonlyMap<string, Element>;
