import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, Settings2 } from "lucide-react";
import type { InventoryMovement } from "@chemlab/types";
import { Button, Card, CardHeader, EmptyState, Field, Input, Select, StatusBadge } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { formatDate, formatDateTime, nowIso, uid } from "@/lib/utils";

export default function InventoryDetail() {
  const { id } = useParams();
  const db = useDb();
  const update = useDb((s) => s.update);
  const insert = useDb((s) => s.insert);
  const logActivity = useDb((s) => s.logActivity);
  const notify = useDb((s) => s.notify);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();

  const item = db.inventoryItems.find((i) => i.id === id);
  const movements = db.inventoryMovements.filter((m) => m.itemId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const [type, setType] = useState<"in" | "out" | "adjust">("out");
  const [amount, setAmount] = useState("");

  if (!item) {
    return <EmptyState title="Elemento non trovato" action={<Button onClick={() => navigate("/app/inventory")}>Torna all'inventario</Button>} />;
  }

  const compound = db.compounds.find((c) => c.id === item.compoundId);

  const applyMovement = () => {
    const qty = Number(amount);
    if (Number.isNaN(qty) || qty <= 0) {
      toast("Quantità non valida", "error");
      return;
    }
    let newQty = item.quantity;
    if (type === "in") newQty += qty;
    else if (type === "out") newQty = Math.max(0, item.quantity - qty);
    else newQty = qty;

    const status = newQty <= 0 ? "out" : item.minStock != null && newQty < item.minStock ? "low" : "in_stock";
    update("inventoryItems", item.id, { quantity: newQty, status });

    const movement: InventoryMovement = {
      id: uid(),
      itemId: item.id,
      type,
      quantity: qty,
      unit: item.unit,
      reason: type === "adjust" ? "Rettifica inventario" : type === "in" ? "Carico" : "Scarico",
      userId: user!.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    insert("inventoryMovements", movement);
    logActivity(type, "inventory", item.id, user!.id);
    if (status === "low") notify({ userId: user!.id, type: "low_stock", title: `${item.name} sotto soglia`, body: `${newQty} ${item.unit} rimasti` });
    setAmount("");
    toast("Movimento registrato", "success");
  };

  return (
    <div>
      <PageHeader
        title={item.name}
        subtitle={`${item.category} · lotto ${item.lotNumber ?? "—"}`}
        crumbs={[{ label: "Inventario", to: "/app/inventory" }, { label: item.name }]}
        actions={<StatusBadge status={item.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Dettagli" />
          <dl className="grid grid-cols-2 gap-y-3 p-5 text-sm sm:grid-cols-3">
            <Detail label="Quantità" value={`${item.quantity} ${item.unit}`} />
            <Detail label="Iniziale" value={`${item.initialQuantity ?? "—"} ${item.unit}`} />
            <Detail label="Soglia minima" value={item.minStock != null ? `${item.minStock} ${item.unit}` : "—"} />
            <Detail label="Fornitore" value={item.supplier ?? "—"} />
            <Detail label="Codice prodotto" value={item.productCode ?? "—"} />
            <Detail label="Purezza" value={item.purity ?? "—"} />
            <Detail label="Ubicazione" value={item.locationName ?? "—"} />
            <Detail label="Acquisto" value={formatDate(item.purchaseDate)} />
            <Detail label="Scadenza" value={formatDate(item.expiryDate)} />
            <Detail label="Conservazione" value={item.storageTemp ?? "—"} />
            <Detail label="Composto" value={compound?.preferredName ?? "—"} />
            <Detail label="GHS" value={item.ghsPictograms.join(", ") || "—"} />
          </dl>
        </Card>

        <Card>
          <CardHeader title="Movimento" />
          <div className="space-y-3 p-5">
            <Field label="Tipo" htmlFor="mtype">
              <Select id="mtype" value={type} onChange={(e) => setType(e.target.value as "in" | "out" | "adjust")}>
                <option value="out">Scarico</option>
                <option value="in">Carico</option>
                <option value="adjust">Rettifica (imposta a)</option>
              </Select>
            </Field>
            <Field label={`Quantità (${item.unit})`} htmlFor="mamt">
              <Input id="mamt" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Button onClick={applyMovement} className="w-full">
              {type === "in" ? <ArrowUpCircle className="h-4 w-4" /> : type === "out" ? <ArrowDownCircle className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
              Registra
            </Button>
            <div className="rounded-lg border border-graphite-200 p-3 text-center dark:border-graphite-700">
              <div className="mx-auto grid h-24 w-24 grid-cols-6 grid-rows-6 gap-0.5" aria-label="QR code demo">
                {Array.from({ length: 36 }).map((_, i) => (
                  <span key={i} className={((item.id.charCodeAt(i % item.id.length) + i) % 2 === 0) ? "bg-graphite-900 dark:bg-graphite-100" : ""} />
                ))}
              </div>
              <p className="mt-2 text-xs text-graphite-400">Barcode: {item.barcode ?? item.id.slice(0, 12)}</p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title={`Storico movimenti (${movements.length})`} />
          {movements.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-graphite-400">Nessun movimento registrato.</p>
          ) : (
            <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
              {movements.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${m.type === "in" ? "bg-emerald-100 text-emerald-700" : m.type === "out" ? "bg-amber-100 text-amber-700" : "bg-graphite-100 text-graphite-600"}`}>
                    {m.type === "in" ? "Carico" : m.type === "out" ? "Scarico" : "Rettifica"}
                  </span>
                  <span className="flex-1">{m.quantity} {m.unit} — {m.reason}</span>
                  <span className="text-xs text-graphite-400">{formatDateTime(m.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-graphite-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
