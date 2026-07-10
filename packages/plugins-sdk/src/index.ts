/**
 * ChemLab Plugin SDK.
 *
 * Plugins are registered at build-time through a controlled manifest. The
 * browser does NOT execute arbitrary remote code — a plugin contributes a
 * React component (loaded lazily from the app bundle) plus metadata. This keeps
 * the surface safe while allowing the platform to grow modularly.
 */

export type PluginCategory =
  | "calculator"
  | "visualizer"
  | "data-provider"
  | "analysis"
  | "ai"
  | "instrument"
  | "importer"
  | "exporter";

export type PluginPermission =
  | "read:projects"
  | "write:projects"
  | "read:inventory"
  | "write:inventory"
  | "read:compounds"
  | "write:compounds"
  | "read:files"
  | "write:files"
  | "network";

export interface PluginRoute {
  /** Path segment mounted under /app/plugins/:id. */
  path: string;
  label: string;
}

export interface PluginSettingsField {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "select";
  options?: string[];
  default?: unknown;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  icon: string;
  category: PluginCategory;
  routes: PluginRoute[];
  permissions: PluginPermission[];
  settings?: PluginSettingsField[];
  dependencies?: string[];
  /** true for modules shipped with the core build. */
  builtIn?: boolean;
}

/** Minimal API surface exposed to a plugin at runtime. */
export interface PluginAPI {
  notify(message: string, kind?: "info" | "success" | "error"): void;
  getCurrentUserRole(): string;
}

/** A plugin module pairs a manifest with an (optional) React entry component. */
export interface PluginModule {
  manifest: PluginManifest;
  /** Dynamic import of the plugin's entry component. */
  load?: () => Promise<{ default: unknown }>;
}

export class PluginRegistry {
  private readonly modules = new Map<string, PluginModule>();
  private readonly enabled = new Set<string>();

  register(module: PluginModule, enabledByDefault = true): void {
    this.modules.set(module.manifest.id, module);
    if (enabledByDefault) this.enabled.add(module.manifest.id);
  }

  list(): PluginModule[] {
    return [...this.modules.values()];
  }

  get(id: string): PluginModule | undefined {
    return this.modules.get(id);
  }

  isEnabled(id: string): boolean {
    return this.enabled.has(id);
  }

  setEnabled(id: string, value: boolean): void {
    if (value) this.enabled.add(id);
    else this.enabled.delete(id);
  }
}
