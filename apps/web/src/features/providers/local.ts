import type { Compound } from "@chemlab/types";
import { nowIso } from "@/lib/utils";
import type { CompoundProvider, ProviderCompound } from "./types";

function fromCompound(c: Compound): ProviderCompound {
  return {
    provider: "Locale",
    externalId: c.id,
    fetchedAt: nowIso(),
    preferredName: c.preferredName,
    iupacName: c.iupacName,
    synonyms: c.synonyms,
    formula: c.formula,
    molarMass: c.molarMass,
    smiles: c.smiles,
    canonicalSmiles: c.canonicalSmiles,
    inchi: c.inchi,
    inchiKey: c.inchiKey,
    pubchemCid: c.pubchemCid,
    chebiId: c.chebiId,
    casNumber: c.casNumber,
  };
}

/** Searches the compounds already saved in the local ChemLab database. */
export class LocalCompoundProvider implements CompoundProvider {
  readonly id = "local";
  readonly name = "Database locale";
  constructor(private readonly getCompounds: () => Compound[]) {}

  private filter(pred: (c: Compound) => boolean): Promise<ProviderCompound[]> {
    return Promise.resolve(this.getCompounds().filter(pred).map(fromCompound));
  }

  searchByName(name: string): Promise<ProviderCompound[]> {
    const q = name.toLowerCase();
    return this.filter(
      (c) =>
        c.preferredName.toLowerCase().includes(q) ||
        (c.iupacName?.toLowerCase().includes(q) ?? false) ||
        c.synonyms.some((s) => s.toLowerCase().includes(q)),
    );
  }
  searchByFormula(formula: string): Promise<ProviderCompound[]> {
    return this.filter((c) => c.formula?.toLowerCase() === formula.toLowerCase());
  }
  searchByIdentifier(kind: string, value: string): Promise<ProviderCompound[]> {
    return this.filter((c) => {
      if (kind === "cid") return c.pubchemCid === value;
      if (kind === "inchikey") return c.inchiKey === value;
      if (kind === "smiles") return c.smiles === value;
      if (kind === "cas") return c.casNumber === value;
      return false;
    });
  }
  async getCompoundDetails(externalId: string): Promise<ProviderCompound | null> {
    const c = this.getCompounds().find((x) => x.id === externalId);
    return c ? fromCompound(c) : null;
  }
}
