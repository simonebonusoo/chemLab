import { ELEMENT_BY_SYMBOL } from "./periodic-table";
export class FormulaError extends Error {
    constructor(message) {
        super(message);
        this.name = "FormulaError";
    }
}
/**
 * Parse a molecular formula into element counts.
 * Supports nested parentheses/brackets and hydrate dot notation, e.g.
 * "Ca(OH)2", "CuSO4·5H2O", "K4[Fe(CN)6]".
 */
export function parseFormula(input) {
    const formula = input.trim();
    if (!formula)
        throw new FormulaError("Formula vuota");
    // Split on hydrate separators (·, *, .) at top level and sum the parts.
    // A leading multiplier like "5H2O" is supported inside each part.
    const totals = new Map();
    const parts = formula.split(/[·*.]/).filter((p) => p.length > 0);
    for (const part of parts) {
        const { counts } = parseGroup(part, 0);
        for (const [sym, n] of counts) {
            totals.set(sym, (totals.get(sym) ?? 0) + n);
        }
    }
    return [...totals.entries()].map(([symbol, count]) => ({ symbol, count }));
}
function parseGroup(s, start) {
    const counts = new Map();
    let i = start;
    // Optional leading multiplier for hydrate parts, e.g. "5H2O".
    let leading = 1;
    const leadMatch = /^(\d+)/.exec(s.slice(i));
    if (leadMatch && i === start) {
        leading = parseInt(leadMatch[1], 10);
        i += leadMatch[1].length;
    }
    while (i < s.length) {
        const ch = s[i];
        if (ch === "(" || ch === "[") {
            const { counts: inner, next } = parseGroup(s, i + 1);
            i = next;
            const mult = readNumber(s, i);
            i = mult.next;
            for (const [sym, n] of inner) {
                counts.set(sym, (counts.get(sym) ?? 0) + n * mult.value);
            }
        }
        else if (ch === ")" || ch === "]") {
            applyLeading(counts, leading);
            return { counts, next: i + 1 };
        }
        else if (/[A-Z]/.test(ch)) {
            const symMatch = /^[A-Z][a-z]?/.exec(s.slice(i));
            const symbol = symMatch[0];
            if (!ELEMENT_BY_SYMBOL.has(symbol)) {
                throw new FormulaError(`Elemento sconosciuto: "${symbol}"`);
            }
            i += symbol.length;
            const num = readNumber(s, i);
            i = num.next;
            counts.set(symbol, (counts.get(symbol) ?? 0) + num.value);
        }
        else if (/\s/.test(ch)) {
            i += 1;
        }
        else {
            throw new FormulaError(`Carattere non valido: "${ch}"`);
        }
    }
    applyLeading(counts, leading);
    return { counts, next: i };
}
function applyLeading(counts, leading) {
    if (leading === 1)
        return;
    for (const [sym, n] of counts)
        counts.set(sym, n * leading);
}
function readNumber(s, i) {
    const m = /^\d+/.exec(s.slice(i));
    if (!m)
        return { value: 1, next: i };
    return { value: parseInt(m[0], 10), next: i + m[0].length };
}
/** Compute molar mass (g/mol) and elemental composition of a formula. */
export function molarMass(input) {
    const counts = parseFormula(input);
    if (counts.length === 0)
        throw new FormulaError("Nessun elemento trovato");
    let total = 0;
    const rows = counts.map(({ symbol, count }) => {
        const el = ELEMENT_BY_SYMBOL.get(symbol);
        const mass = el.weight * count;
        total += mass;
        return { symbol, count, mass };
    });
    return {
        molarMass: total,
        composition: rows.map((r) => ({ ...r, percent: (r.mass / total) * 100 })),
        formula: hillFormula(counts),
    };
}
/** Format element counts in Hill order (C, H, then alphabetical). */
export function hillFormula(counts) {
    const map = new Map();
    for (const { symbol, count } of counts) {
        map.set(symbol, (map.get(symbol) ?? 0) + count);
    }
    const has = (s) => map.has(s);
    const ordered = [];
    if (has("C")) {
        ordered.push("C");
        if (has("H"))
            ordered.push("H");
        for (const s of [...map.keys()].filter((s) => s !== "C" && s !== "H").sort())
            ordered.push(s);
    }
    else {
        for (const s of [...map.keys()].sort())
            ordered.push(s);
    }
    return ordered
        .map((s) => (map.get(s) === 1 ? s : `${s}${map.get(s)}`))
        .join("");
}
//# sourceMappingURL=formula.js.map