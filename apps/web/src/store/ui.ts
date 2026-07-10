import { create } from "zustand";
import { uid } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

interface Toast {
  id: string;
  message: string;
  kind: "info" | "success" | "error";
}

interface UiState {
  theme: Theme;
  toasts: Toast[];
  commandOpen: boolean;
  setTheme(theme: Theme): void;
  initTheme(): void;
  toast(message: string, kind?: Toast["kind"]): void;
  dismissToast(id: string): void;
  setCommandOpen(open: boolean): void;
}

const THEME_KEY = "chemlab.theme";

function applyTheme(theme: Theme): void {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export const useUi = create<UiState>((set, get) => ({
  theme: "system",
  toasts: [],
  commandOpen: false,

  initTheme() {
    const stored = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "system";
    applyTheme(stored);
    set({ theme: stored });
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (get().theme === "system") applyTheme("system");
      });
  },

  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },

  toast(message, kind = "info") {
    const t: Toast = { id: uid(), message, kind };
    set((s) => ({ toasts: [...s.toasts, t] }));
    setTimeout(() => get().dismissToast(t.id), 3500);
  },

  dismissToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  setCommandOpen(open) {
    set({ commandOpen: open });
  },
}));
