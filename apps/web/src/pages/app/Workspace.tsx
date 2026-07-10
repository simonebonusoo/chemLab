import { Link } from "react-router-dom";
import { LayoutGrid, FolderKanban, Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";

export default function Workspace() {
  const db = useDb();

  return (
    <div>
      <PageHeader
        title="Workspace"
        subtitle="Organizzazioni, workspace e membri"
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Workspace" }]}
      />

      {db.organizations.map((org) => (
        <div key={org.id} className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold">{org.name}</h2>
            <span className="text-sm text-graphite-400">{db.profiles.length} membri</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {db.workspaces.filter((w) => w.organizationId === org.id).map((w) => {
              const projects = db.projects.filter((p) => p.workspaceId === w.id);
              return (
                <Card key={w.id}>
                  <CardHeader title={w.name} subtitle={w.description} />
                  <div className="p-5">
                    <div className="mb-3 flex gap-6 text-sm">
                      <span className="flex items-center gap-1.5 text-graphite-500"><FolderKanban className="h-4 w-4" /> {projects.length} progetti</span>
                      <span className="flex items-center gap-1.5 text-graphite-500"><Users className="h-4 w-4" /> {db.profiles.length} membri</span>
                    </div>
                    <div className="space-y-1">
                      {projects.slice(0, 4).map((p) => (
                        <Link key={p.id} to={`/app/projects/${p.id}`} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-graphite-100 dark:hover:bg-graphite-800">
                          {p.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <Card>
        <CardHeader title="Membri organizzazione" />
        <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
          {db.profiles.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-5 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{m.avatarInitials}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{m.fullName}</p>
                <p className="text-xs text-graphite-400">{m.email}</p>
              </div>
              <span className="rounded-full bg-graphite-100 px-2.5 py-0.5 text-xs text-graphite-600 dark:bg-graphite-800">{m.title}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
