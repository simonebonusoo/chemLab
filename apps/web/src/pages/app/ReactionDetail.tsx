import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Calculator } from "lucide-react";
import type { Reaction, ReactionComponent, ReactionComponentRole } from "@chemlab/types";
import { limitingReagent, molarMass as calcMolarMass, molesFromMass, percentYield } from "@chemlab/chemistry";
import { Button, Card, CardHeader, EmptyState, Input, Select, StatusBadge } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useUi } from "@/store/ui";
import { formatNumber, uid } from "@/lib/utils";

const ROLES: ReactionComponentRole[] = ["reactant", "reagent", "product", "catalyst", "solvent"];

export default function ReactionDetail() {
  const { id } = useParams();
  const db = useDb();
  const update = useDb((s) => s.update);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const reaction = db.reactions.find((r) => r.id === id);
  const [actualYield, setActualYield] = useState(reaction?.actualYield?.toString() ?? "");

  if (!reaction) return <EmptyState title="Reazione non trovata" action={<Button onClick={() => navigate("/app/reactions")}>Torna alle reazioni</Button>} />;

  // Compute moles from mass (g) / molar mass for each component when possible.
  const withMoles = reaction.components.map((c) => {
    let moles = c.moles;
    if (moles == null && c.molarMass && c.amount != null && (c.amountUnit === "g" || c.amountUnit == null)) {
      try {
        moles = molesFromMass(c.amount, c.molarMass);
      } catch {
        moles = undefined;
      }
    }
    return { ...c, moles };
  });

  const reactants = withMoles.filter((c) => c.role === "reactant" || c.role === "reagent");
  const limitingInfo = (() => {
    const candidates = reactants.filter((c) => c.moles != null).map((c) => ({ id: c.id, moles: c.moles!, coefficient: c.equivalents ?? 1 }));
    if (candidates.length === 0) return null;
    try {
      return limitingReagent(candidates);
    } catch {
      return null;
    }
  })();

  const patchComponent = (cid: string, patch: Partial<ReactionComponent>) => {
    const components = reaction.components.map((c) => (c.id === cid ? { ...c, ...patch } : c));
    update("reactions", reaction.id, { components });
  };

  const addComponent = () => {
    const comp: ReactionComponent = { id: uid(), role: "reactant", name: "Nuovo componente", equivalents: 1 };
    update("reactions", reaction.id, { components: [...reaction.components, comp] });
  };

  const removeComponent = (cid: string) => {
    update("reactions", reaction.id, { components: reaction.components.filter((c) => c.id !== cid) });
  };

  const recomputeMolarMass = (cid: string, formula: string) => {
    try {
      const mm = calcMolarMass(formula).molarMass;
      patchComponent(cid, { formula, molarMass: mm });
      toast("Massa molare aggiornata", "success");
    } catch {
      patchComponent(cid, { formula });
    }
  };

  const saveYield = () => {
    const actual = Number(actualYield);
    const theoretical = reaction.theoreticalYield;
    if (!Number.isNaN(actual) && theoretical) {
      update("reactions", reaction.id, { actualYield: actual, yieldPercent: Number(percentYield(actual, theoretical).toFixed(1)) });
      toast("Resa aggiornata", "success");
    } else {
      update("reactions", reaction.id, { actualYield: Number.isNaN(actual) ? undefined : actual });
    }
  };

  return (
    <div>
      <PageHeader
        title={reaction.name}
        subtitle={reaction.code}
        crumbs={[{ label: "Reazioni", to: "/app/reactions" }, { label: reaction.name }]}
        actions={
          <Select value={reaction.status} onChange={(e) => update("reactions", reaction.id, { status: e.target.value as Reaction["status"] })} className="w-40">
            {["planned", "running", "completed", "failed", "paused", "archived"].map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        }
      />

      <Card className="mb-4">
        <CardHeader
          title="Tabella stechiometrica"
          action={<Button size="sm" variant="outline" onClick={addComponent}><Plus className="h-4 w-4" /> Componente</Button>}
        />
        {reaction.components.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-graphite-400">Nessun componente. Aggiungi reagenti e prodotti.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-graphite-200 bg-graphite-50 text-left text-xs uppercase text-graphite-500 dark:border-graphite-800 dark:bg-graphite-800/50">
                <tr>
                  <th className="px-3 py-2">Ruolo</th>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Formula</th>
                  <th className="px-3 py-2">MM (g/mol)</th>
                  <th className="px-3 py-2">Quantità</th>
                  <th className="px-3 py-2">Moli</th>
                  <th className="px-3 py-2">Eq.</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800">
                {withMoles.map((c) => (
                  <tr key={c.id} className={limitingInfo?.limitingId === c.id ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                    <td className="px-3 py-2">
                      <Select value={c.role} onChange={(e) => patchComponent(c.id, { role: e.target.value as ReactionComponentRole })} className="h-8 w-28 text-xs">
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </Select>
                    </td>
                    <td className="px-3 py-2"><Input value={c.name} onChange={(e) => patchComponent(c.id, { name: e.target.value })} className="h-8 w-36" /></td>
                    <td className="px-3 py-2"><Input value={c.formula ?? ""} onChange={(e) => recomputeMolarMass(c.id, e.target.value)} className="h-8 w-24 font-mono" placeholder="C9H8O4" /></td>
                    <td className="px-3 py-2 text-graphite-500">{c.molarMass ? formatNumber(c.molarMass, 2) : "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Input value={c.amount?.toString() ?? ""} onChange={(e) => patchComponent(c.id, { amount: Number(e.target.value) || undefined })} className="h-8 w-16" inputMode="decimal" />
                        <Input value={c.amountUnit ?? "g"} onChange={(e) => patchComponent(c.id, { amountUnit: e.target.value })} className="h-8 w-12" />
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono">{c.moles != null ? formatNumber(c.moles, 4) : "—"}</td>
                    <td className="px-3 py-2"><Input value={c.equivalents?.toString() ?? ""} onChange={(e) => patchComponent(c.id, { equivalents: Number(e.target.value) || undefined })} className="h-8 w-14" inputMode="decimal" /></td>
                    <td className="px-3 py-2"><button aria-label="Rimuovi" onClick={() => removeComponent(c.id)} className="text-graphite-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {limitingInfo && (
          <p className="border-t border-graphite-100 px-5 py-3 text-sm dark:border-graphite-800">
            <Calculator className="mr-1 inline h-4 w-4 text-amber-500" />
            Reagente limitante stimato: <strong>{reaction.components.find((c) => c.id === limitingInfo.limitingId)?.name}</strong>
          </p>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Resa" />
          <div className="space-y-3 p-5 text-sm">
            <div className="flex justify-between"><span className="text-graphite-500">Resa teorica</span><span className="font-medium">{reaction.theoreticalYield != null ? `${reaction.theoreticalYield} g` : "—"}</span></div>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-graphite-500">Resa reale (g)</span>
              <Input value={actualYield} onChange={(e) => setActualYield(e.target.value)} className="h-8 w-24" inputMode="decimal" />
              <Button size="sm" onClick={saveYield}>Salva</Button>
            </div>
            <div className="flex justify-between border-t border-graphite-100 pt-2 dark:border-graphite-800">
              <span className="text-graphite-500">Resa percentuale</span>
              <span className="font-bold text-emerald-600">{reaction.yieldPercent != null ? `${reaction.yieldPercent}%` : "—"}</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Condizioni" />
          <dl className="grid grid-cols-2 gap-y-3 p-5 text-sm">
            <dt className="text-graphite-500">Temperatura</dt><dd>{reaction.temperature != null ? `${reaction.temperature} °C` : "—"}</dd>
            <dt className="text-graphite-500">Atmosfera</dt><dd>{reaction.atmosphere ?? "—"}</dd>
            <dt className="text-graphite-500">Durata</dt><dd>{reaction.durationMinutes != null ? `${reaction.durationMinutes} min` : "—"}</dd>
            <dt className="text-graphite-500">Stato</dt><dd><StatusBadge status={reaction.status} /></dd>
          </dl>
        </Card>
      </div>
    </div>
  );
}
