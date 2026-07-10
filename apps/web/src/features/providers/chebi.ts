import { nowIso } from "@/lib/utils";
import type { CompoundProvider, ProviderCompound } from "./types";

/**
 * ChEBI provider (public data). ChEBI's public API is SOAP/XML; a browser-side
 * fetch is CORS-restricted, so this adapter is PREDISPOSED: the interface and
 * caching are implemented, and the actual calls should be proxied through the
 * ChemLab API/`chemistry-engine` in production. In demo it returns an explicit
 * "not reachable from browser" error handled gracefully by callers.
 *
 * Docs: https://www.ebi.ac.uk/chebi/webServices.do
 */
export class ChEBIProvider implements CompoundProvider {
  readonly id = "chebi";
  readonly name = "ChEBI";

  private notReachable(): never {
    throw new Error(
      "ChEBI non è raggiungibile direttamente dal browser (CORS). Configura il proxy API in produzione.",
    );
  }

  async searchByName(_name: string): Promise<ProviderCompound[]> {
    this.notReachable();
  }
  async searchByFormula(_formula: string): Promise<ProviderCompound[]> {
    this.notReachable();
  }
  async searchByIdentifier(_kind: string, _value: string): Promise<ProviderCompound[]> {
    this.notReachable();
  }
  async getCompoundDetails(externalId: string): Promise<ProviderCompound | null> {
    // Shape kept for parity; real resolution happens server-side.
    return {
      provider: "ChEBI",
      externalId,
      chebiId: externalId,
      sourceUrl: `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${externalId}`,
      fetchedAt: nowIso(),
      preferredName: externalId,
      synonyms: [],
    };
  }
}
