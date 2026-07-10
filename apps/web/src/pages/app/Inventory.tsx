import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Boxes, Plus, Download, Upload, Search, AlertTriangle } from "lucide-react";
import type { InventoryCategory, InventoryItem, InventoryStatus } from "@chemlab/types";
import { Button, Card, EmptyState, Field, Input, Modal, Select, StatusBadge } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { can } from "@/lib/permissions";
import { downloadFile, parseCsv, toCsv } from "@/lib/csv";
import { formatDate, nowIso, uid } from "@/lib/utils";

const CATEGORIES: InventoryCategory[] = ["reagent", "solvent", "solution", "sample", "material", "standard", "consumable", "gas", "synthesized"];

function computeStatus(quantity: number, minStock?: number, expiry?: string): InventoryStatus {
  if (expiry && new Date(expiry).getTime() < Date.now()) return "expired";
  if (quantity <= 0) return "out";
  if (minStock != null && quantity < minStock) return "low";
  return "in_stock";
}

export default function Inventory() {
  const db = useDb();
  const insert = useDb((s) => s.insert);
  const logActivity = useDb((s) => s.logActivity);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [form, setForm] = useState({ name: "", category: "reagent" as InventoryCategory, quantity: "", unit: "g", minStock: "", supplier: "", lotNumber: "", expiryDate: "" });

  const canManage = can(user?.role, "inventory:manage");

  useEffect(() => {
    if (params.get("new") === "1") {
      setOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const filtered = useMemo(
    () =>
      db.inventoryItems
        .filter((i) => (catFilter === "all" ? true : i.category === catFilter))
        .filter((i) => i.name.toLowerCase().includes(query.toLowerCase()) || (i.lotNumber ?? "").toLowerCase().includes(query.toLowerCase())),
    [db.inventoryItems, catFilter, query],
  );

  const create = () => {
    if (!form.name.trim()) return;
    const quantity = Number(form.quantity) || 0;
    const minStock = form.minStock ? Number(form.minStock) : undefined;
    const item: InventoryItem = {
      id: uid(),
      workspaceId: "ws-1",
      name: form.name.trim(),
      category: form.category,
      quantity,
      unit: form.unit,
      initialQuantity: quantity,
      minStock,
      supplier: form.supplier || undefined,
      lotNumber: form.lotNumber || undefined,
      expiryDate: form.expiryDate || undefined,
      ownerId: user!.id,
      status: computeStatus(quantity, minStock, form.expiryDate || undefined),
      ghsPictograms: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: user!.id,
    };
    insert("inventoryItems", item);
    logActivity("create", "inventory", item.id, user!.id);
    toast("Reagente aggiunto", "success");
    setOpen(false);
    setForm({ name: "", category: "reagent", quantity: "", unit: "g", minStock: "", supplier: "", lotNumber: "", expiryDate: "" });
  };

  const exportCsv = () => {
    const cols = ["name", "category", "quantity", "unit", "minStock", "supplier", "lotNumber", "purity", "expiryDate", "status"];
    downloadFile(toCsv(db.inventoryItems as unknown as Record<string, unknown>[], cols), "inventario_chemlab.csv");
    toast("Inventario esportato (CSV)", "success");
  };

  const importCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result));
        let count = 0;
        let errors = 0;
        for (const r of rows) {
          if (!r.name) {
            errors++;
            continue;
          }
          const quantity = Number(r.quantity);
          if (Number.isNaN(quantity)) {
            errors++;
            continue;
          }
          const minStock = r.minStock ? Number(r.minStock) : undefined;
          insert("inventoryItems", {
            id: uid(),
            workspaceId: "ws-1",
            name: r.name,
            category: (CATEGORIES.includes(r.category as InventoryCategory) ? r.category : "reagent") as InventoryCategory,
            quantity,
            unit: r.unit || "g",
            minStock,
            supplier: r.supplier || undefined,
            lotNumber: r.lotNumber || undefined,
            purity: r.purity || undefined,
            expiryDate: r.expiryDate || undefined,
            ownerId: user!.id,
            status: computeStatus(quantity, minStock, r.expiryDate),
            ghsPictograms: [],
            createdAt: nowIso(),
            updatedAt: nowIso(),
            createdBy: user!.id,
          });
          count++;
        }
        toast(`Importati ${count} elementi${errors ? `, ${errors} righe ignorate` : ""}`, errors ? "info" : "success");
      } catch {
        toast("Errore durante l'importazione CSV", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const alerts = db.inventoryItems.filter((i) => i.status === "low" || i.status === "out" || i.status === "expired").length;

  return (
    <div>
      <PageHeader
        title="Inventario"
        subtitle={`${db.inventoryItems.length} elementi · ${alerts} alert`}
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Inventario" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
            {canManage && <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import CSV</Button>}
            {canManage && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Aggiungi</Button>}
            <input ref={fileRef} type="file" accept=".csv" hidden onChange={importCsv} />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-graphite-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca per nome o lotto…" className="pl-9" />
        </div>
        <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="w-48">
          <option value="all">Tutte le categorie</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Boxes className="h-10 w-10" />} title="Nessun elemento" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-graphite-200 bg-graphite-50 text-left text-xs uppercase text-graphite-500 dark:border-graphite-800 dark:bg-graphite-800/50">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Quantità</th>
                  <th className="px-4 py-3">Lotto</th>
                  <th className="px-4 py-3">Scadenza</th>
                  <th className="px-4 py-3">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800">
                {filtered.map((i) => (
                  <tr key={i.id} className="cursor-pointer hover:bg-graphite-50 dark:hover:bg-graphite-800/40" onClick={() => navigate(`/app/inventory/${i.id}`)}>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {(i.status === "low" || i.status === "out") && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                        {i.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-graphite-500">{i.category}</td>
                    <td className="px-4 py-3">{i.quantity} {i.unit}</td>
                    <td className="px-4 py-3 text-graphite-500">{i.lotNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-graphite-500">{formatDate(i.expiryDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Aggiungi reagente" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button><Button onClick={create} disabled={!form.name.trim()}>Aggiungi</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Field label="Nome" htmlFor="iname"><Input id="iname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus /></Field></div>
          <Field label="Categoria" htmlFor="icat"><Select id="icat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as InventoryCategory })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select></Field>
          <Field label="Fornitore" htmlFor="isup"><Input id="isup" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></Field>
          <Field label="Quantità" htmlFor="iqty"><Input id="iqty" inputMode="decimal" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
          <Field label="Unità" htmlFor="iunit"><Input id="iunit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field>
          <Field label="Soglia minima" htmlFor="imin"><Input id="imin" inputMode="decimal" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} /></Field>
          <Field label="Numero lotto" htmlFor="ilot"><Input id="ilot" value={form.lotNumber} onChange={(e) => setForm({ ...form, lotNumber: e.target.value })} /></Field>
          <div className="col-span-2"><Field label="Data scadenza" htmlFor="iexp"><Input id="iexp" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></Field></div>
        </div>
      </Modal>
    </div>
  );
}
