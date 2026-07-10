# ChemLab — Architettura

## Panoramica

ChemLab è un **monorepo pnpm** che ospita una web app React, package condivisi,
un microservizio Python per la chimica e lo schema del database.

```
Frontend (apps/web)  ──►  Service layer / repository  ──►  Demo backend (localStorage)
                                                     └──►  Produzione (Supabase)
        │
        └── fetch ──►  Chemistry engine (FastAPI + RDKit)   [proprietà molecolari]
        └── fetch ──►  Provider pubblici (PubChem)          [dati composti]
```

Il frontend **non** esegue la logica chimica pesante: parsing SMILES, InChI,
logP, TPSA, fingerprint e rendering 2D sono delegati a `services/chemistry-engine`.
I calcoli deterministici e dimensionalmente semplici (massa molare, molarità,
diluizioni, rese, pH, statistica…) vivono in `packages/chemistry`, sono **puri**
e **testati** (31 test), e girano sia lato client sia (potenzialmente) lato server.

## Package

| Package                | Responsabilità |
|------------------------|----------------|
| `@chemlab/types`       | tipi TypeScript condivisi per tutte le entità |
| `@chemlab/chemistry`   | motore di calcolo puro + tabella periodica + parser formule |
| `@chemlab/plugins-sdk` | `PluginManifest`, `PluginRegistry`, tipi permessi/route |

## Livelli dell'app web

- **UI** (`components/ui`): design system riutilizzabile (Button, Card, Modal, …).
- **Layout** (`components/layout`): Sidebar, Topbar, CommandPalette, AppLayout.
- **Store** (`store`): Zustand — `db` (dati demo reattivi), `auth`, `ui` (tema/toast).
- **Feature** (`features`): calcolatori, provider dati, plugin, adapter editor.
- **Pagine** (`pages`): pubbliche (`public/`) e app (`app/`), lazy-loaded.
- **Lib** (`lib`): env, permessi, ricerca globale, CSV, utility, formattazione.

## Stato & persistenza

`store/db.ts` è un singolo store Zustand che contiene tutte le collezioni. In
demo viene idratato da `data/seed.ts` e persiste su `localStorage` a ogni
mutazione (`insert`/`update`/`remove`). L'interfaccia CRUD è identica a quella
che un repository Supabase esporrebbe in produzione → il passaggio è isolato.

## Rilevamento modalità

`lib/env.ts` legge le variabili Vite. `isDemo = !(VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY)`.
Nessuna schermata bloccante: l'app è sempre navigabile.

## Ricerca globale

`lib/search.ts` esegue una ricerca testuale multi-entità (⌘K). Il modello dati e
la forma dei risultati sono gli stessi che l'endpoint API `/search` servirebbe in
produzione (Postgres full-text + eventuale ricerca strutturale via RDKit:
exact/substructure/similarity — endpoint già definiti nel chemistry engine).

## Performance

Route lazy + code splitting (ogni pagina è un chunk), debounce autosave notebook,
filtri memoizzati, indici Postgres nello schema. Il bundle principale resta
piccolo; TipTap è caricato solo nel chunk del notebook.

## API / service layer

Le operazioni sono espresse come metodi di store (demo) con la stessa firma che
un client API/Supabase avrebbe. Endpoint REST previsti (produzione):
`auth, organizations, workspaces, projects, notebooks, experiments, compounds,
molecules, reactions, inventory, calculations, files, spectra, plugins,
notifications` + endpoint chimici (`/chemistry/*`) serviti dal microservizio.
