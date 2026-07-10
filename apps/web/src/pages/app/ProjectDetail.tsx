import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FolderKanban, NotebookPen, FlaskConical, Users } from "lucide-react";
import { Button, Card, CardHeader, EmptyState, StatusBadge, Tabs } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { formatDate, relativeTime } from "@/lib/utils";

export default function ProjectDetail() {
  const { id } = useParams();
  const db = useDb();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const project = db.projects.find((p) => p.id === id);

  if (!project) {
    return <EmptyState title="Progetto non trovato" action={<Button onClick={() => navigate("/app/projects")}>Torna ai progetti</Button>} />;
  }

  const notebooks = db.notebooks.filter((n) => n.projectId === project.id);
  const experiments = db.experiments.filter((e) => e.projectId === project.id);
  const reactions = db.reactions.filter((r) => r.projectId === project.id);
  const files = db.files.filter((f) => f.projectId === project.id);
  const activity = db.activityLogs.filter((a) => a.entityId === project.id);
  const members = db.profiles.filter((p) => project.memberIds.includes(p.id));

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={project.description}
        crumbs={[{ label: "Progetti", to: "/app/projects" }, { label: project.name }]}
        actions={<StatusBadge status={project.status} />}
      />

      <div className="mb-4 flex flex-wrap gap-4">
        {[
          { label: "Notebook", value: notebooks.length, icon: NotebookPen },
          { label: "Esperimenti", value: experiments.length, icon: FlaskConical },
          { label: "Reazioni", value: reactions.length, icon: FolderKanban },
          { label: "Membri", value: members.length, icon: Users },
        ].map((s) => (
          <Card key={s.label} className="flex-1 min-w-[150px] p-4">
            <div className="flex items-center gap-2 text-sm text-graphite-500">
              <s.icon className="h-4 w-4" /> {s.label}
            </div>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "overview", label: "Panoramica" },
          { id: "notebooks", label: `Notebook (${notebooks.length})` },
          { id: "experiments", label: `Esperimenti (${experiments.length})` },
          { id: "files", label: `File (${files.length})` },
          { id: "activity", label: "Attività" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-5">
        {tab === "overview" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title="Dettagli" />
              <dl className="grid grid-cols-2 gap-y-3 p-5 text-sm">
                <dt className="text-graphite-500">Proprietario</dt>
                <dd>{db.profiles.find((p) => p.id === project.ownerId)?.fullName}</dd>
                <dt className="text-graphite-500">Workspace</dt>
                <dd>{db.workspaces.find((w) => w.id === project.workspaceId)?.name}</dd>
                <dt className="text-graphite-500">Creato</dt>
                <dd>{formatDate(project.createdAt)}</dd>
                <dt className="text-graphite-500">Aggiornato</dt>
                <dd>{relativeTime(project.updatedAt)}</dd>
                <dt className="text-graphite-500">Tag</dt>
                <dd>{project.tags.join(", ") || "—"}</dd>
              </dl>
            </Card>
            <Card>
              <CardHeader title="Membri" />
              <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{m.avatarInitials}</span>
                    <div>
                      <p className="text-sm font-medium">{m.fullName}</p>
                      <p className="text-xs text-graphite-400">{m.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "notebooks" && (
          <div className="space-y-2">
            {notebooks.length === 0 ? (
              <EmptyState title="Nessun notebook" description="Questo progetto non ha ancora notebook." />
            ) : (
              notebooks.map((n) => (
                <Link key={n.id} to={`/app/notebooks/${n.id}`} className="flex items-center gap-3 rounded-lg border border-graphite-200 bg-white px-4 py-3 hover:border-brand-300 dark:border-graphite-800 dark:bg-graphite-900">
                  <NotebookPen className="h-4 w-4 text-graphite-400" />
                  <span className="flex-1 text-sm font-medium">{n.name}</span>
                  <span className="text-xs text-graphite-400">{relativeTime(n.updatedAt)}</span>
                </Link>
              ))
            )}
          </div>
        )}

        {tab === "experiments" && (
          <div className="space-y-2">
            {experiments.length === 0 ? (
              <EmptyState title="Nessun esperimento" />
            ) : (
              experiments.map((e) => (
                <Link key={e.id} to={`/app/experiments/${e.id}`} className="flex items-center gap-3 rounded-lg border border-graphite-200 bg-white px-4 py-3 hover:border-brand-300 dark:border-graphite-800 dark:bg-graphite-900">
                  <FlaskConical className="h-4 w-4 text-graphite-400" />
                  <span className="flex-1 text-sm font-medium">{e.title}</span>
                  <StatusBadge status={e.status} />
                </Link>
              ))
            )}
          </div>
        )}

        {tab === "files" && (
          <div className="space-y-2">
            {files.length === 0 ? <EmptyState title="Nessun file" /> : files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-lg border border-graphite-200 bg-white px-4 py-3 dark:border-graphite-800 dark:bg-graphite-900">
                <span className="text-xs font-semibold uppercase text-brand-600">{f.extension}</span>
                <span className="flex-1 text-sm">{f.name}</span>
                <span className="text-xs text-graphite-400">{formatDate(f.createdAt)}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "activity" && (
          <Card>
            <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
              {activity.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-graphite-400">Nessuna attività registrata.</p>
              ) : (
                activity.map((a) => (
                  <div key={a.id} className="px-5 py-3 text-sm">
                    <span className="font-medium">{db.profiles.find((p) => p.id === a.userId)?.fullName}</span> {a.action} {a.entity}
                    <span className="ml-2 text-xs text-graphite-400">{relativeTime(a.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
