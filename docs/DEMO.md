# ChemLab — Guida alla demo

## Avvio

```bash
pnpm install
pnpm dev     # http://localhost:5173
```

## Accesso

Login con un account demo (o i pulsanti di accesso rapido):

| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | admin@chemlab.demo | admin1234 |
| Ricercatore | researcher@chemlab.demo | researcher1234 |
| Studente | student@chemlab.demo | student1234 |
| Lab Manager | labmanager@chemlab.demo | labmanager1234 |

## Dati demo precaricati

1 organizzazione, 2 workspace, 4 utenti, 5 progetti, 4 notebook, 10 esperimenti,
30 composti, 25 elementi d'inventario, 10 reazioni, 15 calcoli salvati, 10 file,
3 spettri, 15 notifiche, 20 voci di activity log. Esempi scientifici innocui e
didattici (aspirina, glucosio, tamponi, titolazioni…).

## Percorso consigliato

1. **Dashboard** — statistiche, progetti/notebook/esperimenti recenti, alert scorte.
2. **Calcolatori** — prova "Massa molare" con `C9H8O4` → 180,16 g/mol; "Molarità".
3. **Notebook** — apri "Notebook di laboratorio", modifica testo (autosalvataggio),
   inserisci blocchi (Nota sicurezza, Osservazione), guarda lo storico versioni.
4. **Inventario** — filtra, esporta CSV, apri un reagente e registra un movimento.
5. **Reazioni** — apri "Sintesi aspirina": tabella stechiometrica, reagente
   limitante, resa.
6. **Database** — cerca "aspirin" su PubChem (rete) e importa; provenienza tracciata.
7. **Draw** — inserisci una formula per calcolare massa molare e composizione.
8. **Ricerca globale** — premi ⌘K.

## Ripristino

Impostazioni → "Ripristina dati demo" rigenera lo stato iniziale.
Nota: la ricerca PubChem richiede connessione a Internet; senza rete l'app resta
pienamente utilizzabile sui dati locali.
