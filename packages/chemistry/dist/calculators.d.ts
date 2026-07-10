/**
 * Chemical calculators — pure, dimensionally-correct functions.
 * All functions work in SI base units (g, L, mol, M) unless noted;
 * unit conversion is handled by callers via ./units.
 */
export interface CalcStep {
    label: string;
    expression: string;
}
export declare function molesFromMass(massG: number, molarMass: number): number;
export declare function massFromMoles(moles: number, molarMass: number): number;
export declare function molarMassFromMoles(massG: number, moles: number): number;
export declare function molarity(moles: number, volumeL: number): number;
export declare function molarityFromMass(massG: number, molarMass: number, volumeL: number): number;
export declare function molality(moles: number, solventKg: number): number;
export declare function normality(molar: number, equivalents: number): number;
export declare function massPercent(soluteMassG: number, solutionMassG: number): number;
export declare function massVolumePercent(soluteMassG: number, solutionVolumeML: number): number;
export declare function volumePercent(soluteVolume: number, solutionVolume: number): number;
export interface DilutionInput {
    c1?: number;
    v1?: number;
    c2?: number;
    v2?: number;
}
export declare function dilution(input: DilutionInput): {
    c1: number;
    v1: number;
    c2: number;
    v2: number;
};
/** pH of a strong monoprotic acid at concentration c (M). */
export declare function pHStrongAcid(concentration: number): number;
/** pOH/pH of a strong monobasic base at concentration c (M). */
export declare function pHStrongBase(concentration: number): number;
/** pH of a weak acid via [H+]≈sqrt(Ka·C) (valid when Ka≪C). */
export declare function pHWeakAcid(concentration: number, ka: number): number;
export declare function pHWeakBase(concentration: number, kb: number): number;
/** Henderson–Hasselbalch: pH = pKa + log10([A-]/[HA]). */
export declare function hendersonHasselbalch(pKa: number, base: number, acid: number): number;
export declare const R_GAS = 0.082057;
export interface IdealGasInput {
    p?: number;
    v?: number;
    n?: number;
    t?: number;
}
export declare function idealGas(input: IdealGasInput): {
    p: number;
    v: number;
    n: number;
    t: number;
};
export declare function percentYield(actual: number, theoretical: number): number;
/**
 * Atom economy = (MW desired product / Σ MW reactants) * 100.
 * Reactant masses should be summed with their stoichiometric coefficients.
 */
export declare function atomEconomy(productMW: number, reactantsMWSum: number): number;
export interface BeerLambertInput {
    a?: number;
    epsilon?: number;
    pathLength?: number;
    c?: number;
}
export declare function beerLambert(input: BeerLambertInput): {
    a: number;
    epsilon: number;
    pathLength: number;
    c: number;
};
/** ppm (mg/L for dilute aqueous) = mass_solute(mg) / volume(L). */
export declare function ppm(soluteMg: number, solutionL: number): number;
export declare function ppb(soluteMg: number, solutionL: number): number;
export declare function serialDilution(initial: number, foldPerStep: number, steps: number): number[];
export declare function rf(distanceSpot: number, distanceSolvent: number): number;
export interface DensityInput {
    density?: number;
    mass?: number;
    volume?: number;
}
export declare function densityRelation(input: DensityInput): {
    density: number;
    mass: number;
    volume: number;
};
export declare function mean(values: number[]): number;
/** Sample standard deviation (n-1). */
export declare function stdDev(values: number[]): number;
export declare function absoluteError(measured: number, trueValue: number): number;
export declare function relativeError(measured: number, trueValue: number): number;
/** Simple confidence interval half-width using a supplied t/z multiplier. */
export declare function confidenceInterval(values: number[], multiplier?: number): {
    mean: number;
    halfWidth: number;
    low: number;
    high: number;
};
export interface StoichComponent {
    id: string;
    moles: number;
    coefficient: number;
}
/** Returns the component id with the smallest moles/coefficient ratio. */
export declare function limitingReagent(components: StoichComponent[]): {
    limitingId: string;
    ratios: Array<{
        id: string;
        ratio: number;
    }>;
};
