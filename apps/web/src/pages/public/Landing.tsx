import { Link } from "react-router-dom";
import {
  Atom,
  NotebookPen,
  Boxes,
  Calculator,
  Database,
  FlaskConical,
  Activity,
  Puzzle,
  ArrowRight,
  Check,
} from "lucide-react";

const MODULES = [
  { icon: NotebookPen, name: "ChemLab Notebook", desc: "Quaderno elettronico di laboratorio con blocchi chimici." },
  { icon: Atom, name: "ChemLab Draw", desc: "Editor molecolare 2D con formula e massa molare." },
  { icon: Boxes, name: "ChemLab Inventory", desc: "Reagenti, lotti, ubicazioni, scadenze e movimenti." },
  { icon: Calculator, name: "ChemLab Calculator", desc: "28+ calcolatori chimici validati e testati." },
  { icon: FlaskConical, name: "ChemLab Reactions", desc: "Reazioni con tabella stechiometrica e rese." },
  { icon: Database, name: "ChemLab Data", desc: "Registro composti con provider PubChem/ChEBI." },
  { icon: Activity, name: "ChemLab Spectra", desc: "Visualizzazione spettri JCAMP-DX / CSV." },
  { icon: Puzzle, name: "ChemLab Plugins", desc: "Architettura modulare pronta a crescere." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-graphite-900 dark:bg-graphite-950 dark:text-graphite-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <Atom className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">ChemLab</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/docs" className="text-sm text-graphite-500 hover:text-graphite-900 dark:hover:text-white">
            Documentazione
          </Link>
          <Link to="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Accedi
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Inizia
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-graphite-200 bg-graphite-50 px-3 py-1 text-xs font-medium text-graphite-600 dark:border-graphite-800 dark:bg-graphite-900">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> MVP · Demo locale disponibile
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          La <span className="text-brand-600">piattaforma modulare</span> per il lavoro chimico
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-graphite-500">
          Un unico ambiente per disegnare molecole, gestire esperimenti, calcolare proprietà,
          organizzare reagenti e consultare dati chimici. Pensato come fondazione tecnica di una
          suite professionale.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Prova la demo <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/docs"
            className="rounded-lg border border-graphite-300 px-6 py-3 font-medium hover:bg-graphite-50 dark:border-graphite-700 dark:hover:bg-graphite-900"
          >
            Come funziona
          </Link>
        </div>
        <p className="mt-3 text-xs text-graphite-400">
          Account demo: researcher@chemlab.demo · password researcher1234
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">Una suite, molti moduli</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-graphite-200 p-5 transition-colors hover:border-brand-300 dark:border-graphite-800"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/30">
                <m.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold">{m.name}</h3>
              <p className="mt-1 text-sm text-graphite-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl border border-graphite-200 bg-graphite-50 p-8 dark:border-graphite-800 dark:bg-graphite-900">
          <h2 className="text-2xl font-bold">Costruito con serietà scientifica</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Calcolatori chimici testati (31 test automatici sul motore).",
              "Modalità demo locale: dati nel tuo browser, nessuna configurazione.",
              "Provider dati pubblici (PubChem) con provenienza tracciata.",
              "Architettura monorepo pronta per Supabase, RLS e chemistry-engine RDKit.",
              "Nessun dato chimico inventato: le fonti restano sempre distinte.",
              "Ruoli e permessi: studente, ricercatore, lab manager, admin.",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-graphite-600 dark:text-graphite-300">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-2 text-center text-2xl font-bold">Piani</h2>
        <p className="mb-8 text-center text-sm text-graphite-400">Placeholder — nessun pagamento attivo in questa versione.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: "Studente", price: "Gratis", features: ["Progetti personali", "Notebook", "Calcolatori"] },
            { name: "Ricerca", price: "—", features: ["Team & workspace", "Inventario", "Reazioni & spettri"] },
            { name: "Organizzazione", price: "—", features: ["Multi-workspace", "Ruoli avanzati", "Audit log"] },
          ].map((p, i) => (
            <div
              key={p.name}
              className={`rounded-xl border p-6 ${i === 1 ? "border-brand-400 shadow-md" : "border-graphite-200 dark:border-graphite-800"}`}
            >
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1 text-2xl font-bold">{p.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-graphite-500">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-graphite-200 dark:border-graphite-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-graphite-500">
          <span>© {new Date().getFullYear()} ChemLab — MVP dimostrativo.</span>
          <div className="flex gap-4">
            <Link to="/legal/privacy" className="hover:text-graphite-900 dark:hover:text-white">Privacy</Link>
            <Link to="/legal/terms" className="hover:text-graphite-900 dark:hover:text-white">Termini</Link>
            <Link to="/legal/disclaimer" className="hover:text-graphite-900 dark:hover:text-white">Disclaimer scientifico</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
