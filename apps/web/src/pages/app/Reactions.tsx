import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FlaskConical, Plus } from "lucide-react";
import type { Reaction } from "@chemlab/types";
import { Button, Card, EmptyState, Field, Input, Modal, StatusBadge } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { nowIso, relativeTime, uid } from "@/lib/utils";

export default function Reactions() {
  const db = useDb();
  const insert = useDb((s) => s.insert);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });

  useEffect(() => {
    if (params.get("new") === "1") {
      setOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const create = () => {
    if (!form.name.trim()) return;
    const rxn: Reaction = {
      id: uid(),
      workspaceId: "ws-1",
      name: form.name.trim(),
      code: form.code.trim() || `RXN-${Date.now().toString().slice(-4)}`,
      components: [],
      status: "planned",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: user!.id,
    };
    insert("reactions", rxn);
    toast("Reazione creata", "success");
    setOpen(false);
    setForm({ name: "", code: "" });
    navigate(`/app/reactions/${rxn.id}`);
  };

  const clone = (r: Reaction) => {
    const copy: Reaction = { ...r, id: uid(), name: `${r.name} (copia)`, code: `${r.code}-C`, createdAt: nowIso(), updatedAt: nowIso() };
    insert("reactions", copy);
    toast("Reazione clonata", "success");
  };

  return (
    <div>
      <PageHeader
        title="Reazioni"
        subtitle="Schemi di reazione e tabella stechiometrica"
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Reazioni" }]}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuova reazione</Button>}
      />

      {db.reactions.length === 0 ? (
        <EmptyState icon={<FlaskConical className="h-10 w-10" />} title="Nessuna reazione" action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nuova reazione</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {db.reactions.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <Link to={`/app/reactions/${r.id}`} className="flex-1 p-5">
                <FlaskConical className="mb-2 h-6 w-6 text-brand-600" />
                <h3 className="font-semibold">{r.name}</h3>
                <p className="text-xs text-graphite-400">{r.code}</p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={r.status} />
                  {r.yieldPercent != null && <span className="text-sm font-medium text-emerald-600">{r.yieldPercent}%</span>}
                </div>
              </Link>
              <div className="flex divide-x divide-graphite-100 border-t border-graphite-100 text-xs dark:divide-graphite-800 dark:border-graphite-800">
                <button onClick={() => clone(r)} className="flex-1 py-2 hover:bg-graphite-50 dark:hover:bg-graphite-800/50">Clona</button>
                <span className="flex-1 py-2 text-center text-graphite-400">{relativeTime(r.updatedAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nuova reazione" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button><Button onClick={create} disabled={!form.name.trim()}>Crea</Button></>}>
        <div className="space-y-4">
          <Field label="Nome" htmlFor="rname"><Input id="rname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus /></Field>
          <Field label="Codice (opzionale)" htmlFor="rcode"><Input id="rcode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="RXN-001" /></Field>
        </div>
      </Modal>
    </div>
  );
}
