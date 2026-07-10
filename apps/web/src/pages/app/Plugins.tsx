import { useState } from "react";
import { Puzzle } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { pluginRegistry } from "@/features/plugins/registry";
import { useUi } from "@/store/ui";

export default function Plugins() {
  const toast = useUi((s) => s.toast);
  const [, force] = useState(0);
  const modules = pluginRegistry.list();

  const toggle = (id: string) => {
    const enabled = pluginRegistry.isEnabled(id);
    pluginRegistry.setEnabled(id, !enabled);
    force((n) => n + 1);
    toast(enabled ? "Modulo disabilitato" : "Modulo abilitato", "success");
  };

  return (
    <div>
      <PageHeader
        title="Plugin e moduli"
        subtitle="Architettura modulare — plugin registrati a build-time (nessun codice remoto arbitrario)."
        crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Plugin" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const enabled = pluginRegistry.isEnabled(m.manifest.id);
          return (
            <Card key={m.manifest.id}>
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/30">
                    <Puzzle className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <Badge className={enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-graphite-100 text-graphite-500 dark:bg-graphite-800"}>
                    {enabled ? "Attivo" : "Disattivo"}
                  </Badge>
                </div>
                <h3 className="font-semibold">{m.manifest.name}</h3>
                <p className="mt-1 text-sm text-graphite-500">{m.manifest.description}</p>
                <div className="mt-3 flex flex-wrap gap-1 text-xs text-graphite-400">
                  <span className="rounded bg-graphite-100 px-1.5 py-0.5 dark:bg-graphite-800">v{m.manifest.version}</span>
                  <span className="rounded bg-graphite-100 px-1.5 py-0.5 dark:bg-graphite-800">{m.manifest.category}</span>
                  {m.manifest.builtIn && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-700 dark:bg-brand-900/40">core</span>}
                </div>
                {m.manifest.permissions.length > 0 && (
                  <p className="mt-2 text-[11px] text-graphite-400">Permessi: {m.manifest.permissions.join(", ")}</p>
                )}
              </div>
              <div className="border-t border-graphite-100 dark:border-graphite-800">
                <button onClick={() => toggle(m.manifest.id)} className="w-full py-2.5 text-sm font-medium hover:bg-graphite-50 dark:hover:bg-graphite-800/50">
                  {enabled ? "Disabilita" : "Abilita"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
