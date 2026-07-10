import { Navigate } from "react-router-dom";
import { Shield, Users, Database, Puzzle, ScrollText } from "lucide-react";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/store/auth";
import { useDb } from "@/store/db";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { pluginRegistry } from "@/features/plugins/registry";
import { relativeTime } from "@/lib/utils";

export default function Admin() {
  const user = useAuth((s) => s.user);
  const db = useDb();

  if (!can(user?.role, "platform:manage") && !can(user?.role, "organization:manage")) {
    return <EmptyState icon={<Shield className="h-10 w-10" />} title="Accesso negato" description="Solo gli amministratori possono accedere a questa sezione." />;
  }
  if (!user) return <Navigate to="/login" replace />;

  const stats = [
    { label: "Utenti", value: db.profiles.length, icon: Users },
    { label: "Composti", value: db.compounds.length, icon: Database },
    { label: "Plugin", value: pluginRegistry.list().length, icon: Puzzle },
    { label: "Log attività", value: db.activityLogs.length, icon: ScrollText },
  ];

  return (
    <div>
      <PageHeader
        title="Amministrazione"
        subtitle="Pannello piattaforma (demo)"
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Admin" }]}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between text-sm text-graphite-500"><span>{s.label}</span><s.icon className="h-4 w-4" /></div>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Utenti" />
          <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
            {db.profiles.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{p.avatarInitials}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.fullName}</p>
                  <p className="text-xs text-graphite-400">{p.email}</p>
                </div>
                <span className="rounded-full bg-graphite-100 px-2.5 py-0.5 text-xs dark:bg-graphite-800">{ROLE_LABELS[p.role]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Audit log" subtitle="Predisposto per future funzioni di compliance (non certificato)" />
          <div className="max-h-96 divide-y divide-graphite-100 overflow-y-auto dark:divide-graphite-800">
            {db.activityLogs.slice(0, 30).map((a) => (
              <div key={a.id} className="px-5 py-2 text-sm">
                <span className="font-medium">{db.profiles.find((p) => p.id === a.userId)?.fullName ?? "Sistema"}</span>{" "}
                <span className="text-graphite-500">{a.action} · {a.entity}</span>
                <span className="ml-2 text-xs text-graphite-400">{relativeTime(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
