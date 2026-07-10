import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button, Card, CardHeader, Select } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useUi } from "@/store/ui";
import { useAuth } from "@/store/auth";
import { useDb } from "@/store/db";
import { env } from "@/lib/env";
import { can } from "@/lib/permissions";

export default function Settings() {
  const theme = useUi((s) => s.theme);
  const setTheme = useUi((s) => s.setTheme);
  const toast = useUi((s) => s.toast);
  const user = useAuth((s) => s.user);
  const reset = useDb((s) => s.reset);

  return (
    <div>
      <PageHeader title="Impostazioni" crumbs={[{ label: "ChemLab", to: "/app" }, { label: "Impostazioni" }]} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Aspetto" />
          <div className="p-5">
            <label htmlFor="theme" className="mb-1.5 block text-sm font-medium">Tema</label>
            <Select id="theme" value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")} className="max-w-xs">
              <option value="light">Chiaro</option>
              <option value="dark">Scuro</option>
              <option value="system">Sistema</option>
            </Select>
          </div>
        </Card>

        <Card>
          <CardHeader title="Ambiente" />
          <dl className="space-y-2 p-5 text-sm">
            <div className="flex justify-between"><dt className="text-graphite-500">Modalità</dt><dd className="font-medium">{env.isDemo ? "Demo locale" : "Produzione (Supabase)"}</dd></div>
            <div className="flex justify-between"><dt className="text-graphite-500">API</dt><dd className="font-mono text-xs">{env.apiUrl}</dd></div>
            <div className="flex justify-between"><dt className="text-graphite-500">Chemistry engine</dt><dd className="font-mono text-xs">{env.chemistryEngineUrl}</dd></div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Dati demo" />
          <div className="p-5">
            <p className="mb-3 text-sm text-graphite-500">Ripristina i dati demo iniziali. Le modifiche locali verranno perse.</p>
            <Button variant="outline" onClick={() => { if (confirm("Ripristinare i dati demo?")) { reset(); toast("Dati demo ripristinati", "success"); } }}>
              Ripristina dati demo
            </Button>
          </div>
        </Card>

        {can(user?.role, "platform:manage") && (
          <Card>
            <CardHeader title="Amministrazione" />
            <div className="p-5">
              <p className="mb-3 text-sm text-graphite-500">Accesso al pannello amministrativo della piattaforma.</p>
              <Link to="/app/admin"><Button variant="outline"><Shield className="h-4 w-4" /> Pannello admin</Button></Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
