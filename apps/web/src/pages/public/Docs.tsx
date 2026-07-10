import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Docs() {
  return (
    <div className="min-h-screen bg-white dark:bg-graphite-950">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-graphite-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Torna alla home
        </Link>
        <h1 className="text-3xl font-bold">Documentazione ChemLab</h1>
        <p className="mt-2 text-graphite-500">Guida rapida all'MVP e alla sua architettura.</p>

        <div className="prose mt-8 max-w-none space-y-6 text-graphite-700 dark:text-graphite-300">
          <section>
            <h2 className="text-xl font-semibold">Avvio demo</h2>
            <p>
              L'app parte in <strong>modalità demo locale</strong> se non sono configurate le
              variabili Supabase. Tutti i dati vengono salvati nel browser (localStorage). Accedi con
              uno degli account demo dalla pagina di login.
            </p>
            <pre className="rounded-lg bg-graphite-900 p-4 text-sm text-graphite-100">
{`pnpm install
pnpm dev   # http://localhost:5173`}
            </pre>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Credenziali demo</h2>
            <ul className="list-disc pl-6">
              <li>admin@chemlab.demo / admin1234 (platform admin)</li>
              <li>researcher@chemlab.demo / researcher1234</li>
              <li>student@chemlab.demo / student1234</li>
              <li>labmanager@chemlab.demo / labmanager1234</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Moduli</h2>
            <p>
              Notebook, Draw, Inventory, Calculator, Reactions, Data, Spectra, Files e Plugins sono
              accessibili dalla sidebar. Il motore chimico (RDKit/FastAPI) è un microservizio
              separato documentato in <code>docs/CHEMISTRY_ENGINE.md</code>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Produzione</h2>
            <p>
              Configurando <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> l'app
              passa in modalità produzione con Auth, PostgreSQL, Storage e RLS. Lo schema completo è
              in <code>supabase/schema.sql</code>.
            </p>
          </section>

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Disclaimer scientifico</h2>
            <p className="text-sm text-amber-800/90 dark:text-amber-300/90">
              ChemLab supporta il lavoro scientifico ma non sostituisce la verifica professionale. I
              dati importati da fonti esterne e le informazioni di sicurezza vanno confermati tramite
              SDS ufficiali. I calcoli vanno validati prima dell'uso in contesti critici.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
