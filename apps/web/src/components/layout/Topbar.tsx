import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Sun, Moon, Monitor, LogOut, User, Menu } from "lucide-react";
import { IconButton } from "@/components/ui";
import { useUi } from "@/store/ui";
import { useAuth } from "@/store/auth";
import { useDb } from "@/store/db";
import { ROLE_LABELS } from "@/lib/permissions";
import { relativeTime } from "@/lib/utils";

export function Topbar({ onToggleSidebar }: { onToggleSidebar(): void }) {
  const setCommandOpen = useUi((s) => s.setCommandOpen);
  const theme = useUi((s) => s.theme);
  const setTheme = useUi((s) => s.setTheme);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const notifications = useDb((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const cycleTheme = () => setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-graphite-200 bg-white/90 px-4 backdrop-blur dark:border-graphite-800 dark:bg-graphite-900/90">
      <IconButton label="Menu" className="lg:hidden" onClick={onToggleSidebar}>
        <Menu className="h-5 w-5" />
      </IconButton>

      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-10 max-w-xl flex-1 items-center gap-2 rounded-lg border border-graphite-200 bg-graphite-50 px-3 text-sm text-graphite-400 hover:border-graphite-300 dark:border-graphite-700 dark:bg-graphite-800/50"
      >
        <Search className="h-4 w-4" />
        <span>Cerca in tutto ChemLab…</span>
        <kbd className="ml-auto rounded border border-graphite-200 px-1.5 py-0.5 text-[10px] dark:border-graphite-700">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <IconButton label={`Tema: ${theme}`} onClick={cycleTheme}>
          <ThemeIcon className="h-5 w-5" />
        </IconButton>

        <div className="relative">
          <IconButton label="Notifiche" onClick={() => setShowNotif((v) => !v)}>
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </IconButton>
          {showNotif && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-graphite-200 bg-white shadow-xl dark:border-graphite-800 dark:bg-graphite-900">
                <div className="flex items-center justify-between border-b border-graphite-100 px-4 py-3 dark:border-graphite-800">
                  <span className="font-semibold">Notifiche</span>
                  <Link
                    to="/app/notifications"
                    className="text-xs text-brand-600"
                    onClick={() => setShowNotif(false)}
                  >
                    Vedi tutte
                  </Link>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 6).map((n) => (
                    <div key={n.id} className="border-b border-graphite-50 px-4 py-2.5 dark:border-graphite-800/50">
                      <p className="text-sm font-medium text-graphite-800 dark:text-graphite-100">{n.title}</p>
                      {n.body && <p className="text-xs text-graphite-500">{n.body}</p>}
                      <p className="mt-0.5 text-[11px] text-graphite-400">{relativeTime(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUser((v) => !v)}
            className="ml-1 flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-graphite-100 dark:hover:bg-graphite-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {user?.avatarInitials}
            </span>
          </button>
          {showUser && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUser(false)} />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-graphite-200 bg-white py-1 shadow-xl dark:border-graphite-800 dark:bg-graphite-900">
                <div className="border-b border-graphite-100 px-4 py-3 dark:border-graphite-800">
                  <p className="text-sm font-semibold">{user?.fullName}</p>
                  <p className="text-xs text-graphite-400">{user && ROLE_LABELS[user.role]}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUser(false);
                    navigate("/app/profile");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-graphite-100 dark:hover:bg-graphite-800"
                >
                  <User className="h-4 w-4" /> Profilo
                </button>
                <button
                  onClick={() => {
                    setShowUser(false);
                    logout();
                    navigate("/login");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-graphite-100 dark:hover:bg-graphite-800"
                >
                  <LogOut className="h-4 w-4" /> Esci
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
