# ChemLab — Sicurezza

## Autorizzazione a livelli

- **Frontend**: `lib/permissions.ts` mappa ruolo → capability e nasconde/disabilita
  azioni non consentite. **Mai** l'unico controllo.
- **Database (produzione)**: Row Level Security in `supabase/schema.sql` applica
  le regole tenant lato server (workspace/organization). Un utente vede solo le
  organizzazioni/workspace di cui è membro; il platform admin amministra.

## Ruoli

`student → researcher → lab_manager → organization_admin → platform_admin`,
con capability crescenti (creazione progetti, gestione esperimenti/inventario,
gestione membri/organizzazione, amministrazione piattaforma).

## Input & upload

- Validazione input nei calcolatori e nei form (parsing numerico robusto,
  messaggi d'errore accessibili con `role="alert"`).
- Upload file: whitelist estensioni, limite dimensione (5 MB in demo), MIME
  conservato. In produzione i file vanno su Supabase Storage con policy dedicate.
- Nessuno stack trace esposto all'utente (`ErrorBoundary` mostra messaggi neutri).

## Segreti

Nessun segreto nel frontend. Solo la `anon key` di Supabase (pubblica per
progettazione, protetta da RLS) è esposta al client. La `service_role key` resta
lato server.

## Storage locale

In **demo** i dati sono in `localStorage` e la modalità è chiaramente segnalata
(badge "Demo locale"). In **produzione** i dati sensibili non vanno in
`localStorage`: sessione gestita da Supabase Auth.

## Audit

`activity_logs` registra utente, azione, entità, timestamp e (in produzione) IP
e user-agent. L'architettura è **predisposta** per future funzioni di compliance
ma **non è certificata** (GLP/GMP/ISO/21 CFR Part 11).

## Da completare (produzione)

Rate limiting sugli endpoint API, CORS ristretto (`CORS_ORIGIN`), sanitizzazione
server-side, rotazione sessioni. Elencati come predisposti in ROADMAP.
