import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./nav";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?(): void }) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-graphite-200 bg-white dark:border-graphite-800 dark:bg-graphite-900">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
          <svg viewBox="0 0 32 32" className="h-6 w-6">
            <g fill="none" stroke="#2dd4bf" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="10" cy="11" r="2.4" fill="#2dd4bf" stroke="none" />
              <circle cx="22" cy="11" r="2.4" fill="#8db5ff" stroke="none" />
              <circle cx="16" cy="22" r="2.4" fill="#ffffff" stroke="none" />
              <path d="M10 11 L16 22 L22 11" />
              <path d="M10 11 L22 11" />
            </g>
          </svg>
        </div>
        <div>
          <p className="font-bold leading-none text-graphite-900 dark:text-white">ChemLab</p>
          <p className="text-[10px] text-graphite-400">v1.0.0</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/app"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-graphite-600 hover:bg-graphite-100 dark:text-graphite-300 dark:hover:bg-graphite-800",
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {env.isDemo && (
        <div className="m-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              DEMO LOCALE
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-emerald-700/80 dark:text-emerald-400/80">
            Stai usando la modalità demo. I dati sono salvati solo nel tuo browser.
          </p>
        </div>
      )}
    </aside>
  );
}
