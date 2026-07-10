/**
 * Chemical calculators — pure, dimensionally-correct functions.
 * All functions work in SI base units (g, L, mol, M) unless noted;
 * unit conversion is handled by callers via ./units.
 */

export interface CalcStep {
  label: string;
  expression: string;
}

// ── Moles / mass / molar mass ────────────────────────────────────────────────
export function molesFromMass(massG: number, molarMass: number): number {
  assertPositive(molarMass, "massa molare");
  return massG / molarMass;
}
export function massFromMoles(moles: number, molarMass: number): number {
  return moles * molarMass;
}
export function molarMassFromMoles(massG: number, moles: number): number {
  assertPositive(moles, "moli");
  return massG / moles;
}

// ── Molarity: M = n / V(L) ───────────────────────────────────────────────────
export function molarity(moles: number, volumeL: number): number {
  assertPositive(volumeL, "volume");
  return moles / volumeL;
}
export function molarityFromMass(massG: number, molarMass: number, volumeL: number): number {
  return molarity(molesFromMass(massG, molarMass), volumeL);
}

// ── Molality: b = n / kg solvent ─────────────────────────────────────────────
export function molality(moles: number, solventKg: number): number {
  assertPositive(solventKg, "massa solvente");
  return moles / solventKg;
}

// ── Normality: N = M * equivalence factor ────────────────────────────────────
export function normality(molar: number, equivalents: number): number {
  return molar * equivalents;
}

// ── Percent concentration ────────────────────────────────────────────────────
export function massPercent(soluteMassG: number, solutionMassG: number): number {
  assertPositive(solutionMassG, "massa soluzione");
  return (soluteMassG / solutionMassG) * 100;
}
export function massVolumePercent(soluteMassG: number, solutionVolumeML: number): number {
  assertPositive(solutionVolumeML, "volume soluzione");
  return (soluteMassG / solutionVolumeML) * 100;
}
export function volumePercent(soluteVolume: number, solutionVolume: number): number {
  assertPositive(solutionVolume, "volume soluzione");
  return (soluteVolume / solutionVolume) * 100;
}

// ── Dilution: C1 V1 = C2 V2 (solve for the missing one) ──────────────────────
export interface DilutionInput {
  c1?: number;
  v1?: number;
  c2?: number;
  v2?: number;
}
export function dilution(input: DilutionInput): { c1: number; v1: number; c2: number; v2: number } {
  const known = Object.entries(input).filter(([, v]) => v != null && !Number.isNaN(v));
  if (known.length !== 3) {
    throw new Error("Fornire esattamente 3 valori su 4 (C1, V1, C2, V2)");
  }
  let { c1, v1, c2, v2 } = input;
  if (c1 == null) c1 = (c2! * v2!) / nonZero(v1!, "V1");
  else if (v1 == null) v1 = (c2! * v2!) / nonZero(c1, "C1");
  else if (c2 == null) c2 = (c1 * v1) / nonZero(v2!, "V2");
  else if (v2 == null) v2 = (c1 * v1) / nonZero(c2, "C2");
  return { c1: c1!, v1: v1!, c2: c2!, v2: v2! };
}

// ── pH ───────────────────────────────────────────────────────────────────────
/** pH of a strong monoprotic acid at concentration c (M). */
export function pHStrongAcid(concentration: number): number {
  assertPositive(concentration, "concentrazione");
  return -Math.log10(concentration);
}
/** pOH/pH of a strong monobasic base at concentration c (M). */
export function pHStrongBase(concentration: number): number {
  assertPositive(concentration, "concentrazione");
  const pOH = -Math.log10(concentration);
  return 14 - pOH;
}
/** pH of a weak acid via [H+]≈sqrt(Ka·C) (valid when Ka≪C). */
export function pHWeakAcid(concentration: number, ka: number): number {
  assertPositive(concentration, "concentrazione");
  assertPositive(ka, "Ka");
  const h = Math.sqrt(ka * concentration);
  return -Math.log10(h);
}
export function pHWeakBase(concentration: number, kb: number): number {
  assertPositive(concentration, "concentrazione");
  assertPositive(kb, "Kb");
  const oh = Math.sqrt(kb * concentration);
  return 14 + Math.log10(oh);
}
/** Henderson–Hasselbalch: pH = pKa + log10([A-]/[HA]). */
export function hendersonHasselbalch(pKa: number, base: number, acid: number): number {
  assertPositive(base, "[A-]");
  assertPositive(acid, "[HA]");
  return pKa + Math.log10(base / acid);
}

// ── Ideal gas: PV = nRT ──────────────────────────────────────────────────────
export const R_GAS = 0.082057; // L·atm·K⁻¹·mol⁻¹
export interface IdealGasInput {
  p?: number; // atm
  v?: number; // L
  n?: number; // mol
  t?: number; // K
}
export function idealGas(input: IdealGasInput): { p: number; v: number; n: number; t: number } {
  const known = Object.entries(input).filter(([, v]) => v != null && !Number.isNaN(v));
  if (known.length !== 3) throw new Error("Fornire esattamente 3 valori su 4 (P, V, n, T)");
  let { p, v, n, t } = input;
  if (p == null) p = (n! * R_GAS * t!) / nonZero(v!, "V");
  else if (v == null) v = (n! * R_GAS * t!) / nonZero(p, "P");
  else if (n == null) n = (p * v!) / nonZero(R_GAS * t!, "RT");
  else if (t == null) t = (p * v!) / nonZero(n! * R_GAS, "nR");
  return { p: p!, v: v!, n: n!, t: t! };
}

// ── Yield ─────────────────────────────────────────────────────────────────────
export function percentYield(actual: number, theoretical: number): number {
  assertPositive(theoretical, "resa teorica");
  return (actual / theoretical) * 100;
}
/**
 * Atom economy = (MW desired product / Σ MW reactants) * 100.
 * Reactant masses should be summed with their stoichiometric coefficients.
 */
export function atomEconomy(productMW: number, reactantsMWSum: number): number {
  assertPositive(reactantsMWSum, "somma masse reagenti");
  return (productMW / reactantsMWSum) * 100;
}

// ── Beer–Lambert: A = ε·l·c ──────────────────────────────────────────────────
export interface BeerLambertInput {
  a?: number; // absorbance
  epsilon?: number; // L·mol⁻¹·cm⁻¹
  pathLength?: number; // cm
  c?: number; // mol·L⁻¹
}
export function beerLambert(
  input: BeerLambertInput,
): { a: number; epsilon: number; pathLength: number; c: number } {
  const known = Object.entries(input).filter(([, v]) => v != null && !Number.isNaN(v));
  if (known.length !== 3) throw new Error("Fornire esattamente 3 valori su 4 (A, ε, l, c)");
  let { a, epsilon, pathLength, c } = input;
  if (a == null) a = epsilon! * pathLength! * c!;
  else if (epsilon == null) epsilon = a / nonZero(pathLength! * c!, "l·c");
  else if (pathLength == null) pathLength = a / nonZero(epsilon! * c!, "ε·c");
  else if (c == null) c = a / nonZero(epsilon! * pathLength!, "ε·l");
  return { a: a!, epsilon: epsilon!, pathLength: pathLength!, c: c! };
}

// ── ppm / ppb ─────────────────────────────────────────────────────────────────
/** ppm (mg/L for dilute aqueous) = mass_solute(mg) / volume(L). */
export function ppm(soluteMg: number, solutionL: number): number {
  assertPositive(solutionL, "volume soluzione");
  return soluteMg / solutionL;
}
export function ppb(soluteMg: number, solutionL: number): number {
  return ppm(soluteMg, solutionL) * 1000;
}

// ── Serial dilution ───────────────────────────────────────────────────────────
export function serialDilution(
  initial: number,
  foldPerStep: number,
  steps: number,
): number[] {
  assertPositive(foldPerStep, "fattore di diluizione");
  const out: number[] = [initial];
  for (let i = 0; i < steps; i++) out.push(out[out.length - 1] / foldPerStep);
  return out;
}

// ── Chromatography Rf ─────────────────────────────────────────────────────────
export function rf(distanceSpot: number, distanceSolvent: number): number {
  assertPositive(distanceSolvent, "distanza fronte solvente");
  return distanceSpot / distanceSolvent;
}

// ── Density / mass / volume ───────────────────────────────────────────────────
export interface DensityInput {
  density?: number; // g/mL
  mass?: number; // g
  volume?: number; // mL
}
export function densityRelation(
  input: DensityInput,
): { density: number; mass: number; volume: number } {
  const known = Object.entries(input).filter(([, v]) => v != null && !Number.isNaN(v));
  if (known.length !== 2) throw new Error("Fornire esattamente 2 valori su 3 (ρ, m, V)");
  let { density, mass, volume } = input;
  if (density == null) density = mass! / nonZero(volume!, "V");
  else if (mass == null) mass = density * volume!;
  else if (volume == null) volume = mass / nonZero(density, "ρ");
  return { density: density!, mass: mass!, volume: volume! };
}

// ── Statistics ────────────────────────────────────────────────────────────────
export function mean(values: number[]): number {
  if (values.length === 0) throw new Error("Nessun dato");
  return values.reduce((a, b) => a + b, 0) / values.length;
}
/** Sample standard deviation (n-1). */
export function stdDev(values: number[]): number {
  if (values.length < 2) throw new Error("Servono almeno 2 valori");
  const m = mean(values);
  const variance = values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}
export function absoluteError(measured: number, trueValue: number): number {
  return Math.abs(measured - trueValue);
}
export function relativeError(measured: number, trueValue: number): number {
  assertPositive(Math.abs(trueValue), "valore vero");
  return (Math.abs(measured - trueValue) / Math.abs(trueValue)) * 100;
}
/** Simple confidence interval half-width using a supplied t/z multiplier. */
export function confidenceInterval(
  values: number[],
  multiplier = 1.96,
): { mean: number; halfWidth: number; low: number; high: number } {
  const m = mean(values);
  const s = stdDev(values);
  const hw = (multiplier * s) / Math.sqrt(values.length);
  return { mean: m, halfWidth: hw, low: m - hw, high: m + hw };
}

// ── Stoichiometry: limiting reagent ──────────────────────────────────────────
export interface StoichComponent {
  id: string;
  moles: number;
  coefficient: number;
}
/** Returns the component id with the smallest moles/coefficient ratio. */
export function limitingReagent(components: StoichComponent[]): {
  limitingId: string;
  ratios: Array<{ id: string; ratio: number }>;
} {
  if (components.length === 0) throw new Error("Nessun reagente");
  const ratios = components.map((c) => ({
    id: c.id,
    ratio: c.moles / nonZero(c.coefficient, `coefficiente ${c.id}`),
  }));
  const limiting = ratios.reduce((min, r) => (r.ratio < min.ratio ? r : min));
  return { limitingId: limiting.id, ratios };
}

// ── helpers ───────────────────────────────────────────────────────────────────
function assertPositive(value: number, name: string): void {
  if (value == null || Number.isNaN(value)) throw new Error(`${name} mancante`);
  if (value <= 0) throw new Error(`${name} deve essere > 0`);
}
function nonZero(value: number, name: string): number {
  if (!value) throw new Error(`${name} non può essere zero`);
  return value;
}
