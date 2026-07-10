import type { Compound } from "@chemlab/types";

/** Normalised result returned by any compound data provider. */
export interface ProviderCompound {
  provider: string;
  externalId?: string;
  sourceUrl?: string;
  fetchedAt: string;
  preferredName: string;
  iupacName?: string;
  synonyms: string[];
  formula?: string;
  molarMass?: number;
  smiles?: string;
  canonicalSmiles?: string;
  inchi?: string;
  inchiKey?: string;
  pubchemCid?: string;
  chebiId?: string;
  casNumber?: string;
  /** Raw payload for provenance (kept, never silently merged across sources). */
  raw?: unknown;
}

export interface CompoundProvider {
  readonly id: string;
  readonly name: string;
  searchByName(name: string): Promise<ProviderCompound[]>;
  searchByFormula(formula: string): Promise<ProviderCompound[]>;
  searchByIdentifier(kind: "cid" | "inchikey" | "smiles" | "cas", value: string): Promise<ProviderCompound[]>;
  getCompoundDetails(externalId: string): Promise<ProviderCompound | null>;
}

export function toCompound(pc: ProviderCompound, workspaceId: string, id: string): Compound {
  return {
    id,
    workspaceId,
    preferredName: pc.preferredName,
    iupacName: pc.iupacName,
    synonyms: pc.synonyms,
    formula: pc.formula,
    molarMass: pc.molarMass,
    smiles: pc.smiles,
    canonicalSmiles: pc.canonicalSmiles,
    inchi: pc.inchi,
    inchiKey: pc.inchiKey,
    pubchemCid: pc.pubchemCid,
    chebiId: pc.chebiId,
    casNumber: pc.casNumber,
    casSource: pc.casNumber ? `${pc.provider} (verificare con SDS ufficiale)` : undefined,
    ghsPictograms: [],
    hazardStatements: [],
    precautionaryStatements: [],
    properties: [],
    sourceProvider: pc.provider,
    sourceUrl: pc.sourceUrl,
    createdAt: pc.fetchedAt,
    updatedAt: pc.fetchedAt,
  };
}
