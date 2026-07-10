import * as chem from "@chemlab/chemistry";
import { formatNumber } from "@/lib/utils";

export interface CalcField {
  key: string;
  label: string;
  type?: "number" | "text";
  placeholder?: string;
  optional?: boolean;
  units?: string[];
  defaultUnit?: string;
  hint?: string;
}

export interface CalcOutput {
  display: string;
  value?: number;
  formula: string;
  steps: chem.CalcStep[];
}

export interface CalculatorDef {
  id: string;
  name: string;
  category: "Base" | "Concentrazioni" | "Soluzioni" | "Equilibri" | "Rese" | "Fisica" | "Analitica" | "Statistica";
  description: string;
  fields: CalcField[];
  compute(inputs: Record<string, string>): CalcOutput;
}

type Inputs = Record<string, string>;

function num(inputs: Inputs, key: string): number {
  const raw = inputs[key];
  if (raw == null || raw.trim() === "") throw new Error(`Campo "${key}" mancante`);
  const v = Number(raw.replace(",", "."));
  if (Number.isNaN(v)) throw new Error(`Valore non numerico per "${key}"`);
  return v;
}
function optNum(inputs: Inputs, key: string): number | undefined {
  const raw = inputs[key];
  if (raw == null || raw.trim() === "") return undefined;
  const v = Number(raw.replace(",", "."));
  return Number.isNaN(v) ? undefined : v;
}
function unit(inputs: Inputs, key: string, fallback: string): string {
  return inputs[`${key}__unit`] ?? fallback;
}

export const CALCULATORS: CalculatorDef[] = [
  {
    id: "molar-mass",
    name: "Massa molare",
    category: "Base",
    description: "Calcola la massa molare da una formula chimica.",
    fields: [{ key: "formula", label: "Formula chimica", type: "text", placeholder: "es. C6H12O6" }],
    compute: (i) => {
      const r = chem.molarMass(i.formula ?? "");
      return {
        display: `${formatNumber(r.molarMass, 2)} g/mol`,
        value: r.molarMass,
        formula: "M = Σ (nᵢ · Aᵢ)",
        steps: [
          { label: "Formula normalizzata", expression: r.formula },
          ...r.composition.map((c) => ({
            label: `${c.symbol} × ${c.count}`,
            expression: `${formatNumber(c.mass, 3)} g/mol (${formatNumber(c.percent, 1)}%)`,
          })),
          { label: "Massa molare", expression: `${formatNumber(r.molarMass, 2)} g/mol` },
        ],
      };
    },
  },
  {
    id: "moles",
    name: "Moli, massa e massa molare",
    category: "Base",
    description: "Ricava le moli da massa e massa molare (n = m / M).",
    fields: [
      { key: "mass", label: "Massa", units: ["g", "mg", "kg"], defaultUnit: "g" },
      { key: "molarMass", label: "Massa molare (g/mol)" },
    ],
    compute: (i) => {
      const massG = chem.toGrams(num(i, "mass"), unit(i, "mass", "g") as chem.MassUnit);
      const M = num(i, "molarMass");
      const n = chem.molesFromMass(massG, M);
      return {
        display: `${formatNumber(n)} mol`,
        value: n,
        formula: "n = m / M",
        steps: [
          { label: "Massa", expression: `${formatNumber(massG)} g` },
          { label: "n = m / M", expression: `${formatNumber(massG)} / ${formatNumber(M)} = ${formatNumber(n)} mol` },
        ],
      };
    },
  },
  {
    id: "molarity",
    name: "Molarità",
    category: "Concentrazioni",
    description: "Concentrazione molare M = n / V.",
    fields: [
      { key: "mass", label: "Massa soluto", units: ["g", "mg", "kg"], defaultUnit: "g" },
      { key: "molarMass", label: "Massa molare (g/mol)" },
      { key: "volume", label: "Volume soluzione", units: ["L", "mL"], defaultUnit: "mL" },
    ],
    compute: (i) => {
      const massG = chem.toGrams(num(i, "mass"), unit(i, "mass", "g") as chem.MassUnit);
      const M = num(i, "molarMass");
      const vol = chem.toLiters(num(i, "volume"), unit(i, "volume", "mL") as chem.VolumeUnit);
      const n = chem.molesFromMass(massG, M);
      const molar = chem.molarity(n, vol);
      return {
        display: `${formatNumber(molar)} M`,
        value: molar,
        formula: "M = n / V",
        steps: [
          { label: "n = m / M", expression: `${formatNumber(massG)} / ${formatNumber(M)} = ${formatNumber(n)} mol` },
          { label: "V", expression: `${formatNumber(vol)} L` },
          { label: "M = n / V", expression: `${formatNumber(n)} / ${formatNumber(vol)} = ${formatNumber(molar)} mol/L` },
        ],
      };
    },
  },
  {
    id: "molality",
    name: "Molalità",
    category: "Concentrazioni",
    description: "Molalità b = n / kg solvente.",
    fields: [
      { key: "moles", label: "Moli soluto (mol)" },
      { key: "solvent", label: "Massa solvente", units: ["kg", "g"], defaultUnit: "kg" },
    ],
    compute: (i) => {
      const n = num(i, "moles");
      const kg = unit(i, "solvent", "kg") === "g" ? num(i, "solvent") / 1000 : num(i, "solvent");
      const b = chem.molality(n, kg);
      return {
        display: `${formatNumber(b)} mol/kg`,
        value: b,
        formula: "b = n / kg solvente",
        steps: [{ label: "b = n / m", expression: `${formatNumber(n)} / ${formatNumber(kg)} = ${formatNumber(b)} mol/kg` }],
      };
    },
  },
  {
    id: "normality",
    name: "Normalità",
    category: "Concentrazioni",
    description: "Normalità N = M × fattore di equivalenza.",
    fields: [
      { key: "molarity", label: "Molarità (M)" },
      { key: "equivalents", label: "Equivalenti per mole" },
    ],
    compute: (i) => {
      const M = num(i, "molarity");
      const eq = num(i, "equivalents");
      const N = chem.normality(M, eq);
      return {
        display: `${formatNumber(N)} N`,
        value: N,
        formula: "N = M × eq",
        steps: [{ label: "N = M × eq", expression: `${formatNumber(M)} × ${formatNumber(eq)} = ${formatNumber(N)} N` }],
      };
    },
  },
  {
    id: "mass-mass-percent",
    name: "Percentuale massa/massa",
    category: "Concentrazioni",
    description: "% m/m = (massa soluto / massa soluzione) × 100.",
    fields: [
      { key: "solute", label: "Massa soluto (g)" },
      { key: "solution", label: "Massa soluzione (g)" },
    ],
    compute: (i) => {
      const p = chem.massPercent(num(i, "solute"), num(i, "solution"));
      return {
        display: `${formatNumber(p, 2)} % m/m`,
        value: p,
        formula: "% = (m_soluto / m_soluzione) × 100",
        steps: [{ label: "Calcolo", expression: `(${i.solute} / ${i.solution}) × 100 = ${formatNumber(p, 2)}%` }],
      };
    },
  },
  {
    id: "mass-volume-percent",
    name: "Percentuale massa/volume",
    category: "Concentrazioni",
    description: "% m/V = (massa soluto g / volume soluzione mL) × 100.",
    fields: [
      { key: "solute", label: "Massa soluto (g)" },
      { key: "volume", label: "Volume soluzione (mL)" },
    ],
    compute: (i) => {
      const p = chem.massVolumePercent(num(i, "solute"), num(i, "volume"));
      return {
        display: `${formatNumber(p, 2)} % m/V`,
        value: p,
        formula: "% = (m_soluto / V_soluzione) × 100",
        steps: [{ label: "Calcolo", expression: `(${i.solute} / ${i.volume}) × 100 = ${formatNumber(p, 2)}%` }],
      };
    },
  },
  {
    id: "volume-volume-percent",
    name: "Percentuale volume/volume",
    category: "Concentrazioni",
    description: "% V/V = (volume soluto / volume soluzione) × 100.",
    fields: [
      { key: "solute", label: "Volume soluto (mL)" },
      { key: "solution", label: "Volume soluzione (mL)" },
    ],
    compute: (i) => {
      const p = chem.volumePercent(num(i, "solute"), num(i, "solution"));
      return {
        display: `${formatNumber(p, 2)} % V/V`,
        value: p,
        formula: "% = (V_soluto / V_soluzione) × 100",
        steps: [{ label: "Calcolo", expression: `(${i.solute} / ${i.solution}) × 100 = ${formatNumber(p, 2)}%` }],
      };
    },
  },
  {
    id: "dilution",
    name: "Diluizioni C1V1 = C2V2",
    category: "Soluzioni",
    description: "Lascia vuoto il valore da calcolare (3 su 4).",
    fields: [
      { key: "c1", label: "C1 (M)", optional: true },
      { key: "v1", label: "V1 (mL)", optional: true },
      { key: "c2", label: "C2 (M)", optional: true },
      { key: "v2", label: "V2 (mL)", optional: true },
    ],
    compute: (i) => {
      const r = chem.dilution({
        c1: optNum(i, "c1"),
        v1: optNum(i, "v1"),
        c2: optNum(i, "c2"),
        v2: optNum(i, "v2"),
      });
      return {
        display: `C1=${formatNumber(r.c1)} M · V1=${formatNumber(r.v1)} mL · C2=${formatNumber(r.c2)} M · V2=${formatNumber(r.v2)} mL`,
        formula: "C1·V1 = C2·V2",
        steps: [
          { label: "Equazione", expression: `${formatNumber(r.c1)} × ${formatNumber(r.v1)} = ${formatNumber(r.c2)} × ${formatNumber(r.v2)}` },
        ],
      };
    },
  },
  {
    id: "solution-prep",
    name: "Preparazione soluzioni",
    category: "Soluzioni",
    description: "Massa di soluto per una soluzione a molarità e volume dati.",
    fields: [
      { key: "molarity", label: "Molarità target (M)" },
      { key: "volume", label: "Volume", units: ["L", "mL"], defaultUnit: "mL" },
      { key: "molarMass", label: "Massa molare (g/mol)" },
    ],
    compute: (i) => {
      const M = num(i, "molarity");
      const V = chem.toLiters(num(i, "volume"), unit(i, "volume", "mL") as chem.VolumeUnit);
      const molarMass = num(i, "molarMass");
      const n = M * V;
      const mass = chem.massFromMoles(n, molarMass);
      return {
        display: `Pesare ${formatNumber(mass, 4)} g`,
        value: mass,
        formula: "m = M · V · MM",
        steps: [
          { label: "n = M · V", expression: `${formatNumber(M)} × ${formatNumber(V)} = ${formatNumber(n)} mol` },
          { label: "m = n · MM", expression: `${formatNumber(n)} × ${formatNumber(molarMass)} = ${formatNumber(mass, 4)} g` },
        ],
      };
    },
  },
  {
    id: "unit-conversion",
    name: "Conversione unità",
    category: "Base",
    description: "Converte massa o volume tra unità.",
    fields: [
      { key: "value", label: "Valore" },
      { key: "from", label: "Da (g, mg, kg, L, mL, µL)", type: "text", placeholder: "g" },
      { key: "to", label: "A (g, mg, kg, L, mL, µL)", type: "text", placeholder: "mg" },
    ],
    compute: (i) => {
      const v = num(i, "value");
      const from = (i.from ?? "").trim();
      const to = (i.to ?? "").trim();
      const massU = ["kg", "g", "mg", "µg", "ng"];
      const volU = ["L", "mL", "µL", "nL"];
      let out: number;
      if (massU.includes(from) && massU.includes(to)) {
        out = chem.fromGrams(chem.toGrams(v, from as chem.MassUnit), to as chem.MassUnit);
      } else if (volU.includes(from) && volU.includes(to)) {
        out = chem.fromLiters(chem.toLiters(v, from as chem.VolumeUnit), to as chem.VolumeUnit);
      } else {
        throw new Error("Unità non compatibili o non riconosciute");
      }
      return {
        display: `${formatNumber(out)} ${to}`,
        value: out,
        formula: "conversione dimensionale",
        steps: [{ label: "Risultato", expression: `${v} ${from} = ${formatNumber(out)} ${to}` }],
      };
    },
  },
  {
    id: "ph-strong-acid",
    name: "pH acidi/basi forti",
    category: "Equilibri",
    description: "pH di acido o base forte monoprotico.",
    fields: [
      { key: "concentration", label: "Concentrazione (M)" },
      { key: "type", label: "Tipo (acido/base)", type: "text", placeholder: "acido" },
    ],
    compute: (i) => {
      const c = num(i, "concentration");
      const isBase = (i.type ?? "acido").toLowerCase().startsWith("bas");
      const ph = isBase ? chem.pHStrongBase(c) : chem.pHStrongAcid(c);
      return {
        display: `pH = ${formatNumber(ph, 2)}`,
        value: ph,
        formula: isBase ? "pH = 14 + log₁₀[OH⁻]" : "pH = -log₁₀[H⁺]",
        steps: [{ label: "Calcolo", expression: `${isBase ? "14 - (-log10(" : "-log10("}${formatNumber(c)}) = ${formatNumber(ph, 2)}` }],
      };
    },
  },
  {
    id: "ph-weak-acid",
    name: "pH acidi/basi deboli",
    category: "Equilibri",
    description: "pH approssimato con [H⁺] ≈ √(Ka·C) (valido per Ka ≪ C).",
    fields: [
      { key: "concentration", label: "Concentrazione (M)" },
      { key: "ka", label: "Ka (o Kb)" },
      { key: "type", label: "Tipo (acido/base)", type: "text", placeholder: "acido" },
    ],
    compute: (i) => {
      const c = num(i, "concentration");
      const k = num(i, "ka");
      const isBase = (i.type ?? "acido").toLowerCase().startsWith("bas");
      const ph = isBase ? chem.pHWeakBase(c, k) : chem.pHWeakAcid(c, k);
      return {
        display: `pH = ${formatNumber(ph, 2)}`,
        value: ph,
        formula: isBase ? "[OH⁻] ≈ √(Kb·C)" : "[H⁺] ≈ √(Ka·C)",
        steps: [{ label: "Approssimazione", expression: `√(${formatNumber(k)} × ${formatNumber(c)}) → pH ${formatNumber(ph, 2)}` }],
      };
    },
  },
  {
    id: "henderson",
    name: "Henderson-Hasselbalch",
    category: "Equilibri",
    description: "pH = pKa + log₁₀([A⁻]/[HA]).",
    fields: [
      { key: "pka", label: "pKa" },
      { key: "base", label: "[A⁻] (base coniugata)" },
      { key: "acid", label: "[HA] (acido)" },
    ],
    compute: (i) => {
      const ph = chem.hendersonHasselbalch(num(i, "pka"), num(i, "base"), num(i, "acid"));
      return {
        display: `pH = ${formatNumber(ph, 2)}`,
        value: ph,
        formula: "pH = pKa + log₁₀([A⁻]/[HA])",
        steps: [{ label: "Calcolo", expression: `${i.pka} + log10(${i.base}/${i.acid}) = ${formatNumber(ph, 2)}` }],
      };
    },
  },
  {
    id: "buffer-prep",
    name: "Preparazione buffer",
    category: "Equilibri",
    description: "Rapporto [A⁻]/[HA] per raggiungere il pH target.",
    fields: [
      { key: "pka", label: "pKa" },
      { key: "ph", label: "pH target" },
    ],
    compute: (i) => {
      const pka = num(i, "pka");
      const ph = num(i, "ph");
      const ratio = Math.pow(10, ph - pka);
      return {
        display: `[A⁻]/[HA] = ${formatNumber(ratio, 3)}`,
        value: ratio,
        formula: "[A⁻]/[HA] = 10^(pH − pKa)",
        steps: [{ label: "Rapporto", expression: `10^(${ph} − ${pka}) = ${formatNumber(ratio, 3)}` }],
      };
    },
  },
  {
    id: "ideal-gas",
    name: "Legge dei gas ideali",
    category: "Fisica",
    description: "PV = nRT (lascia vuoto il valore da calcolare). P in atm, V in L, T in K.",
    fields: [
      { key: "p", label: "P (atm)", optional: true },
      { key: "v", label: "V (L)", optional: true },
      { key: "n", label: "n (mol)", optional: true },
      { key: "t", label: "T (K)", optional: true },
    ],
    compute: (i) => {
      const r = chem.idealGas({ p: optNum(i, "p"), v: optNum(i, "v"), n: optNum(i, "n"), t: optNum(i, "t") });
      return {
        display: `P=${formatNumber(r.p)} atm · V=${formatNumber(r.v)} L · n=${formatNumber(r.n)} mol · T=${formatNumber(r.t)} K`,
        formula: "PV = nRT (R = 0.08206 L·atm·K⁻¹·mol⁻¹)",
        steps: [{ label: "Equazione", expression: `${formatNumber(r.p)} × ${formatNumber(r.v)} = ${formatNumber(r.n)} × R × ${formatNumber(r.t)}` }],
      };
    },
  },
  {
    id: "percent-yield",
    name: "Resa percentuale",
    category: "Rese",
    description: "Resa % = (resa reale / resa teorica) × 100.",
    fields: [
      { key: "actual", label: "Resa reale (g o mol)" },
      { key: "theoretical", label: "Resa teorica (g o mol)" },
    ],
    compute: (i) => {
      const p = chem.percentYield(num(i, "actual"), num(i, "theoretical"));
      return {
        display: `${formatNumber(p, 1)} %`,
        value: p,
        formula: "resa% = (reale / teorica) × 100",
        steps: [{ label: "Calcolo", expression: `(${i.actual} / ${i.theoretical}) × 100 = ${formatNumber(p, 1)}%` }],
      };
    },
  },
  {
    id: "atom-economy",
    name: "Atom economy",
    category: "Rese",
    description: "AE = (MM prodotto / Σ MM reagenti) × 100.",
    fields: [
      { key: "product", label: "MM prodotto desiderato (g/mol)" },
      { key: "reactants", label: "Σ MM reagenti (g/mol)" },
    ],
    compute: (i) => {
      const p = chem.atomEconomy(num(i, "product"), num(i, "reactants"));
      return {
        display: `${formatNumber(p, 1)} %`,
        value: p,
        formula: "AE = (MM_prodotto / Σ MM_reagenti) × 100",
        steps: [{ label: "Calcolo", expression: `(${i.product} / ${i.reactants}) × 100 = ${formatNumber(p, 1)}%` }],
      };
    },
  },
  {
    id: "limiting-reagent",
    name: "Reagente limitante",
    category: "Rese",
    description: "Confronta moli/coefficiente (formato: moli:coefficiente separati da virgola).",
    fields: [
      { key: "a", label: "Reagente A (moli, coeff)", type: "text", placeholder: "1, 1" },
      { key: "b", label: "Reagente B (moli, coeff)", type: "text", placeholder: "0.5, 2" },
      { key: "c", label: "Reagente C (moli, coeff)", type: "text", optional: true, placeholder: "opzionale" },
    ],
    compute: (i) => {
      const parse = (raw: string, id: string) => {
        const [m, c] = raw.split(/[,;]/).map((x) => Number(x.trim().replace(",", ".")));
        if (Number.isNaN(m) || Number.isNaN(c)) throw new Error(`Formato non valido per ${id}`);
        return { id, moles: m, coefficient: c };
      };
      const comps = [parse(i.a ?? "", "A"), parse(i.b ?? "", "B")];
      if (i.c && i.c.trim()) comps.push(parse(i.c, "C"));
      const r = chem.limitingReagent(comps);
      return {
        display: `Reagente limitante: ${r.limitingId}`,
        formula: "min(moli / coefficiente)",
        steps: r.ratios.map((x) => ({ label: `Reagente ${x.id}`, expression: `rapporto = ${formatNumber(x.ratio, 4)}` })),
      };
    },
  },
  {
    id: "concentration-conversion",
    name: "Conversione concentrazioni",
    category: "Concentrazioni",
    description: "Converte molarità in g/L usando la massa molare.",
    fields: [
      { key: "molarity", label: "Molarità (M)" },
      { key: "molarMass", label: "Massa molare (g/mol)" },
    ],
    compute: (i) => {
      const M = num(i, "molarity");
      const mm = num(i, "molarMass");
      const gl = M * mm;
      return {
        display: `${formatNumber(gl)} g/L`,
        value: gl,
        formula: "g/L = M × MM",
        steps: [{ label: "Calcolo", expression: `${formatNumber(M)} × ${formatNumber(mm)} = ${formatNumber(gl)} g/L` }],
      };
    },
  },
  {
    id: "density",
    name: "Densità, massa e volume",
    category: "Fisica",
    description: "ρ = m / V (lascia vuoto il valore da calcolare). ρ in g/mL.",
    fields: [
      { key: "density", label: "Densità (g/mL)", optional: true },
      { key: "mass", label: "Massa (g)", optional: true },
      { key: "volume", label: "Volume (mL)", optional: true },
    ],
    compute: (i) => {
      const r = chem.densityRelation({ density: optNum(i, "density"), mass: optNum(i, "mass"), volume: optNum(i, "volume") });
      return {
        display: `ρ=${formatNumber(r.density)} g/mL · m=${formatNumber(r.mass)} g · V=${formatNumber(r.volume)} mL`,
        formula: "ρ = m / V",
        steps: [{ label: "Relazione", expression: `${formatNumber(r.mass)} = ${formatNumber(r.density)} × ${formatNumber(r.volume)}` }],
      };
    },
  },
  {
    id: "beer-lambert",
    name: "Beer-Lambert",
    category: "Analitica",
    description: "A = ε·l·c (lascia vuoto il valore da calcolare).",
    fields: [
      { key: "a", label: "Assorbanza A", optional: true },
      { key: "epsilon", label: "ε (L·mol⁻¹·cm⁻¹)", optional: true },
      { key: "pathLength", label: "Cammino ottico l (cm)", optional: true },
      { key: "c", label: "Concentrazione c (mol/L)", optional: true },
    ],
    compute: (i) => {
      const r = chem.beerLambert({ a: optNum(i, "a"), epsilon: optNum(i, "epsilon"), pathLength: optNum(i, "pathLength"), c: optNum(i, "c") });
      return {
        display: `A=${formatNumber(r.a)} · ε=${formatNumber(r.epsilon)} · l=${formatNumber(r.pathLength)} cm · c=${formatNumber(r.c)} M`,
        formula: "A = ε · l · c",
        steps: [{ label: "Equazione", expression: `${formatNumber(r.a)} = ${formatNumber(r.epsilon)} × ${formatNumber(r.pathLength)} × ${formatNumber(r.c)}` }],
      };
    },
  },
  {
    id: "serial-dilution",
    name: "Diluizioni seriali",
    category: "Soluzioni",
    description: "Serie di concentrazioni per diluizioni successive.",
    fields: [
      { key: "initial", label: "Concentrazione iniziale (M)" },
      { key: "fold", label: "Fattore per step (es. 10)" },
      { key: "steps", label: "Numero di step" },
    ],
    compute: (i) => {
      const series = chem.serialDilution(num(i, "initial"), num(i, "fold"), Math.round(num(i, "steps")));
      return {
        display: series.map((c) => formatNumber(c)).join(" → ") + " M",
        formula: "Cₙ = C₀ / fⁿ",
        steps: series.map((c, idx) => ({ label: `Step ${idx}`, expression: `${formatNumber(c)} M` })),
      };
    },
  },
  {
    id: "rf",
    name: "Rf cromatografico",
    category: "Analitica",
    description: "Rf = distanza soluto / distanza fronte solvente.",
    fields: [
      { key: "spot", label: "Distanza soluto (cm)" },
      { key: "solvent", label: "Distanza fronte solvente (cm)" },
    ],
    compute: (i) => {
      const rf = chem.rf(num(i, "spot"), num(i, "solvent"));
      return {
        display: `Rf = ${formatNumber(rf, 3)}`,
        value: rf,
        formula: "Rf = d_soluto / d_solvente",
        steps: [{ label: "Calcolo", expression: `${i.spot} / ${i.solvent} = ${formatNumber(rf, 3)}` }],
      };
    },
  },
  {
    id: "ppm",
    name: "ppm / ppb",
    category: "Analitica",
    description: "ppm (mg/L) per soluzioni acquose diluite.",
    fields: [
      { key: "mass", label: "Massa soluto (mg)" },
      { key: "volume", label: "Volume soluzione (L)" },
    ],
    compute: (i) => {
      const p = chem.ppm(num(i, "mass"), num(i, "volume"));
      const b = chem.ppb(num(i, "mass"), num(i, "volume"));
      return {
        display: `${formatNumber(p, 3)} ppm (${formatNumber(b, 1)} ppb)`,
        value: p,
        formula: "ppm = mg_soluto / L_soluzione",
        steps: [{ label: "Calcolo", expression: `${i.mass} / ${i.volume} = ${formatNumber(p, 3)} ppm` }],
      };
    },
  },
  {
    id: "error",
    name: "Errore assoluto e relativo",
    category: "Statistica",
    description: "Errore assoluto e relativo di una misura.",
    fields: [
      { key: "measured", label: "Valore misurato" },
      { key: "true", label: "Valore vero" },
    ],
    compute: (i) => {
      const abs = chem.absoluteError(num(i, "measured"), num(i, "true"));
      const rel = chem.relativeError(num(i, "measured"), num(i, "true"));
      return {
        display: `Assoluto ${formatNumber(abs)} · Relativo ${formatNumber(rel, 2)}%`,
        value: rel,
        formula: "E_abs = |x − x₀| · E_rel = E_abs/|x₀| × 100",
        steps: [
          { label: "Errore assoluto", expression: `|${i.measured} − ${i.true}| = ${formatNumber(abs)}` },
          { label: "Errore relativo", expression: `${formatNumber(rel, 2)}%` },
        ],
      };
    },
  },
  {
    id: "std-dev",
    name: "Deviazione standard",
    category: "Statistica",
    description: "Deviazione standard campionaria (n−1). Valori separati da virgola.",
    fields: [{ key: "values", label: "Valori", type: "text", placeholder: "10.1, 10.3, 9.9, 10.2" }],
    compute: (i) => {
      const values = (i.values ?? "").split(/[,;\s]+/).filter(Boolean).map((x) => Number(x.replace(",", ".")));
      if (values.some((v) => Number.isNaN(v))) throw new Error("Uno o più valori non numerici");
      const m = chem.mean(values);
      const sd = chem.stdDev(values);
      return {
        display: `s = ${formatNumber(sd)} (media ${formatNumber(m)})`,
        value: sd,
        formula: "s = √(Σ(xᵢ−x̄)² / (n−1))",
        steps: [
          { label: "n", expression: `${values.length} valori` },
          { label: "Media", expression: `${formatNumber(m)}` },
          { label: "Dev. standard", expression: `${formatNumber(sd)}` },
        ],
      };
    },
  },
  {
    id: "confidence-interval",
    name: "Media e intervallo di confidenza",
    category: "Statistica",
    description: "Media e intervallo di confidenza (moltiplicatore z ≈ 1.96 per 95%).",
    fields: [
      { key: "values", label: "Valori", type: "text", placeholder: "10.1, 10.3, 9.9, 10.2" },
      { key: "multiplier", label: "Moltiplicatore (z/t)", optional: true, placeholder: "1.96" },
    ],
    compute: (i) => {
      const values = (i.values ?? "").split(/[,;\s]+/).filter(Boolean).map((x) => Number(x.replace(",", ".")));
      if (values.some((v) => Number.isNaN(v))) throw new Error("Uno o più valori non numerici");
      const mult = optNum(i, "multiplier") ?? 1.96;
      const ci = chem.confidenceInterval(values, mult);
      return {
        display: `${formatNumber(ci.mean)} ± ${formatNumber(ci.halfWidth)}`,
        value: ci.mean,
        formula: "IC = x̄ ± z · s/√n",
        steps: [
          { label: "Media", expression: `${formatNumber(ci.mean)}` },
          { label: "Semi-ampiezza", expression: `± ${formatNumber(ci.halfWidth)}` },
          { label: "Intervallo", expression: `[${formatNumber(ci.low)}, ${formatNumber(ci.high)}]` },
        ],
      };
    },
  },
];

export const CALCULATOR_BY_ID = new Map(CALCULATORS.map((c) => [c.id, c]));
