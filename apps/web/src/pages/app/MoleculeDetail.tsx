import { useNavigate, useParams } from "react-router-dom";
import { Atom, Copy, Trash2 } from "lucide-react";
import { molarMass } from "@chemlab/chemistry";
import { Button, Card, CardHeader, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useUi } from "@/store/ui";
import { formatNumber } from "@/lib/utils";

export default function MoleculeDetail() {
  const { id } = useParams();
  const db = useDb();
  const remove = useDb((s) => s.remove);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const mol = db.molecules.find((m) => m.id === id);

  if (!mol) return <EmptyState title="Molecola non trovata" action={<Button onClick={() => navigate("/app/molecules")}>Torna alle molecole</Button>} />;

  const composition = (() => {
    if (!mol.formula) return null;
    try {
      return molarMass(mol.formula);
    } catch {
      return null;
    }
  })();

  return (
    <div>
      <PageHeader
        title={mol.name}
        subtitle={mol.formula}
        crumbs={[{ label: "Molecole", to: "/app/molecules" }, { label: mol.name }]}
        actions={
          <Button variant="danger" size="sm" onClick={() => { remove("molecules", mol.id); toast("Molecola eliminata"); navigate("/app/molecules"); }}>
            <Trash2 className="h-4 w-4" /> Elimina
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Identificatori" />
          <div className="space-y-3 p-5 text-sm">
            <Row label="Formula" value={mol.formula ?? "—"} />
            <Row label="Massa molare" value={mol.molarMass ? `${formatNumber(mol.molarMass, 2)} g/mol` : "—"} />
            <div className="flex items-center justify-between gap-2">
              <span className="text-graphite-500">SMILES</span>
              <span className="flex items-center gap-2 font-mono text-xs">
                {mol.smiles ?? "—"}
                {mol.smiles && <button aria-label="Copia SMILES" onClick={() => { navigator.clipboard?.writeText(mol.smiles!); toast("SMILES copiato"); }}><Copy className="h-3.5 w-3.5 text-graphite-400" /></button>}
              </span>
            </div>
            <Row label="InChIKey" value={mol.inchiKey ?? "richiede chemistry-engine"} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Struttura & composizione" />
          <div className="p-5">
            <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-graphite-50 dark:bg-graphite-800/50">
              <Atom className="h-12 w-12 text-brand-300" />
            </div>
            {composition ? (
              composition.composition.map((c) => (
                <div key={c.symbol} className="flex justify-between border-b border-graphite-100 py-1 text-sm dark:border-graphite-800">
                  <span>{c.symbol} × {c.count}</span>
                  <span className="text-graphite-500">{formatNumber(c.percent, 1)}%</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-graphite-400">Composizione non disponibile senza formula valida.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-graphite-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
