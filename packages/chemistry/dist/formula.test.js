import { describe, it, expect } from "vitest";
import { molarMass, parseFormula, hillFormula, FormulaError } from "./formula";
const close = (a, b, tol = 0.02) => Math.abs(a - b) < tol;
describe("parseFormula", () => {
    it("parses simple formulas", () => {
        expect(parseFormula("H2O")).toEqual([
            { symbol: "H", count: 2 },
            { symbol: "O", count: 1 },
        ]);
    });
    it("handles parentheses with multipliers", () => {
        const c = parseFormula("Ca(OH)2");
        const map = new Map(c.map((x) => [x.symbol, x.count]));
        expect(map.get("Ca")).toBe(1);
        expect(map.get("O")).toBe(2);
        expect(map.get("H")).toBe(2);
    });
    it("handles nested brackets", () => {
        const c = parseFormula("K4[Fe(CN)6]");
        const map = new Map(c.map((x) => [x.symbol, x.count]));
        expect(map.get("K")).toBe(4);
        expect(map.get("Fe")).toBe(1);
        expect(map.get("C")).toBe(6);
        expect(map.get("N")).toBe(6);
    });
    it("handles hydrate dot notation", () => {
        const c = parseFormula("CuSO4·5H2O");
        const map = new Map(c.map((x) => [x.symbol, x.count]));
        expect(map.get("Cu")).toBe(1);
        expect(map.get("S")).toBe(1);
        expect(map.get("O")).toBe(9); // 4 + 5
        expect(map.get("H")).toBe(10);
    });
    it("rejects unknown elements", () => {
        expect(() => parseFormula("Xx2")).toThrow(FormulaError);
    });
});
describe("molarMass", () => {
    it("water ≈ 18.015 g/mol", () => {
        expect(close(molarMass("H2O").molarMass, 18.015)).toBe(true);
    });
    it("NaCl ≈ 58.44 g/mol", () => {
        expect(close(molarMass("NaCl").molarMass, 58.44)).toBe(true);
    });
    it("glucose C6H12O6 ≈ 180.16 g/mol", () => {
        expect(close(molarMass("C6H12O6").molarMass, 180.16, 0.05)).toBe(true);
    });
    it("aspirin C9H8O4 ≈ 180.16 g/mol", () => {
        expect(close(molarMass("C9H8O4").molarMass, 180.16, 0.05)).toBe(true);
    });
    it("composition percentages sum to 100", () => {
        const r = molarMass("C6H12O6");
        const sum = r.composition.reduce((a, c) => a + c.percent, 0);
        expect(close(sum, 100, 0.001)).toBe(true);
    });
});
describe("hillFormula", () => {
    it("orders carbon and hydrogen first", () => {
        expect(hillFormula(parseFormula("O4H8C9"))).toBe("C9H8O4");
    });
    it("orders alphabetically without carbon", () => {
        expect(hillFormula(parseFormula("O2H2"))).toBe("H2O2");
    });
});
//# sourceMappingURL=formula.test.js.map