import { describe, it, expect } from "vitest";
import * as C from "./calculators";
import { toLiters, toGrams } from "./units";

const close = (a: number, b: number, tol = 1e-4) => Math.abs(a - b) < tol;

describe("moles / mass", () => {
  it("moles from mass", () => {
    // 5.844 g NaCl (58.44 g/mol) = 0.1 mol
    expect(close(C.molesFromMass(5.844, 58.44), 0.1)).toBe(true);
  });
  it("mass from moles", () => {
    expect(close(C.massFromMoles(0.25, 105.99), 26.4975)).toBe(true);
  });
});

describe("molarity", () => {
  it("matches the demo (5.844 g NaCl in 250 mL -> 0.4 M)", () => {
    const m = C.molarityFromMass(5.844, 58.44, toLiters(250, "mL"));
    expect(close(m, 0.4, 1e-3)).toBe(true);
  });
});

describe("dilution C1V1=C2V2", () => {
  it("solves for v1", () => {
    const r = C.dilution({ c1: 1, c2: 0.1, v2: 100 });
    expect(close(r.v1, 10)).toBe(true);
  });
  it("solves for c2", () => {
    const r = C.dilution({ c1: 2, v1: 5, v2: 50 });
    expect(close(r.c2, 0.2)).toBe(true);
  });
  it("throws when not exactly 3 provided", () => {
    expect(() => C.dilution({ c1: 1, c2: 0.1 })).toThrow();
  });
});

describe("pH", () => {
  it("strong acid 0.1 M -> pH 1", () => {
    expect(close(C.pHStrongAcid(0.1), 1, 1e-6)).toBe(true);
  });
  it("strong base 0.01 M -> pH 12", () => {
    expect(close(C.pHStrongBase(0.01), 12, 1e-6)).toBe(true);
  });
  it("weak acid (acetic, Ka 1.8e-5, 0.1 M) ≈ 2.87", () => {
    expect(close(C.pHWeakAcid(0.1, 1.8e-5), 2.87, 0.02)).toBe(true);
  });
  it("henderson-hasselbalch equal buffer -> pH = pKa", () => {
    expect(close(C.hendersonHasselbalch(4.76, 0.1, 0.1), 4.76)).toBe(true);
  });
});

describe("ideal gas", () => {
  it("1 mol at STP-ish (1 atm, 273.15 K) ≈ 22.41 L", () => {
    const r = C.idealGas({ p: 1, n: 1, t: 273.15 });
    expect(close(r.v, 22.41, 0.02)).toBe(true);
  });
});

describe("yield / atom economy", () => {
  it("percent yield", () => {
    expect(close(C.percentYield(8.5, 10), 85)).toBe(true);
  });
  it("atom economy", () => {
    expect(close(C.atomEconomy(100, 200), 50)).toBe(true);
  });
});

describe("beer-lambert", () => {
  it("solves for concentration", () => {
    const r = C.beerLambert({ a: 0.5, epsilon: 5000, pathLength: 1 });
    expect(close(r.c, 1e-4, 1e-8)).toBe(true);
  });
});

describe("limiting reagent", () => {
  it("finds the limiting reagent", () => {
    const r = C.limitingReagent([
      { id: "A", moles: 1, coefficient: 1 },
      { id: "B", moles: 0.5, coefficient: 2 },
    ]);
    expect(r.limitingId).toBe("B");
  });
});

describe("statistics", () => {
  it("mean and sample stddev", () => {
    expect(close(C.mean([2, 4, 6]), 4)).toBe(true);
    expect(close(C.stdDev([2, 4, 6]), 2)).toBe(true);
  });
  it("relative error", () => {
    expect(close(C.relativeError(9.5, 10), 5)).toBe(true);
  });
});

describe("units", () => {
  it("mass conversion", () => {
    expect(close(toGrams(500, "mg"), 0.5)).toBe(true);
  });
  it("volume conversion", () => {
    expect(close(toLiters(250, "mL"), 0.25)).toBe(true);
  });
});
