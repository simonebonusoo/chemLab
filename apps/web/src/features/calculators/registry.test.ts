import { describe, it, expect } from "vitest";
import { CALCULATOR_BY_ID } from "./registry";

describe("calculator registry", () => {
  it("molar mass calculator computes glucose", () => {
    const out = CALCULATOR_BY_ID.get("molar-mass")!.compute({ formula: "C6H12O6" });
    expect(out.value).toBeCloseTo(180.16, 1);
  });

  it("molarity matches the reference demo (0.4 M)", () => {
    const out = CALCULATOR_BY_ID.get("molarity")!.compute({
      mass: "5.844",
      mass__unit: "g",
      molarMass: "58.44",
      volume: "250",
      volume__unit: "mL",
    });
    expect(out.value).toBeCloseTo(0.4, 3);
  });

  it("dilution solves the missing value", () => {
    const out = CALCULATOR_BY_ID.get("dilution")!.compute({ c1: "1", c2: "0.1", v2: "100" });
    expect(out.display).toContain("V1=10");
  });

  it("percent yield returns 85%", () => {
    const out = CALCULATOR_BY_ID.get("percent-yield")!.compute({ actual: "8.5", theoretical: "10" });
    expect(out.value).toBeCloseTo(85, 3);
  });

  it("invalid formula throws a readable error", () => {
    expect(() => CALCULATOR_BY_ID.get("molar-mass")!.compute({ formula: "Zz9" })).toThrow();
  });

  it("every calculator has at least one field and a compute fn", () => {
    for (const [, calc] of CALCULATOR_BY_ID) {
      expect(calc.fields.length).toBeGreaterThan(0);
      expect(typeof calc.compute).toBe("function");
    }
  });
});
