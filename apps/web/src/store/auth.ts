import { create } from "zustand";
import type { Profile, Role } from "@chemlab/types";
import { DEMO_USERS } from "@/data/seed";
import { env } from "@/lib/env";

const SESSION_KEY = "chemlab.session.v1";

interface AuthState {
  user: Profile | null;
  initialized: boolean;
  init(): void;
  login(email: string, password: string): { ok: boolean; error?: string };
  register(input: { fullName: string; email: string; role: Role }): { ok: boolean; error?: string };
  logout(): void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  initialized: false,

  init() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        set({ user: JSON.parse(raw) as Profile, initialized: true });
        return;
      }
    } catch {
      /* ignore */
    }
    set({ initialized: true });
  },

  login(email, password) {
    // DEMO mode: validate against the built-in demo accounts.
    // PRODUCTION: this would call supabase.auth.signInWithPassword (see env.isDemo).
    const match = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!match) {
      return { ok: false, error: "Credenziali non valide. Usa un account demo." };
    }
    const { password: _pw, ...profile } = match;
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    set({ user: profile });
    return { ok: true };
  },

  register(input) {
    if (!env.isDemo) {
      return { ok: false, error: "Registrazione disponibile solo con Supabase configurato." };
    }
    // Demo registration: create an in-session profile (not persisted to seed DB).
    const profile: Profile = {
      id: "u-" + Math.random().toString(36).slice(2, 8),
      email: input.email,
      fullName: input.fullName,
      role: input.role,
      organizationId: "org-1",
      avatarInitials: input.fullName
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join(""),
      title: "Nuovo utente",
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    set({ user: profile });
    return { ok: true };
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    set({ user: null });
  },
}));
