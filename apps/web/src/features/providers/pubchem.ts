import { nowIso } from "@/lib/utils";
import type { CompoundProvider, ProviderCompound } from "./types";

/**
 * PubChem PUG REST provider (public data). Uses a short in-memory + localStorage
 * cache to avoid repeated calls. Fails gracefully — callers fall back to local
 * data and surface a clear error rather than blocking the app.
 *
 * Docs: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
 */
const BASE =
  (import.meta.env.VITE_PUBCHEM_API_URL as string | undefined) ||
  "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

const CACHE_KEY = "chemlab.pubchem.cache.v1";
const cache = new Map<string, ProviderCompound[]>();

function loadCache(): void {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) for (const [k, v] of Object.entries(JSON.parse(raw))) cache.set(k, v as ProviderCompound[]);
  } catch {
    /* ignore */
  }
}
function saveCache(): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(cache)));
  } catch {
    /* ignore */
  }
}
loadCache();

async function fetchJson(url: string, timeoutMs = 8000): Promise<unknown> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`PubChem HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

interface PubChemProps {
  PropertyTable?: {
    Properties?: Array<{
      CID: number;
      MolecularFormula?: string;
      MolecularWeight?: string;
      CanonicalSMILES?: string;
      IUPACName?: string;
      InChI?: string;
      InChIKey?: string;
    }>;
  };
}

async function propsForCids(cids: number[]): Promise<ProviderCompound[]> {
  if (cids.length === 0) return [];
  const list = cids.slice(0, 10).join(",");
  const url = `${BASE}/compound/cid/${list}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,InChI,InChIKey/JSON`;
  const data = (await fetchJson(url)) as PubChemProps;
  const props = data.PropertyTable?.Properties ?? [];
  return props.map((p) => ({
    provider: "PubChem",
    externalId: String(p.CID),
    pubchemCid: String(p.CID),
    sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${p.CID}`,
    fetchedAt: nowIso(),
    preferredName: p.IUPACName ?? `CID ${p.CID}`,
    iupacName: p.IUPACName,
    synonyms: [],
    formula: p.MolecularFormula,
    molarMass: p.MolecularWeight ? Number(p.MolecularWeight) : undefined,
    smiles: p.CanonicalSMILES,
    canonicalSmiles: p.CanonicalSMILES,
    inchi: p.InChI,
    inchiKey: p.InChIKey,
    raw: p,
  }));
}

export class PubChemProvider implements CompoundProvider {
  readonly id = "pubchem";
  readonly name = "PubChem";

  private async cached(key: string, fn: () => Promise<ProviderCompound[]>): Promise<ProviderCompound[]> {
    if (cache.has(key)) return cache.get(key)!;
    const result = await fn();
    cache.set(key, result);
    saveCache();
    return result;
  }

  async searchByName(name: string): Promise<ProviderCompound[]> {
    return this.cached(`name:${name}`, async () => {
      const url = `${BASE}/compound/name/${encodeURIComponent(name)}/cids/JSON`;
      const data = (await fetchJson(url)) as { IdentifierList?: { CID?: number[] } };
      return propsForCids(data.IdentifierList?.CID ?? []);
    });
  }

  async searchByFormula(formula: string): Promise<ProviderCompound[]> {
    return this.cached(`formula:${formula}`, async () => {
      const url = `${BASE}/compound/fastformula/${encodeURIComponent(formula)}/cids/JSON`;
      const data = (await fetchJson(url)) as { IdentifierList?: { CID?: number[] } };
      return propsForCids((data.IdentifierList?.CID ?? []).slice(0, 10));
    });
  }

  async searchByIdentifier(kind: "cid" | "inchikey" | "smiles" | "cas", value: string): Promise<ProviderCompound[]> {
    return this.cached(`${kind}:${value}`, async () => {
      if (kind === "cid") return propsForCids([Number(value)]);
      const path = kind === "inchikey" ? "inchikey" : kind === "smiles" ? "smiles" : "name";
      const url = `${BASE}/compound/${path}/${encodeURIComponent(value)}/cids/JSON`;
      const data = (await fetchJson(url)) as { IdentifierList?: { CID?: number[] } };
      return propsForCids(data.IdentifierList?.CID ?? []);
    });
  }

  async getCompoundDetails(externalId: string): Promise<ProviderCompound | null> {
    const list = await propsForCids([Number(externalId)]);
    return list[0] ?? null;
  }
}

/** PubChem is a public REST API — usable in demo and production. */
export const isPubChemConfigured = () => Boolean(BASE);
