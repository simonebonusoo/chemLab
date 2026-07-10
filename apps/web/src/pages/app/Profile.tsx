import { Card, CardHeader } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/store/auth";
import { useDb } from "@/store/db";
import { ROLE_LABELS, can, type Capability } from "@/lib/permissions";

const CAPS: [Capability, string][] = [
  ["project:create", "Creare progetti"],
  ["notebook:create", "Creare notebook"],
  ["experiment:manage", "Gestire esperimenti"],
  ["inventory:manage", "Gestire inventario"],
  ["members:manage", "Gestire membri"],
  ["organization:manage", "Gestire organizzazione"],
  ["platform:manage", "Amministrare piattaforma"],
];

export default function Profile() {
  const user = useAuth((s) => s.user);
  const db = useDb();
  if (!user) return null;

  const stats = {
    Progetti: db.projects.filter((p) => p.ownerId === user.id).length,
    Esperimenti: db.experiments.filter((e) => e.createdBy === user.id).length,
    Molecole: db.molecules.filter((m) => m.createdBy === user.id).length,
    Calcoli: db.savedCalculations.filter((c) => c.createdBy === user.id).length,
  };

  return (
    <div>
      <PageHeader title="Profilo" crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Profilo" }]} />

      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        <Card>
          <div className="flex flex-col items-center p-6 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">{user.avatarInitials}</span>
            <h2 className="mt-3 text-lg font-semibold">{user.fullName}</h2>
            <p className="text-sm text-graphite-400">{user.email}</p>
            <span className="mt-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30">{ROLE_LABELS[user.role]}</span>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(stats).map(([k, v]) => (
              <Card key={k} className="p-4 text-center">
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-xs text-graphite-400">{k}</p>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader title="Permessi del ruolo" />
            <div className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-2">
              {CAPS.map(([cap, label]) => (
                <div key={cap} className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${can(user.role, cap) ? "bg-emerald-500" : "bg-graphite-300"}`} />
                  <span className={can(user.role, cap) ? "" : "text-graphite-400 line-through"}>{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
