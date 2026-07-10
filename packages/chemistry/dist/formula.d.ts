export interface ElementCount {
    symbol: string;
    count: number;
}
export interface MolarMassResult {
    /** Molar mass in g/mol. */
    molarMass: number;
    /** Per-element breakdown, ordered by first appearance. */
    composition: Array<ElementCount & {
        mass: number;
        percent: number;
    }>;
    /** Normalised Hill-order formula string. */
    formula: string;
}
export declare class FormulaError extends Error {
    constructor(message: string);
}
/**
 * Parse a molecular formula into element counts.
 * Supports nested parentheses/brackets and hydrate dot notation, e.g.
 * "Ca(OH)2", "CuSO4·5H2O", "K4[Fe(CN)6]".
 */
export declare function parseFormula(input: string): ElementCount[];
/** Compute molar mass (g/mol) and elemental composition of a formula. */
export declare function molarMass(input: string): MolarMassResult;
/** Format element counts in Hill order (C, H, then alphabetical). */
export declare function hillFormula(counts: ElementCount[]): string;
