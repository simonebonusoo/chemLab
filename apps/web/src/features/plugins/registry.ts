import { PluginRegistry, type PluginModule } from "@chemlab/plugins-sdk";

/**
 * Built-in modules of the ChemLab suite. These map to core routes and are
 * registered at build time (safe — no arbitrary remote code). Third-party
 * plugins would be added here through a reviewed manifest.
 */
const BUILT_IN: PluginModule[] = [
  {
    manifest: {
      id: "chemlab-notebook",
      name: "ChemLab Notebook",
      version: "1.0.0",
      author: "ChemLab",
      description: "Quaderno elettronico di laboratorio con blocchi chimici.",
      icon: "notebook",
      category: "analysis",
      routes: [{ path: "/app/notebooks", label: "Notebook" }],
      permissions: ["read:projects", "write:projects"],
      builtIn: true,
    },
  },
  {
    manifest: {
      id: "chemlab-draw",
      name: "ChemLab Draw",
      version: "1.0.0",
      author: "ChemLab",
      description: "Editor molecolare 2D (adapter Ketcher/open-source).",
      icon: "atom",
      category: "visualizer",
      routes: [{ path: "/app/draw", label: "Draw" }],
      permissions: ["write:compounds"],
      builtIn: true,
    },
  },
  {
    manifest: {
      id: "chemlab-calculator",
      name: "ChemLab Calculator",
      version: "1.0.0",
      author: "ChemLab",
      description: "Suite di 28+ calcolatori chimici validati.",
      icon: "calculator",
      category: "calculator",
      routes: [{ path: "/app/calculators", label: "Calcolatori" }],
      permissions: [],
      builtIn: true,
    },
  },
  {
    manifest: {
      id: "chemlab-inventory",
      name: "ChemLab Inventory",
      version: "1.0.0",
      author: "ChemLab",
      description: "Gestione reagenti, lotti, ubicazioni e movimenti.",
      icon: "boxes",
      category: "analysis",
      routes: [{ path: "/app/inventory", label: "Inventario" }],
      permissions: ["read:inventory", "write:inventory"],
      builtIn: true,
    },
  },
  {
    manifest: {
      id: "chemlab-data",
      name: "ChemLab Data",
      version: "1.0.0",
      author: "ChemLab",
      description: "Registro composti con provider PubChem/ChEBI.",
      icon: "database",
      category: "data-provider",
      routes: [{ path: "/app/compounds", label: "Database" }],
      permissions: ["read:compounds", "network"],
      settings: [
        { key: "pubchemEnabled", label: "Abilita PubChem", type: "boolean", default: true },
        { key: "chebiEnabled", label: "Abilita ChEBI", type: "boolean", default: true },
      ],
      builtIn: true,
    },
  },
  {
    manifest: {
      id: "chemlab-spectra",
      name: "ChemLab Spectra",
      version: "0.9.0",
      author: "ChemLab",
      description: "Visualizzazione spettri JCAMP-DX / CSV XY.",
      icon: "activity",
      category: "visualizer",
      routes: [{ path: "/app/spectra", label: "Spettri" }],
      permissions: ["read:files"],
      builtIn: true,
    },
  },
  {
    manifest: {
      id: "chemlab-ai",
      name: "ChemLab AI",
      version: "0.1.0",
      author: "ChemLab",
      description: "Assistente AI per chimica (predisposto — non attivo).",
      icon: "sparkles",
      category: "ai",
      routes: [],
      permissions: ["network"],
      dependencies: ["chemlab-data"],
      builtIn: true,
    },
  },
];

export const pluginRegistry = new PluginRegistry();
for (const m of BUILT_IN) {
  // ChemLab AI ships disabled by default (predisposed for the future).
  pluginRegistry.register(m, m.manifest.id !== "chemlab-ai");
}
