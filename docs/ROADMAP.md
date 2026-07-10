# ChemLab — Roadmap

## Stato attuale (MVP)

Realmente funzionanti in demo locale: autenticazione + ruoli, dashboard,
workspace/progetti, notebook ELN (TipTap, autosave, versioni), 28+ calcolatori
testati, inventario (CRUD + movimenti + CSV), reazioni con stechiometria,
database composti con provider PubChem live, molecole (formula→MW esatti),
spettri (import JCAMP/CSV + grafico), file manager (metadati), plugin, notifiche,
ricerca globale, admin.

## Parziale / predisposto

| Area | Stato | Prossimo passo |
|------|-------|----------------|
| ChemLab Draw (canvas 2D) | adapter predisposto | montare Ketcher (`ketcher-react` + standalone) |
| Client Supabase | rilevamento env + schema | collegare `@supabase/supabase-js` al repository layer |
| Chemistry engine | servizio completo | distribuire con RDKit (Docker) e collegare la UI Draw |
| Realtime/collaborazione | notifiche + attività | presence, cursori, editing condiviso (Supabase Realtime/Yjs) |
| File storage | metadati locali | Supabase Storage + preview PDF/immagini |
| Ricerca strutturale | endpoint definiti | exact/substructure/similarity via RDKit lato server |
| Desktop | scaffold Tauri | comandi nativi, build installer |
| API service (`apps/api`) | scaffold Fastify | endpoint REST completi + rate limiting |
| Export PDF notebook | export HTML pronto-stampa | pipeline PDF server-side |

## Direzioni future

- Integrazione ChEBI/OPSIN via proxy server-side.
- Modulo AI (assistente chimico) — manifest già presente, disattivo.
- Import/export SDF/MOL/RXN completi con RDKit.
- Funzioni di compliance (audit firmato, e-signature) — solo predisposte oggi.
- Virtualizzazione tabelle molto grandi, ottimizzazioni bundle.
