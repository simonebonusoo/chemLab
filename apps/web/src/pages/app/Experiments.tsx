import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FlaskConical, Plus } from "lucide-react";
import type { Experiment } from "@chemlab/types";
import { Button, Card, EmptyState, Field, Input, Modal, Select, StatusBadge, Textarea } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { nowIso, relativeTime, uid } from "@/lib/utils";

export default function Experiments() {
  const db = useDb();
  const insert = useDb((s) => s.insert);
  const logActivity = useDb((s) => s.logActivity);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", objective: "", projectId: "" });

  useEffect(() => {
    if (params.get("new") === "1") {
      setOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const create = () => {
    if (!form.title.trim()) return;
    const exp: Experiment = {
      id: uid(),
      workspaceId: "ws-1",
      projectId: form.projectId || undefined,
      code: `EXP-${new Date().getFullYear()}-${String(db.experiments.length + 1).padStart(3, "0")}`,
      title: form.title.trim(),
      objective: form.objective.trim(),
      status: "planned",
      reactionIds: [],
      tags: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: user!.id,
    };
    insert("experiments", exp);
    logActivity("create", "experiment", exp.id, user!.id);
    toast("Esperimento creato", "success");
    setOpen(false);
    setForm({ title: "", objective: "", projectId: "" });
    navigate(`/app/experiments/${exp.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Esperimenti"
        subtitle="Documenta protocolli, condizioni e risultati"
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Esperimenti" }]}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuovo esperimento</Button>}
      />

      {db.experiments.length === 0 ? (
        <EmptyState icon={<FlaskConical className="h-10 w-10" />} title="Nessun esperimento" action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuovo esperimento</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
            {db.experiments.map((e) => (
              <Link key={e.id} to={`/app/experiments/${e.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-graphite-50 dark:hover:bg-graphite-800/40">
                <FlaskConical className="h-4 w-4 text-graphite-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-graphite-400">{e.code} · {e.objective}</p>
                </div>
                <span className="text-xs text-graphite-400">{relativeTime(e.updatedAt)}</span>
                <StatusBadge status={e.status} />
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nuovo esperimento" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button><Button onClick={create} disabled={!form.title.trim()}>Crea</Button></>}>
        <div className="space-y-4">
          <Field label="Titolo" htmlFor="etitle"><Input id="etitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus /></Field>
          <Field label="Obiettivo" htmlFor="eobj"><Textarea id="eobj" rows={2} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></Field>
          <Field label="Progetto" htmlFor="eproj">
            <Select id="eproj" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">Nessun progetto</option>
              {db.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
