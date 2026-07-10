import { molarMass, type MolarMassResult } from "@chemlab/chemistry";

/**
 * ChemLab Draw editor adapter.
 *
 * The 2D drawing CANVAS is designed to host an open-source editor (Ketcher).
 * This adapter defines the integration contract so Ketcher (or Kekule.js) can be
 * mounted without changing the rest of the app. Integration steps are documented
 * in docs/CHEMISTRY_ENGINE.md and README (§ChemLab Draw).
 *
 * IMPORTANT (rule: never falsify scientific results): we do NOT parse SMILES with
 * a home-made parser. Accurate properties come from either:
 *   • a molecular FORMULA (computed locally, exact — see molarMass), or
 *   • the RDKit chemistry-engine microservice (SMILES→formula/MW/InChI/logP…).
 * When the engine is unavailable, SMILES-derived properties are marked as
 * "richiede chemistry-engine" rather than invented.
 */
export interface MoleculeEditorAdapter {
  readonly id: string;
  readonly name: string;
  /** Mount the editor into a container element. */
  mount(container: HTMLElement): Promise<void>;
  getSmiles(): Promise<string>;
  setSmiles(smiles: string): Promise<void>;
  getMolfile(): Promise<string>;
  exportImage(format: "svg" | "png"): Promise<Blob>;
}

/**
 * Placeholder adapter: no bundled canvas yet. It advertises that Ketcher is the
 * intended editor and returns clear errors instead of fake output.
 */
export class KetcherAdapterStub implements MoleculeEditorAdapter {
  readonly id = "ketcher";
  readonly name = "Ketcher (open-source)";
  private unavailable(): never {
    throw new Error("Editor Ketcher non ancora montato in questa build (adapter predisposto).");
  }
  async mount(): Promise<void> {
    // In a full build: dynamic import of 'ketcher-react' + 'ketcher-standalone'.
    return;
  }
  async getSmiles(): Promise<string> {
    this.unavailable();
  }
  async setSmiles(): Promise<void> {
    this.unavailable();
  }
  async getMolfile(): Promise<string> {
    this.unavailable();
  }
  async exportImage(): Promise<Blob> {
    this.unavailable();
  }
}

/** Compute exact molecular properties from a chemical FORMULA (offline, accurate). */
export function propertiesFromFormula(formula: string): MolarMassResult {
  return molarMass(formula);
}
