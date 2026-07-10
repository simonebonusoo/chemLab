import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useDb } from "@/store/db";
import { formatDateTime } from "@/lib/utils";

export default function CalculatorHistory() {
  const calcs = useDb((s) => s.savedCalculations);
  const remove = useDb((s) => s.remove);

  return (
    <div>
      <PageHeader
        title="Cronologia calcoli"
        crumbs={[{ label: "Calcolatori", to: "/app/calculators" }, { label: "Cronologia" }]}
      />
      {calcs.length === 0 ? (
        <EmptyState title="Nessun calcolo salvato" description="Salva i risultati dai calcolatori per ritrovarli qui." action={<Link className="text-brand-600" to="/app/calculators">Vai ai calcolatori</Link>} />
      ) : (
        <Card>
          <div className="divide-y divide-graphite-100 dark:divide-graphite-800">
            {[...calcs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-graphite-400">{formatDateTime(c.createdAt)}</p>
                </div>
                <span className="font-mono text-sm text-brand-600">{c.result}</span>
                <button aria-label="Elimina" onClick={() => remove("savedCalculations", c.id)} className="text-graphite-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
