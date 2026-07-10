import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Database, Search, Globe, Plus, Loader2 } from "lucide-react";
import type { Compound } from "@chemlab/types";
import { Button, Card, EmptyState, Input, Select } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useUi } from "@/store/ui";
import { PubChemProvider } from "@/features/providers/pubchem";
import { toCompound, type ProviderCompound } from "@/features/providers/types";
import { formatNumber, nowIso, uid } from "@/lib/utils";

const provider = new PubChemProvider();

export default function Compounds() {
  const db = useDb();
  const insert = useDb((s) => s.insert);
  const toast = useUi((s) => s.toast);
  const [query, setQuery] = useState("");
  const [remoteQuery, setRemoteQuery] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [remoteResults, setRemoteResults] = useState<ProviderCompound[]>([]);
  const [loading, setLoading] = useState(false);
  const [remoteError, setRemoteError] = useState("");

  const local = useMemo(
    () =>
      db.compounds.filter(
        (c) =>
          c.preferredName.toLowerCase().includes(query.toLowerCase()) ||
          (c.formula ?? "").toLowerCase().includes(query.toLowerCase()) ||
          (c.casNumber ?? "").includes(query),
      ),
    [db.compounds, query],
  );

  const runRemote = async () => {
    if (!remoteQuery.trim()) return;
    setLoading(true);
    setRemoteError("");
    setRemoteResults([]);
    try {
      let res: ProviderCompound[];
      if (searchType === "name") res = await provider.searchByName(remoteQuery);
      else if (searchType === "formula") res = await provider.searchByFormula(remoteQuery);
      else if (searchType === "cid") res = await provider.searchByIdentifier("cid", remoteQuery);
      else res = await provider.searchByIdentifier("inchikey", remoteQuery);
      setRemoteResults(res);
      if (res.length === 0) setRemoteError("Nessun risultato da PubChem.");
    } catch (e) {
      setRemoteError(e instanceof Error ? e.message : "Errore rete (PubChem non raggiungibile). Dati locali disponibili.");
    } finally {
      setLoading(false);
    }
  };

  const importCompound = (pc: ProviderCompound) => {
    const compound = toCompound(pc, "ws-1", uid());
    insert("compounds", compound);
    toast(`"${compound.preferredName}" importato (fonte: ${pc.provider})`, "success");
  };

  const addManual = () => {
    const name = prompt("Nome del composto:");
    if (!name) return;
    const c: Compound = {
      id: uid(),
      workspaceId: "ws-1",
      preferredName: name,
      synonyms: [],
      ghsPictograms: [],
      hazardStatements: [],
      precautionaryStatements: [],
      properties: [],
      sourceProvider: "Locale",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    insert("compounds", c);
    toast("Composto creato", "success");
  };

  return (
    <div>
      <PageHeader
        title="Database composti"
        subtitle="Registro locale + provider pubblici (PubChem). Provenienza sempre tracciata."
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Database" }]}
        actions={<Button variant="outline" onClick={addManual}><Plus className="h-4 w-4" /> Composto manuale</Button>}
      />

      <Card className="mb-5">
        <div className="border-b border-graphite-100 px-5 py-3 dark:border-graphite-800">
          <div className="flex items-center gap-2 text-sm font-medium"><Globe className="h-4 w-4 text-brand-600" /> Ricerca provider pubblici</div>
        </div>
        <div className="flex flex-wrap items-end gap-3 p-5">
          <div className="flex-1 min-w-[220px]">
            <Input value={remoteQuery} onChange={(e) => setRemoteQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runRemote()} placeholder="es. aspirin, C9H8O4, 2244…" />
          </div>
          <Select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="w-40">
            <option value="name">Nome</option>
            <option value="formula">Formula</option>
            <option value="cid">PubChem CID</option>
            <option value="inchikey">InChIKey</option>
          </Select>
          <Button onClick={runRemote} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Cerca</Button>
        </div>
        {remoteError && <p className="px-5 pb-4 text-sm text-amber-600">{remoteError}</p>}
        {remoteResults.length > 0 && (
          <div className="divide-y divide-graphite-100 border-t border-graphite-100 dark:divide-graphite-800 dark:border-graphite-800">
            {remoteResults.map((r) => (
              <div key={r.externalId} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.preferredName}</p>
                  <p className="text-xs text-graphite-400">{r.formula} · {r.molarMass ? `${formatNumber(r.molarMass, 2)} g/mol` : ""} · CID {r.pubchemCid}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => importCompound(r)}>Importa</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-graphite-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca nel database locale…" className="pl-9" />
      </div>

      {local.length === 0 ? (
        <EmptyState icon={<Database className="h-10 w-10" />} title="Nessun composto locale" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {local.map((c) => (
            <Link key={c.id} to={`/app/compounds/${c.id}`}>
              <Card className="p-4 transition-colors hover:border-brand-300">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{c.preferredName}</h3>
                  {c.ghsPictograms.length > 0 && <span className="text-xs text-amber-600">⚠ GHS</span>}
                </div>
                <p className="font-mono text-sm text-graphite-500">{c.formula}</p>
                <p className="text-xs text-graphite-400">
                  {c.molarMass ? `${formatNumber(c.molarMass, 2)} g/mol` : ""} {c.casNumber ? `· CAS ${c.casNumber}` : ""}
                </p>
                <p className="mt-2 text-[11px] text-graphite-400">Fonte: {c.sourceProvider}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
