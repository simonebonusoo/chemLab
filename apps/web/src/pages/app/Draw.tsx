import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Atom, Save, Info } from "lucide-react";
import type { Molecule } from "@chemlab/types";
import { molarMass } from "@chemlab/chemistry";
import { Button, Card, CardHeader, Field, Input } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { formatNumber, nowIso, uid } from "@/lib/utils";
import { env } from "@/lib/env";

export default function Draw() {
  const insert = useDb((s) => s.insert);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [formula, setFormula] = useState("");
  const [smiles, setSmiles] = useState("");
  const [error, setError] = useState("");

  const computed = (() => {
    if (!formula.trim()) return null;
    try {
      return molarMass(formula);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Formula non valida" };
    }
  })();
  const valid = computed && !("error" in computed);

  const save = () => {
    if (!name.trim()) {
      setError("Inserisci un nome");
      return;
    }
    const mol: Molecule = {
      id: uid(),
      workspaceId: "ws-1",
      name: name.trim(),
      smiles: smiles.trim() || undefined,
      formula: valid ? computed.formula : formula.trim() || undefined,
      molarMass: valid ? computed.molarMass : undefined,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: user!.id,
    };
    insert("molecules", mol);
    toast("Molecola salvata", "success");
    navigate(`/app/molecules/${mol.id}`);
  };

  return (
    <div>
      <PageHeader
        title="ChemLab Draw"
        subtitle="Editor molecolare — proprietà da formula (esatte) e adapter Ketcher predisposto"
        crumbs={[{ label: "Molecole", to: "/app/molecules" }, { label: "Draw" }]}
        actions={<Button onClick={save}><Save className="h-4 w-4" /> Salva molecola</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="Canvas struttura" />
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <Atom className="h-14 w-14 text-brand-300" />
            <p className="max-w-md text-sm text-graphite-500">
              Il canvas di disegno 2D è predisposto per l'editor open-source <strong>Ketcher</strong>{" "}
              tramite adapter (<code>features/draw/adapter.ts</code>). In questa build calcoli formula
              e massa molare in modo <strong>esatto</strong> dalla formula chimica; le proprietà da
              SMILES (InChI, logP, TPSA…) sono fornite dal microservizio RDKit.
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-graphite-50 px-3 py-2 text-xs text-graphite-500 dark:bg-graphite-800/50">
              <Info className="h-4 w-4" /> Chemistry engine: {env.chemistryEngineUrl}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Dati molecola" />
            <div className="space-y-3 p-5">
              <Field label="Nome" htmlFor="mname" error={error}>
                <Input id="mname" value={name} onChange={(e) => setName(e.target.value)} placeholder="es. Acido acetilsalicilico" />
              </Field>
              <Field label="Formula chimica" htmlFor="mformula" hint="Massa molare calcolata localmente ed esatta.">
                <Input id="mformula" value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="es. C9H8O4" />
              </Field>
              <Field label="SMILES (opzionale)" htmlFor="msmiles" hint="Salvato come identificatore; le proprietà richiedono il chemistry-engine.">
                <Input id="msmiles" value={smiles} onChange={(e) => setSmiles(e.target.value)} placeholder="es. CC(=O)Oc1ccccc1C(=O)O" />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Proprietà calcolate" />
            <div className="p-5">
              {!formula.trim() && <p className="text-sm text-graphite-400">Inserisci una formula per calcolare le proprietà.</p>}
              {computed && "error" in computed && <p className="text-sm text-red-600">{computed.error}</p>}
              {valid && (
                <dl className="space-y-2 text-sm">
                  <Row label="Formula (Hill)" value={computed.formula} />
                  <Row label="Massa molare" value={`${formatNumber(computed.molarMass, 2)} g/mol`} />
                  <div className="pt-2">
                    <p className="mb-1 text-xs text-graphite-400">Composizione</p>
                    {computed.composition.map((c) => (
                      <div key={c.symbol} className="flex justify-between border-b border-graphite-100 py-1 dark:border-graphite-800">
                        <span>{c.symbol} × {c.count}</span>
                        <span className="text-graphite-500">{formatNumber(c.percent, 1)}%</span>
                      </div>
                    ))}
                  </div>
                </dl>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-graphite-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
