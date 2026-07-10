# ChemLab

**Piattaforma modulare per il lavoro chimico** — un unico ambiente per disegnare
molecole, gestire esperimenti, calcolare proprietà, organizzare reagenti,
analizzare dati e consultare database chimici. Questo repository contiene un
**MVP realmente funzionante** costruito come fondazione tecnica di una futura
suite professionale ("Creative Cloud per la chimica").

> ⚗️ **Disclaimer scientifico** — ChemLab supporta il lavoro scientifico ma non
> sostituisce la verifica professionale. I dati importati da fonti esterne e le
> informazioni di sicurezza vanno confermati tramite SDS ufficiali. I calcoli
> vanno validati prima dell'uso in contesti critici. **Nessuna** conformità
> certificata a GLP/GMP/ISO/21 CFR Part 11: l'architettura è solo *predisposta*.

---

## Avvio rapido (demo locale)

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

L'app parte **sempre**, anche senza configurazione. Se mancano le variabili
Supabase gira in **modalità demo locale** (dati in `localStorage`, badge "Demo
locale" in sidebar).

### Credenziali demo

| Ruolo         | Email                     | Password         |
|---------------|---------------------------|------------------|
| Platform admin| admin@chemlab.demo        | admin1234        |
| Ricercatore   | researcher@chemlab.demo   | researcher1234   |
| Studente      | student@chemlab.demo      | student1234      |
| Lab Manager   | labmanager@chemlab.demo   | labmanager1234   |

La pagina di login offre anche pulsanti di **accesso rapido**.

---

## Comandi

```bash
pnpm typecheck      # TypeScript strict su tutti i package
pnpm test           # Vitest (chemistry engine + web)
pnpm build          # build produzione (code-splitting + lazy routes)
pnpm dev            # dev server Vite

# Chemistry engine (Python)
cd services/chemistry-engine
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload      # http://localhost:8000
python -m pytest
```

---

## Architettura (monorepo)

```
chemlab/
├── apps/
│   ├── web/            # React + Vite + TS + Tailwind (app principale, funzionante)
│   └── desktop/        # scaffold Tauri (predisposto)
├── packages/
│   ├── types/          # tipi TypeScript condivisi
│   ├── chemistry/      # motore di calcolo chimico (testato, 31 test)
│   └── plugins-sdk/    # SDK plugin (manifest, registry)
├── services/
│   └── chemistry-engine/  # FastAPI + RDKit (proprietà molecolari, rendering)
├── supabase/
│   └── schema.sql      # schema completo PostgreSQL + RLS
├── docs/               # ARCHITECTURE, DATABASE, CHEMISTRY_ENGINE, PLUGIN_SYSTEM, SECURITY, ROADMAP, DEMO
└── docker-compose.yml
```

**Stack**: React 18, Vite 5, TypeScript strict, Tailwind CSS, React Router,
Zustand, TipTap (notebook), Lucide, Vitest. Motore chimico: Python, FastAPI, RDKit.
Produzione: Supabase (Auth, PostgreSQL, Storage, Realtime, RLS).

Vedi [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Moduli (ChemLab suite)

| Modulo               | Stato        | Note |
|----------------------|--------------|------|
| Core / Dashboard     | ✅ Completo   | dashboard, ricerca globale (⌘K), notifiche, ruoli |
| Workspace & Progetti | ✅ Completo   | CRUD, duplica, archivia, export JSON |
| Notebook (ELN)       | ✅ Completo   | TipTap, pagine, autosave, versioni, blocchi chimici, export HTML |
| Calculator           | ✅ Completo   | 28+ calcolatori validati con test |
| Inventory            | ✅ Completo   | CRUD, movimenti, CSV import/export, alert, QR demo |
| Reactions            | ✅ Completo   | tabella stechiometrica, moli/eq., reagente limitante, resa |
| Data (composti)      | ✅ Completo   | database locale + provider **PubChem** live, provenienza tracciata |
| Draw (editor)        | 🟡 Parziale  | formula→massa molare esatti; canvas 2D via **adapter Ketcher** (predisposto) |
| Spectra              | 🟡 Parziale  | import JCAMP-DX/CSV, grafico, picchi (no interpretazione automatica) |
| Files                | 🟡 Parziale  | upload + metadati locali; Storage reale in produzione |
| Plugins              | ✅ Completo   | registry build-time, abilita/disabilita |
| AI                   | ⚪ Predisposto| manifest presente, non attivo |

Legenda: ✅ completo · 🟡 parziale · ⚪ predisposto.

---

## Modalità produzione (Supabase)

Configura `apps/web/.env` (vedi [.env.example](.env.example)):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Con entrambe presenti l'app passa in modalità produzione. Applica lo schema:

```bash
supabase db push        # oppure: psql "$DATABASE_URL" -f supabase/schema.sql
```

Lo schema include **Row Level Security** multi-tenant (organization/workspace).
Vedi [docs/DATABASE.md](docs/DATABASE.md) e [docs/SECURITY.md](docs/SECURITY.md).

> Nota: questo MVP implementa il backend **demo locale** completo e la modalità
> produzione a livello di schema + rilevamento env. Il wiring del client Supabase
> è documentato ma non incluso nel bundle (vedi ROADMAP).

---

## Docker

```bash
docker compose up --build
# web:              http://localhost:8080
# chemistry-engine: http://localhost:8000
# postgres:         localhost:5432
```

---

## Provider dati esterni

- **PubChem** (PUG REST, pubblico) — attivo, con caching. Usato nel modulo Data.
- **ChEBI** — adapter predisposto (proxy server-side per CORS).
- **Local** — ricerca nel database composti locale.

Nessuno scraping. Nessun database proprietario. La provenienza di ogni dato è
sempre conservata e mai fusa silenziosamente tra fonti diverse.

---

## Limiti attuali

Vedi la sezione "moduli parziali/predisposti" sopra e [docs/ROADMAP.md](docs/ROADMAP.md).
In sintesi: canvas di disegno molecolare (Ketcher) da montare, client Supabase da
collegare, RDKit engine da distribuire, collaborazione realtime da attivare,
desktop Tauri da completare.

## Licenza

MIT (codice ChemLab). Le librerie open-source integrate mantengono le rispettive
licenze. Nessun asset proprietario di software commerciali è incluso.
