import { useMemo, useRef, useState } from "react";
import { Files as FilesIcon, Upload, Search, Download, Trash2 } from "lucide-react";
import type { FileRecord } from "@chemlab/types";
import { Button, Card, EmptyState, Input, Select } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";
import { formatBytes, formatDate, nowIso, simpleChecksum, uid } from "@/lib/utils";

const ALLOWED = [
  "pdf", "csv", "txt", "json", "xlsx", "png", "jpg", "jpeg", "gif", "svg",
  "mol", "mol2", "sdf", "rxn", "smi", "smiles", "jdx", "dx", "cif", "pdb", "zip",
];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB demo cap

export default function Files() {
  const db = useDb();
  const insert = useDb((s) => s.insert);
  const remove = useDb((s) => s.remove);
  const user = useAuth((s) => s.user);
  const toast = useUi((s) => s.toast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");

  const folders = useMemo(() => ["all", ...new Set(db.files.map((f) => f.folder ?? "Senza cartella"))], [db.files]);
  const filtered = db.files
    .filter((f) => (folder === "all" ? true : (f.folder ?? "Senza cartella") === folder))
    .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED.includes(ext)) {
        toast(`Tipo non consentito: .${ext}`, "error");
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast(`"${file.name}" supera 5 MB (limite demo)`, "error");
        continue;
      }
      const record: FileRecord = {
        id: uid(),
        workspaceId: "ws-1",
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        extension: ext,
        sizeBytes: file.size,
        folder: "Caricati",
        tags: [],
        checksum: simpleChecksum(file.name + file.size),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        createdBy: user!.id,
      };
      insert("files", record);
    }
    toast("File caricati (metadati salvati localmente)", "success");
    e.target.value = "";
  };

  return (
    <div>
      <PageHeader
        title="File manager"
        subtitle="In demo vengono salvati i metadati; in produzione i file vanno su Supabase Storage."
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "File" }]}
        actions={<Button onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Carica file</Button>}
      />
      <input ref={fileRef} type="file" multiple hidden onChange={upload} accept={ALLOWED.map((e) => "." + e).join(",")} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-graphite-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca file…" className="pl-9" />
        </div>
        <Select value={folder} onChange={(e) => setFolder(e.target.value)} className="w-48">
          {folders.map((f) => <option key={f} value={f}>{f === "all" ? "Tutte le cartelle" : f}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FilesIcon className="h-10 w-10" />} title="Nessun file" description="Trascina o carica file scientifici (PDF, CSV, MOL, SDF, JCAMP-DX…)." action={<Button onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Carica</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-graphite-200 bg-graphite-50 text-left text-xs uppercase text-graphite-500 dark:border-graphite-800 dark:bg-graphite-800/50">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Cartella</th>
                  <th className="px-4 py-3">Dimensione</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Checksum</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-100 dark:divide-graphite-800">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-graphite-50 dark:hover:bg-graphite-800/40">
                    <td className="px-4 py-3">
                      <span className="mr-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-600 dark:bg-brand-900/30">{f.extension}</span>
                      {f.name}
                    </td>
                    <td className="px-4 py-3 text-graphite-500">{f.folder}</td>
                    <td className="px-4 py-3 text-graphite-500">{formatBytes(f.sizeBytes)}</td>
                    <td className="px-4 py-3 text-graphite-500">{formatDate(f.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-graphite-400">{f.checksum}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button aria-label="Scarica metadati" onClick={() => { const blob = new Blob([JSON.stringify(f, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = f.name + ".meta.json"; a.click(); URL.revokeObjectURL(url); }} className="text-graphite-400 hover:text-brand-600"><Download className="h-4 w-4" /></button>
                        <button aria-label="Elimina" onClick={() => { remove("files", f.id); toast("File rimosso"); }} className="text-graphite-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
