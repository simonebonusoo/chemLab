import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button, Card, CardHeader, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { useUi } from "@/store/ui";
import { formatDate, formatNumber } from "@/lib/utils";

export default function CompoundDetail() {
  const { id } = useParams();
  const db = useDb();
  const remove = useDb((s) => s.remove);
  const toast = useUi((s) => s.toast);
  const navigate = useNavigate();
  const c = db.compounds.find((x) => x.id === id);

  if (!c) return <EmptyState title="Composto non trovato" action={<Button onClick={() => navigate("/app/compounds")}>Torna al database</Button>} />;

  const rows: [string, string | undefined][] = [
    ["Nome IUPAC", c.iupacName],
    ["Formula", c.formula],
    ["Massa molare", c.molarMass ? `${formatNumber(c.molarMass, 2)} g/mol` : undefined],
    ["SMILES", c.smiles],
    ["InChIKey", c.inchiKey],
    ["PubChem CID", c.pubchemCid],
    ["ChEBI ID", c.chebiId],
    ["CAS", c.casNumber],
    ["Stato fisico", c.physicalState],
    ["Punto di fusione", c.meltingPoint],
    ["Punto di ebollizione", c.boilingPoint],
    ["logP", c.logP],
    ["Colore", c.color],
  ];

  return (
    <div>
      <PageHeader
        title={c.preferredName}
        subtitle={c.synonyms.join(", ") || c.formula}
        crumbs={[{ label: "Database", to: "/app/compounds" }, { label: c.preferredName }]}
        actions={
          <Button variant="danger" size="sm" onClick={() => { remove("compounds", c.id); toast("Composto eliminato"); navigate("/app/compounds"); }}>
            <Trash2 className="h-4 w-4" /> Elimina
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Proprietà" />
          <dl className="p-5 text-sm">
            {rows.filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-graphite-100 py-2 dark:border-graphite-800">
                <dt className="text-graphite-500">{label}</dt>
                <dd className="max-w-[60%] truncate text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Sicurezza (GHS)" />
            <div className="p-5 text-sm">
              {c.ghsPictograms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {c.ghsPictograms.map((g) => (
                    <span key={g} className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30">{g}</span>
                  ))}
                </div>
              ) : (
                <p className="text-graphite-400">Nessun pittogramma registrato.</p>
              )}
              <p className="mt-3 text-xs text-graphite-400">
                ⚠️ Le informazioni di sicurezza vanno sempre verificate tramite SDS ufficiale.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Provenienza" />
            <div className="space-y-2 p-5 text-sm">
              <div className="flex justify-between"><span className="text-graphite-500">Fonte</span><span className="font-medium">{c.sourceProvider ?? "Locale"}</span></div>
              <div className="flex justify-between"><span className="text-graphite-500">Ultimo aggiornamento</span><span>{formatDate(c.updatedAt)}</span></div>
              {c.sourceUrl && (
                <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700">
                  Apri fonte <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {c.casSource && <p className="text-xs text-graphite-400">CAS: {c.casSource}</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
