/** Unit conversion factors to a canonical SI-ish base. */
const MASS_TO_G = {
    kg: 1000,
    g: 1,
    mg: 1e-3,
    "µg": 1e-6,
    ug: 1e-6,
    ng: 1e-9,
};
const VOLUME_TO_L = {
    L: 1,
    mL: 1e-3,
    "µL": 1e-6,
    uL: 1e-6,
    nL: 1e-9,
};
const CONC_TO_M = {
    M: 1,
    mM: 1e-3,
    "µM": 1e-6,
    uM: 1e-6,
    nM: 1e-9,
};
const AMOUNT_TO_MOL = {
    mol: 1,
    mmol: 1e-3,
    "µmol": 1e-6,
    umol: 1e-6,
    nmol: 1e-9,
};
function factor(table, unit, kind) {
    const f = table[unit];
    if (f === undefined)
        throw new Error(`Unità ${kind} non valida: "${unit}"`);
    return f;
}
export const toGrams = (v, u) => v * factor(MASS_TO_G, u, "massa");
export const fromGrams = (v, u) => v / factor(MASS_TO_G, u, "massa");
export const toLiters = (v, u) => v * factor(VOLUME_TO_L, u, "volume");
export const fromLiters = (v, u) => v / factor(VOLUME_TO_L, u, "volume");
export const toMolar = (v, u) => v * factor(CONC_TO_M, u, "concentrazione");
export const fromMolar = (v, u) => v / factor(CONC_TO_M, u, "concentrazione");
export const toMoles = (v, u) => v * factor(AMOUNT_TO_MOL, u, "quantità");
export const fromMoles = (v, u) => v / factor(AMOUNT_TO_MOL, u, "quantità");
export const MASS_UNITS = ["kg", "g", "mg", "µg", "ng"];
export const VOLUME_UNITS = ["L", "mL", "µL", "nL"];
export const CONCENTRATION_UNITS = ["M", "mM", "µM", "nM"];
export const AMOUNT_UNITS = ["mol", "mmol", "µmol", "nmol"];
//# sourceMappingURL=units.js.map