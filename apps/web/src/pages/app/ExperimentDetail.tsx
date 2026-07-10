import { useNavigate, useParams } from "react-router-dom";
import type { Experiment, ExperimentStatus } from "@chemlab/types";
import { Button, Card, CardHeader, EmptyState, Field, Input, Select, Textarea } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useUi } from "@/store/ui";
import { formatDate } from "@/lib/utils";

const STATUSES: ExperimentStatus[] = ["planned", "running", "completed", "failed", "paused", "archived"];

export default function ExperimentDetail() {
  const { id } = useParams();
  const db = useDb();
  const update = useDb((s) => s.update);
  const logActivity = useDb((s) => s.logActivity);
  const notify = useDb((s) => s.notify);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const exp = db.experiments.find((e) => e.id === id);

  if (!exp) return <EmptyState title="Esperimento non trovato" action={<Button onClick={() => navigate("/app/experiments")}>Torna agli esperimenti</Button>} />;

  const patch = (p: Partial<Experiment>) => update("experiments", exp.id, p);
  const setStatus = (status: ExperimentStatus) => {
    patch({ status });
    logActivity("update", "experiment", exp.id, exp.createdBy);
    notify({ userId: exp.createdBy ?? "u-research", type: "experiment_update", title: `${exp.title}: stato ${status}` });
    toast("Stato aggiornato", "success");
  };

  const fields: Array<[keyof Experiment, string, string]> = [
    ["objective", "Obiettivo", "Descrivi l'obiettivo dell'esperimento"],
    ["hypothesis", "Ipotesi", "Ipotesi di partenza"],
    ["procedure", "Protocollo / Procedura", "Passaggi sperimentali"],
    ["observations", "Osservazioni", "Cosa hai osservato"],
    ["results", "Risultati", "Risultati ottenuti"],
    ["conclusions", "Conclusioni", "Conclusioni"],
  ];

  return (
    <div>
      <PageHeader
        title={exp.title}
        subtitle={exp.code}
        crumbs={[{ label: "Esperimenti", to: "/app/experiments" }, { label: exp.title }]}
        actions={
          <Select value={exp.status} onChange={(e) => setStatus(e.target.value as ExperimentStatus)} className="w-40">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {fields.map(([key, label, placeholder]) => (
            <Card key={key}>
              <CardHeader title={label} />
              <div className="p-5">
                <Textarea
                  rows={key === "procedure" ? 5 : 3}
                  placeholder={placeholder}
                  value={(exp[key] as string) ?? ""}
                  onChange={(e) => patch({ [key]: e.target.value } as Partial<Experiment>)}
                  onBlur={() => toast("Salvato", "success")}
                />
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader title="Condizioni" />
          <div className="space-y-3 p-5">
            <Field label="Temperatura (°C)" htmlFor="etemp"><Input id="etemp" inputMode="decimal" value={exp.temperature?.toString() ?? ""} onChange={(e) => patch({ temperature: Number(e.target.value) || undefined })} /></Field>
            <Field label="Pressione (atm)" htmlFor="epres"><Input id="epres" inputMode="decimal" value={exp.pressure?.toString() ?? ""} onChange={(e) => patch({ pressure: Number(e.target.value) || undefined })} /></Field>
            <Field label="Atmosfera" htmlFor="eatm"><Input id="eatm" value={exp.atmosphere ?? ""} onChange={(e) => patch({ atmosphere: e.target.value })} /></Field>
            <Field label="Durata (min)" htmlFor="edur"><Input id="edur" inputMode="decimal" value={exp.durationMinutes?.toString() ?? ""} onChange={(e) => patch({ durationMinutes: Number(e.target.value) || undefined })} /></Field>
            <div className="border-t border-graphite-100 pt-3 text-xs text-graphite-400 dark:border-graphite-800">
              <p>Progetto: {db.projects.find((p) => p.id === exp.projectId)?.name ?? "—"}</p>
              <p>Creato: {formatDate(exp.createdAt)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
