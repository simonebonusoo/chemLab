/** Unit conversion factors to a canonical SI-ish base. */

export type MassUnit = "kg" | "g" | "mg" | "µg" | "ug" | "ng";
export type VolumeUnit = "L" | "mL" | "µL" | "uL" | "nL";
export type ConcentrationUnit = "M" | "mM" | "µM" | "uM" | "nM";
export type AmountUnit = "mol" | "mmol" | "µmol" | "umol" | "nmol";

const MASS_TO_G: Record<string, number> = {
  kg: 1000,
  g: 1,
  mg: 1e-3,
  "µg": 1e-6,
  ug: 1e-6,
  ng: 1e-9,
};

const VOLUME_TO_L: Record<string, number> = {
  L: 1,
  mL: 1e-3,
  "µL": 1e-6,
  uL: 1e-6,
  nL: 1e-9,
};

const CONC_TO_M: Record<string, number> = {
  M: 1,
  mM: 1e-3,
  "µM": 1e-6,
  uM: 1e-6,
  nM: 1e-9,
};

const AMOUNT_TO_MOL: Record<string, number> = {
  mol: 1,
  mmol: 1e-3,
  "µmol": 1e-6,
  umol: 1e-6,
  nmol: 1e-9,
};

function factor(table: Record<string, number>, unit: string, kind: string): number {
  const f = table[unit];
  if (f === undefined) throw new Error(`Unità ${kind} non valida: "${unit}"`);
  return f;
}

export const toGrams = (v: number, u: MassUnit) => v * factor(MASS_TO_G, u, "massa");
export const fromGrams = (v: number, u: MassUnit) => v / factor(MASS_TO_G, u, "massa");
export const toLiters = (v: number, u: VolumeUnit) => v * factor(VOLUME_TO_L, u, "volume");
export const fromLiters = (v: number, u: VolumeUnit) => v / factor(VOLUME_TO_L, u, "volume");
export const toMolar = (v: number, u: ConcentrationUnit) =>
  v * factor(CONC_TO_M, u, "concentrazione");
export const fromMolar = (v: number, u: ConcentrationUnit) =>
  v / factor(CONC_TO_M, u, "concentrazione");
export const toMoles = (v: number, u: AmountUnit) => v * factor(AMOUNT_TO_MOL, u, "quantità");
export const fromMoles = (v: number, u: AmountUnit) => v / factor(AMOUNT_TO_MOL, u, "quantità");

export const MASS_UNITS: MassUnit[] = ["kg", "g", "mg", "µg", "ng"];
export const VOLUME_UNITS: VolumeUnit[] = ["L", "mL", "µL", "nL"];
export const CONCENTRATION_UNITS: ConcentrationUnit[] = ["M", "mM", "µM", "nM"];
export const AMOUNT_UNITS: AmountUnit[] = ["mol", "mmol", "µmol", "nmol"];
