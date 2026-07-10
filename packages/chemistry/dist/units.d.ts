/** Unit conversion factors to a canonical SI-ish base. */
export type MassUnit = "kg" | "g" | "mg" | "µg" | "ug" | "ng";
export type VolumeUnit = "L" | "mL" | "µL" | "uL" | "nL";
export type ConcentrationUnit = "M" | "mM" | "µM" | "uM" | "nM";
export type AmountUnit = "mol" | "mmol" | "µmol" | "umol" | "nmol";
export declare const toGrams: (v: number, u: MassUnit) => number;
export declare const fromGrams: (v: number, u: MassUnit) => number;
export declare const toLiters: (v: number, u: VolumeUnit) => number;
export declare const fromLiters: (v: number, u: VolumeUnit) => number;
export declare const toMolar: (v: number, u: ConcentrationUnit) => number;
export declare const fromMolar: (v: number, u: ConcentrationUnit) => number;
export declare const toMoles: (v: number, u: AmountUnit) => number;
export declare const fromMoles: (v: number, u: AmountUnit) => number;
export declare const MASS_UNITS: MassUnit[];
export declare const VOLUME_UNITS: VolumeUnit[];
export declare const CONCENTRATION_UNITS: ConcentrationUnit[];
export declare const AMOUNT_UNITS: AmountUnit[];
