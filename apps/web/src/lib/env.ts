/**
 * Runtime environment detection.
 *
 * ChemLab runs in DEMO LOCAL mode unless a full Supabase configuration is
 * present. Demo mode persists to localStorage; production mode would use
 * Supabase (Auth/Postgres/Storage/Realtime). The Supabase client is
 * lazy-wired — this MVP ships the demo backend and a documented production
 * path (see docs/ARCHITECTURE.md).
 */
interface AppEnv {
  appName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
  chemistryEngineUrl: string;
  isDemo: boolean;
}

function read(key: string): string {
  const v = import.meta.env[key as keyof ImportMetaEnv];
  return typeof v === "string" ? v : "";
}

const supabaseUrl = read("VITE_SUPABASE_URL");
const supabaseAnonKey = read("VITE_SUPABASE_ANON_KEY");

export const env: AppEnv = {
  appName: read("VITE_APP_NAME") || "ChemLab",
  supabaseUrl,
  supabaseAnonKey,
  apiUrl: read("VITE_API_URL") || "http://localhost:3001",
  chemistryEngineUrl: read("VITE_CHEMISTRY_ENGINE_URL") || "http://localhost:8000",
  // Demo unless BOTH Supabase vars are configured.
  isDemo: !(supabaseUrl && supabaseAnonKey),
};
