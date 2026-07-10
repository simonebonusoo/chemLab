import { useState } from "react";
import { Link } from "react-router-dom";
import { NotebookPen, Plus } from "lucide-react";
import type { Notebook } from "@chemlab/types";
import { Button, Card, EmptyState, Field, Input, Modal, Select, Textarea } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { nowIso, relativeTime, uid } from "@/lib/utils";

export default function Notebooks() {
  const db = useDb();
  const insert = useDb((s) => s.insert);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", projectId: "" });

  const create = () => {
    if (!form.name.trim()) return;
    const nb: Notebook = {
      id: uid(),
      workspaceId: "ws-1",
      projectId: form.projectId || undefined,
      name: form.name.trim(),
      description: form.description.trim(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: user!.id,
    };
    insert("notebooks", nb);
    toast("Notebook creato", "success");
    setOpen(false);
    setForm({ name: "", description: "", projectId: "" });
  };

  return (
    <div>
      <PageHeader
        title="Notebook"
        subtitle="Quaderni elettronici di laboratorio"
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Notebook" }]}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuovo notebook</Button>}
      />

      {db.notebooks.length === 0 ? (
        <EmptyState icon={<NotebookPen className="h-10 w-10" />} title="Nessun notebook" action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuovo notebook</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {db.notebooks.map((n) => {
            const pages = db.notebookPages.filter((p) => p.notebookId === n.id).length;
            return (
              <Link key={n.id} to={`/app/notebooks/${n.id}`}>
                <Card className="p-5 transition-colors hover:border-brand-300">
                  <NotebookPen className="mb-3 h-6 w-6 text-brand-600" />
                  <h3 className="font-semibold">{n.name}</h3>
                  <p className="mt-1 text-sm text-graphite-500">{n.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-graphite-400">
                    <span>{pages} pagine</span>
                    <span>{relativeTime(n.updatedAt)}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nuovo notebook" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button><Button onClick={create} disabled={!form.name.trim()}>Crea</Button></>}>
        <div className="space-y-4">
          <Field label="Nome" htmlFor="nbname"><Input id="nbname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus /></Field>
          <Field label="Descrizione" htmlFor="nbdesc"><Textarea id="nbdesc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Progetto" htmlFor="nbproj">
            <Select id="nbproj" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">Nessun progetto</option>
              {db.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
