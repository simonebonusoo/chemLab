import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FolderKanban, Plus, Star, Search } from "lucide-react";
import type { Project, ProjectStatus } from "@chemlab/types";
import { Button, Card, EmptyState, Field, Input, Modal, Select, StatusBadge, Textarea } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { can } from "@/lib/permissions";
import { nowIso, relativeTime, uid } from "@/lib/utils";

const COLORS = ["#2f66f6", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444", "#0ea5e9"];
const STATUSES: ProjectStatus[] = ["draft", "active", "paused", "completed", "archived"];

export default function Projects() {
  const projects = useDb((s) => s.projects);
  const insert = useDb((s) => s.insert);
  const update = useDb((s) => s.update);
  const remove = useDb((s) => s.remove);
  const logActivity = useDb((s) => s.logActivity);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [form, setForm] = useState({ name: "", description: "", color: COLORS[0], status: "active" as ProjectStatus, tags: "" });

  useEffect(() => {
    if (params.get("new") === "1") {
      setOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const filtered = useMemo(
    () =>
      projects
        .filter((p) => (statusFilter === "all" ? true : p.status === statusFilter))
        .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => Number(b.starred) - Number(a.starred) || b.updatedAt.localeCompare(a.updatedAt)),
    [projects, statusFilter, query],
  );

  const create = () => {
    if (!form.name.trim()) return;
    const project: Project = {
      id: uid(),
      workspaceId: "ws-1",
      name: form.name.trim(),
      description: form.description.trim(),
      color: form.color,
      icon: "flask",
      status: form.status,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      ownerId: user!.id,
      memberIds: [user!.id],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: user!.id,
    };
    insert("projects", project);
    logActivity("create", "project", project.id, user!.id);
    toast("Progetto creato", "success");
    setOpen(false);
    setForm({ name: "", description: "", color: COLORS[0], status: "active", tags: "" });
    navigate(`/app/projects/${project.id}`);
  };

  const duplicate = (p: Project) => {
    const copy: Project = { ...p, id: uid(), name: `${p.name} (copia)`, starred: false, createdAt: nowIso(), updatedAt: nowIso() };
    insert("projects", copy);
    toast("Progetto duplicato", "success");
  };

  const exportJson = (p: Project) => {
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Progetti"
        subtitle="Organizza il tuo lavoro in progetti e workspace"
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Progetti" }]}
        actions={
          can(user?.role, "project:create") && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Nuovo progetto
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-graphite-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca progetti…" className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="all">Tutti gli stati</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-10 w-10" />}
          title="Nessun progetto"
          description="Crea il tuo primo progetto per iniziare a organizzare esperimenti e notebook."
          action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuovo progetto</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <Link to={`/app/projects/${p.id}`} className="flex-1 p-5">
                <div className="mb-3 flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: p.color + "22", color: p.color }}>
                    <FolderKanban className="h-5 w-5" />
                  </span>
                  {p.starred && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                </div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-graphite-500">{p.description || "—"}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-graphite-100 px-2 py-0.5 text-xs text-graphite-600 dark:bg-graphite-800 dark:text-graphite-300">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
              <div className="flex items-center justify-between border-t border-graphite-100 px-5 py-2.5 dark:border-graphite-800">
                <StatusBadge status={p.status} />
                <span className="text-xs text-graphite-400">{relativeTime(p.updatedAt)}</span>
              </div>
              <div className="flex divide-x divide-graphite-100 border-t border-graphite-100 text-xs dark:divide-graphite-800 dark:border-graphite-800">
                <button onClick={() => update("projects", p.id, { starred: !p.starred })} className="flex-1 py-2 hover:bg-graphite-50 dark:hover:bg-graphite-800/50">
                  {p.starred ? "Rimuovi ★" : "Preferito"}
                </button>
                <button onClick={() => duplicate(p)} className="flex-1 py-2 hover:bg-graphite-50 dark:hover:bg-graphite-800/50">Duplica</button>
                <button onClick={() => update("projects", p.id, { status: "archived" })} className="flex-1 py-2 hover:bg-graphite-50 dark:hover:bg-graphite-800/50">Archivia</button>
                <button onClick={() => exportJson(p)} className="flex-1 py-2 hover:bg-graphite-50 dark:hover:bg-graphite-800/50">Export</button>
                <button
                  onClick={() => {
                    if (confirm(`Eliminare "${p.name}"?`)) {
                      remove("projects", p.id);
                      toast("Progetto eliminato");
                    }
                  }}
                  className="flex-1 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Elimina
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuovo progetto"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
            <Button onClick={create} disabled={!form.name.trim()}>Crea progetto</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nome" htmlFor="pname">
            <Input id="pname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="es. Sintesi di Aspirina" autoFocus />
          </Field>
          <Field label="Descrizione" htmlFor="pdesc">
            <Textarea id="pdesc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stato" htmlFor="pstatus">
              <Select id="pstatus" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Colore">
              <div className="flex gap-2 pt-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`h-7 w-7 rounded-full ${form.color === c ? "ring-2 ring-offset-2 ring-graphite-400" : ""}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Colore ${c}`}
                  />
                ))}
              </div>
            </Field>
          </div>
          <Field label="Tag (separati da virgola)" htmlFor="ptags">
            <Input id="ptags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="sintesi, organica" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
