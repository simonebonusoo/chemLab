import { useRef, useState } from "react";
import { Activity, Upload } from "lucide-react";
import type { Spectrum, SpectrumType } from "@chemlab/types";
import { Button, Card, CardHeader, EmptyState, Select } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { nowIso, uid } from "@/lib/utils";

const TYPES: SpectrumType[] = ["NMR", "IR", "UV-Vis", "MS", "HPLC", "GC"];

/** Parse "x,y" CSV or a minimal JCAMP-DX (XYDATA / peak table) into points. */
function parseSpectrum(text: string): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith("##") || line.trim() === "") continue;
    const parts = line.split(/[,;\s]+/).map(Number).filter((n) => !Number.isNaN(n));
    for (let i = 0; i + 1 < parts.length; i += 2) points.push([parts[i], parts[i + 1]]);
  }
  return points;
}

export default function Spectra() {
  const db = useDb();
  const insert = useDb((s) => s.insert);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(db.spectra[0]?.id ?? null);
  const selected = db.spectra.find((s) => s.id === selectedId) ?? db.spectra[0];

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = parseSpectrum(String(reader.result));
      if (data.length === 0) {
        toast("Nessun dato XY riconosciuto nel file", "error");
        return;
      }
      const spec: Spectrum = {
        id: uid(),
        workspaceId: "ws-1",
        name: file.name.replace(/\.[^.]+$/, ""),
        type: "UV-Vis",
        xLabel: "X",
        yLabel: "Y",
        data,
        peaks: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
        createdBy: user!.id,
      };
      insert("spectra", spec);
      setSelectedId(spec.id);
      toast(`Spettro importato (${data.length} punti)`, "success");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      <PageHeader
        title="Spettri"
        subtitle="Visualizzazione JCAMP-DX / CSV XY. Nessuna interpretazione automatica avanzata."
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Spettri" }]}
        actions={<Button onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Importa JCAMP/CSV</Button>}
      />
      <input ref={fileRef} type="file" accept=".jdx,.dx,.csv,.txt" hidden onChange={upload} />

      {db.spectra.length === 0 ? (
        <EmptyState icon={<Activity className="h-10 w-10" />} title="Nessuno spettro" description="Importa un file JCAMP-DX o un CSV con coppie X,Y." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="space-y-1">
            {db.spectra.map((s) => (
              <button key={s.id} onClick={() => setSelectedId(s.id)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${s.id === selected?.id ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/30" : "hover:bg-graphite-100 dark:hover:bg-graphite-800"}`}>
                {s.name}
                <span className="block text-xs text-graphite-400">{s.type}</span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-4">
              <Card>
                <CardHeader
                  title={selected.name}
                  action={
                    <Select value={selected.type} onChange={(e) => useDb.getState().update("spectra", selected.id, { type: e.target.value as SpectrumType })} className="w-32">
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  }
                />
                <div className="p-5">
                  <SpectrumChart data={selected.data} xLabel={selected.xLabel} yLabel={selected.yLabel} />
                </div>
              </Card>

              {selected.peaks.length > 0 && (
                <Card>
                  <CardHeader title={`Picchi (${selected.peaks.length})`} />
                  <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
                    {selected.peaks.map((p, i) => (
                      <div key={i} className="flex justify-between px-5 py-2 text-sm">
                        <span className="font-mono">x = {p.x}</span>
                        <span className="text-graphite-500">{p.label ?? `y = ${p.y}`}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SpectrumChart({ data, xLabel, yLabel }: { data: Array<[number, number]>; xLabel: string; yLabel: string }) {
  if (data.length === 0) return <p className="text-sm text-graphite-400">Nessun dato.</p>;
  const W = 640;
  const H = 260;
  const pad = 36;
  const xs = data.map((d) => d[0]);
  const ys = data.map((d) => d[1]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const sx = (x: number) => pad + ((x - xMin) / (xMax - xMin || 1)) * (W - 2 * pad);
  const sy = (y: number) => H - pad - ((y - yMin) / (yMax - yMin || 1)) * (H - 2 * pad);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(d[0]).toFixed(1)},${sy(d[1]).toFixed(1)}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label={`Spettro ${xLabel} vs ${yLabel}`}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} className="stroke-graphite-300 dark:stroke-graphite-700" />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} className="stroke-graphite-300 dark:stroke-graphite-700" />
        <path d={path} className="fill-none stroke-brand-500" strokeWidth={1.5} />
        <text x={W / 2} y={H - 6} textAnchor="middle" className="fill-graphite-400 text-[10px]">{xLabel}</text>
        <text x={12} y={H / 2} textAnchor="middle" transform={`rotate(-90 12 ${H / 2})`} className="fill-graphite-400 text-[10px]">{yLabel}</text>
      </svg>
    </div>
  );
}
