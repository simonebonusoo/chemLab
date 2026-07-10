import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calculator as CalcIcon, Copy, Save, History, NotebookPen } from "lucide-react";
import { Button, Card, CardHeader, Field, Input, Select } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { CALCULATORS, type CalcOutput, type CalculatorDef } from "@/features/calculators/registry";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { nowIso, uid } from "@/lib/utils";

export default function Calculators() {
  const [activeId, setActiveId] = useState(CALCULATORS[0].id);
  const active = CALCULATORS.find((c) => c.id === activeId)!;

  const categories = useMemo(() => {
    const map = new Map<string, CalculatorDef[]>();
    for (const c of CALCULATORS) {
      const arr = map.get(c.category) ?? [];
      arr.push(c);
      map.set(c.category, arr);
    }
    return [...map.entries()];
  }, []);

  return (
    <div>
      <PageHeader
        title="Calcolatori chimici"
        subtitle="28+ calcolatori validati con test automatici"
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Calcolatori" }]}
        actions={<Link to="/app/calculators/history"><Button variant="outline"><History className="h-4 w-4" /> Cronologia</Button></Link>}
      />

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          {categories.map(([cat, calcs]) => (
            <div key={cat}>
              <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-graphite-400">{cat}</p>
              <div className="space-y-0.5">
                {calcs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                      c.id === activeId ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "hover:bg-graphite-100 dark:hover:bg-graphite-800"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <CalculatorPanel key={active.id} calc={active} />
      </div>
    </div>
  );
}

function CalculatorPanel({ calc }: { calc: CalculatorDef }) {
  const insert = useDb((s) => s.insert);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<CalcOutput | null>(null);
  const [error, setError] = useState("");

  const setField = (key: string, value: string) => setInputs((s) => ({ ...s, [key]: value }));

  const compute = () => {
    try {
      setError("");
      const result = calc.compute(inputs);
      setOutput(result);
    } catch (e) {
      setOutput(null);
      setError(e instanceof Error ? e.message : "Errore di calcolo");
    }
  };

  const save = () => {
    if (!output) return;
    insert("savedCalculations", {
      id: uid(),
      workspaceId: "ws-1",
      calculatorId: calc.id,
      title: calc.name,
      inputs,
      result: output.display,
      resultValue: output.value,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: user!.id,
    });
    toast("Calcolo salvato in cronologia", "success");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader title={calc.name} subtitle={calc.description} />
        <div className="space-y-4 p-5">
          {calc.fields.map((f) => (
            <Field key={f.key} label={f.label + (f.optional ? " (opz.)" : "")} htmlFor={f.key} hint={f.hint}>
              <div className="flex gap-2">
                <Input
                  id={f.key}
                  type={f.type === "text" ? "text" : "text"}
                  inputMode={f.type === "text" ? "text" : "decimal"}
                  placeholder={f.placeholder}
                  value={inputs[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
                {f.units && (
                  <Select
                    className="w-24"
                    value={inputs[`${f.key}__unit`] ?? f.defaultUnit ?? f.units[0]}
                    onChange={(e) => setField(`${f.key}__unit`, e.target.value)}
                    aria-label={`Unità ${f.label}`}
                  >
                    {f.units.map((u) => <option key={u} value={u}>{u}</option>)}
                  </Select>
                )}
              </div>
            </Field>
          ))}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button onClick={compute} className="w-full"><CalcIcon className="h-4 w-4" /> Calcola</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Risultato" />
        <div className="p-5">
          {output ? (
            <>
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{output.display}</p>
              <div className="mt-4 rounded-lg bg-graphite-50 p-3 dark:bg-graphite-800/50">
                <p className="mb-1 text-xs font-medium text-graphite-400">Formula</p>
                <p className="font-mono text-sm">{output.formula}</p>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-graphite-400">Passaggi</p>
                <ol className="space-y-1.5 text-sm">
                  {output.steps.map((s, i) => (
                    <li key={i} className="flex justify-between gap-3 border-b border-graphite-100 pb-1 dark:border-graphite-800">
                      <span className="text-graphite-500">{s.label}</span>
                      <span className="text-right font-mono">{s.expression}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(output.display); toast("Risultato copiato"); }}>
                  <Copy className="h-4 w-4" /> Copia
                </Button>
                <Button variant="outline" size="sm" onClick={save}><Save className="h-4 w-4" /> Salva</Button>
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(`${calc.name}: ${output.display}`); toast("Copiato per il notebook"); }}>
                  <NotebookPen className="h-4 w-4" /> Al notebook
                </Button>
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-graphite-400">Inserisci i dati e premi «Calcola».</p>
          )}
        </div>
      </Card>
    </div>
  );
}
