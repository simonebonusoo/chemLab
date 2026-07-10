import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useDb } from "@/store/db";
import { useUi } from "@/store/ui";
import { globalSearch, type SearchResult } from "@/lib/search";

const RECENT_KEY = "chemlab.recentSearches";

export function CommandPalette() {
  const open = useUi((s) => s.commandOpen);
  const setOpen = useUi((s) => s.setCommandOpen);
  const navigate = useNavigate();
  const db = useDb();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 30);
      try {
        setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
      } catch {
        setRecent([]);
      }
    }
  }, [open]);

  const results = useMemo(() => globalSearch(db, query), [db, query]);
  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const r of results) {
      const arr = map.get(r.category) ?? [];
      arr.push(r);
      map.set(r.category, arr);
    }
    return [...map.entries()];
  }, [results]);

  if (!open) return null;

  const go = (to: string) => {
    if (query.trim()) {
      const next = [query.trim(), ...recent.filter((r) => r !== query.trim())].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    }
    setOpen(false);
    navigate(to);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-graphite-200 bg-white shadow-2xl dark:border-graphite-800 dark:bg-graphite-900">
        <div className="flex items-center gap-3 border-b border-graphite-100 px-4 dark:border-graphite-800">
          <Search className="h-5 w-5 text-graphite-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca progetti, composti, esperimenti, reagenti…"
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-graphite-400"
          />
          <kbd className="rounded border border-graphite-200 px-1.5 py-0.5 text-[10px] text-graphite-400 dark:border-graphite-700">
            ESC
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!query && recent.length > 0 && (
            <div className="px-2 py-1">
              <p className="mb-1 px-1 text-xs font-medium text-graphite-400">Ricerche recenti</p>
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => setQuery(r)}
                  className="block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-graphite-100 dark:hover:bg-graphite-800"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
          {query && grouped.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-graphite-400">Nessun risultato.</p>
          )}
          {grouped.map(([category, items]) => (
            <div key={category} className="mb-1">
              <p className="px-3 py-1 text-xs font-medium text-graphite-400">{category}</p>
              {items.map((r) => (
                <button
                  key={r.id}
                  onClick={() => go(r.to)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-graphite-100 dark:hover:bg-graphite-800"
                >
                  <span className="text-sm font-medium">{r.title}</span>
                  {r.subtitle && <span className="text-xs text-graphite-400">{r.subtitle}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
