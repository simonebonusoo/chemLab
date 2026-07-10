import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  FlaskConical,
  Atom,
  Boxes,
  NotebookPen,
  Calculator,
  Plus,
  Beaker,
  Upload,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, StatusBadge } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { relativeTime } from "@/lib/utils";

export default function Dashboard() {
  const db = useDb();
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  const stats = [
    { label: "Progetti attivi", value: db.projects.filter((p) => p.status === "active").length, icon: FolderKanban, to: "/app/projects" },
    { label: "Esperimenti", value: db.experiments.length, icon: FlaskConical, to: "/app/experiments" },
    { label: "Molecole salvate", value: db.molecules.length, icon: Atom, to: "/app/molecules" },
    { label: "Reazioni", value: db.reactions.length, icon: Beaker, to: "/app/reactions" },
    { label: "Inventario", value: db.inventoryItems.length, icon: Boxes, to: "/app/inventory" },
  ];

  const quickActions = [
    { label: "Nuovo progetto", icon: FolderKanban, to: "/app/projects?new=1" },
    { label: "Nuovo esperimento", icon: FlaskConical, to: "/app/experiments?new=1" },
    { label: "Nuova molecola", icon: Atom, to: "/app/draw" },
    { label: "Nuova reazione", icon: Beaker, to: "/app/reactions?new=1" },
    { label: "Nuovo calcolo", icon: Calculator, to: "/app/calculators" },
    { label: "Aggiungi reagente", icon: Boxes, to: "/app/inventory?new=1" },
    { label: "Importa file", icon: Upload, to: "/app/files" },
    { label: "Apri notebook", icon: NotebookPen, to: "/app/notebooks" },
  ];

  const lowStock = db.inventoryItems.filter((i) => i.status === "low" || i.status === "out");
  const recentProjects = [...db.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const recentNotebooks = [...db.notebooks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const recentExperiments = [...db.experiments].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  const userName = (id?: string) => db.profiles.find((p) => p.id === id)?.fullName ?? "Utente";

  return (
    <div>
      <PageHeader
        title={`Ciao, ${user?.fullName.split(" ")[0]} 👋`}
        subtitle="Panoramica del tuo lavoro e attività recenti"
      />

      {/* Quick actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.to)}
            className="inline-flex items-center gap-2 rounded-lg border border-graphite-200 bg-white px-3 py-2 text-sm font-medium text-graphite-700 hover:border-brand-300 hover:text-brand-600 dark:border-graphite-800 dark:bg-graphite-900 dark:text-graphite-200"
          >
            <a.icon className="h-4 w-4" /> {a.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="rounded-xl border border-graphite-200 bg-white p-4 transition-colors hover:border-brand-300 dark:border-graphite-800 dark:bg-graphite-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-graphite-500">{s.label}</span>
              <s.icon className="h-4 w-4 text-graphite-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-graphite-900 dark:text-white">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent projects */}
        <Card>
          <CardHeader title="Progetti recenti" action={<Link to="/app/projects" className="text-sm text-brand-600">Vedi tutti</Link>} />
          <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
            {recentProjects.map((p) => (
              <Link key={p.id} to={`/app/projects/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-graphite-50 dark:hover:bg-graphite-800/50">
                <span className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: p.color + "22" }}>
                  <span className="flex h-full w-full items-center justify-center text-sm" style={{ color: p.color }}>
                    <FolderKanban className="h-4 w-4" />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-graphite-400">{relativeTime(p.updatedAt)}</p>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent notebooks */}
        <Card>
          <CardHeader title="Notebook recenti" action={<Link to="/app/notebooks" className="text-sm text-brand-600">Vedi tutti</Link>} />
          <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
            {recentNotebooks.map((n) => (
              <Link key={n.id} to={`/app/notebooks/${n.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-graphite-50 dark:hover:bg-graphite-800/50">
                <NotebookPen className="h-4 w-4 text-graphite-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{n.name}</p>
                  <p className="truncate text-xs text-graphite-400">{n.description}</p>
                </div>
                <span className="text-xs text-graphite-400">{relativeTime(n.updatedAt)}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent experiments */}
        <Card>
          <CardHeader title="Esperimenti recenti" action={<Link to="/app/experiments" className="text-sm text-brand-600">Vedi tutti</Link>} />
          <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
            {recentExperiments.map((e) => (
              <Link key={e.id} to={`/app/experiments/${e.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-graphite-50 dark:hover:bg-graphite-800/50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-graphite-400">{e.code}</p>
                </div>
                <StatusBadge status={e.status} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader
            title="Inventario in esaurimento"
            action={<Link to="/app/inventory" className="text-sm text-brand-600">Vedi tutto</Link>}
          />
          <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
            {lowStock.length === 0 && <p className="px-5 py-6 text-center text-sm text-graphite-400">Nessun alert.</p>}
            {lowStock.map((i) => (
              <Link key={i.id} to={`/app/inventory/${i.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-graphite-50 dark:hover:bg-graphite-800/50">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-graphite-400">
                    {i.quantity} {i.unit} · soglia {i.minStock} {i.unit}
                  </p>
                </div>
                <StatusBadge status={i.status} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Team activity */}
        <Card>
          <CardHeader title="Attività del team" />
          <div className="max-h-80 divide-y divide-graphite-100 overflow-y-auto dark:divide-graphite-800">
            {db.activityLogs.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
                  {(db.profiles.find((p) => p.id === a.userId)?.avatarInitials) ?? "??"}
                </span>
                <p className="flex-1 text-sm text-graphite-600 dark:text-graphite-300">
                  <span className="font-medium">{userName(a.userId)}</span> {a.action} {a.entity.replace("_", " ")}
                </p>
                <span className="text-xs text-graphite-400">{relativeTime(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick tools */}
        <Card>
          <CardHeader title="Strumenti rapidi" />
          <div className="grid grid-cols-3 gap-3 p-5">
            {[
              { label: "Draw", icon: Atom, to: "/app/draw" },
              { label: "Calcolatori", icon: Calculator, to: "/app/calculators" },
              { label: "Database", icon: Boxes, to: "/app/compounds" },
              { label: "Spettri", icon: FlaskConical, to: "/app/spectra" },
              { label: "File", icon: Upload, to: "/app/files" },
              { label: "Plugin", icon: Plus, to: "/app/plugins" },
            ].map((t) => (
              <Link
                key={t.label}
                to={t.to}
                className="flex flex-col items-center gap-2 rounded-lg border border-graphite-200 py-4 text-center hover:border-brand-300 hover:bg-brand-50 dark:border-graphite-800 dark:hover:bg-brand-900/20"
              >
                <t.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-medium">{t.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Link to="/app/plugins" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
          Esplora i moduli ChemLab <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
