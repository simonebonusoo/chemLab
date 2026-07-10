import { Link } from "react-router-dom";
import { Atom, Plus, Download } from "lucide-react";
import { Button, Card, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { downloadFile } from "@/lib/csv";
import { formatNumber } from "@/lib/utils";

export default function Molecules() {
  const molecules = useDb((s) => s.molecules);

  const exportSmiles = () => {
    const lines = molecules.filter((m) => m.smiles).map((m) => `${m.smiles}\t${m.name}`).join("\n");
    downloadFile(lines, "molecole.smi", "chemical/x-daylight-smiles");
  };

  return (
    <div>
      <PageHeader
        title="Molecole"
        subtitle="Strutture salvate nel workspace"
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Molecole" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSmiles}><Download className="h-4 w-4" /> Export SMILES</Button>
            <Link to="/app/draw"><Button><Plus className="h-4 w-4" /> Nuova molecola</Button></Link>
          </div>
        }
      />

      {molecules.length === 0 ? (
        <EmptyState icon={<Atom className="h-10 w-10" />} title="Nessuna molecola" action={<Link to="/app/draw"><Button><Plus className="h-4 w-4" /> Apri ChemLab Draw</Button></Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {molecules.map((m) => (
            <Link key={m.id} to={`/app/molecules/${m.id}`}>
              <Card className="p-5 transition-colors hover:border-brand-300">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/30">
                  <Atom className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="mt-1 font-mono text-sm text-graphite-500">{m.formula}</p>
                {m.molarMass && <p className="text-xs text-graphite-400">{formatNumber(m.molarMass, 2)} g/mol</p>}
                {m.smiles && <p className="mt-2 truncate font-mono text-xs text-graphite-400">{m.smiles}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
