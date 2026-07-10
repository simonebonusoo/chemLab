# ChemLab — Chemistry Engine

Microservizio Python (FastAPI + RDKit) in [`services/chemistry-engine`](../services/chemistry-engine).
Separa la logica scientifica pesante dal frontend.

## Avvio locale

```bash
cd services/chemistry-engine
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt        # include rdkit
uvicorn app.main:app --reload          # http://localhost:8000
python -m pytest
```

> RDKit fornisce wheel per la maggior parte delle piattaforme/versioni Python
> supportate. Se nel tuo ambiente RDKit non è installabile (es. Python molto
> recente senza wheel), il servizio **si avvia comunque**: gli endpoint che
> richiedono RDKit rispondono **HTTP 503** con messaggio chiaro invece di
> restituire risultati falsi. In tal caso usa Docker (immagine con RDKit) o una
> versione di Python supportata.

## Docker

```bash
docker build -t chemlab-engine services/chemistry-engine
docker run -p 8000:8000 chemlab-engine
```

## Endpoint

| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET  | `/health` | stato + disponibilità RDKit |
| POST | `/chemistry/parse-smiles` | validazione + SMILES canonico |
| POST | `/chemistry/molecular-properties` | formula, MW, exact mass, logP, TPSA, HBD/HBA, rotatable bonds, InChI(Key), n. atomi/legami |
| POST | `/chemistry/convert-structure` | SMILES ↔ Molfile ↔ InChI ↔ InChIKey |
| POST | `/chemistry/render-2d` | SVG 2D della struttura |
| POST | `/chemistry/similarity-search` | Tanimoto (Morgan fingerprint) |
| POST | `/chemistry/substructure-search` | match SMARTS |

## Contratto con il frontend

Il frontend (`apps/web`) legge `VITE_CHEMISTRY_ENGINE_URL`. Le proprietà da
**formula** (massa molare, composizione) sono calcolate **localmente** ed esatte
da `@chemlab/chemistry`; le proprietà da **SMILES** (InChI, logP, TPSA…) e il
rendering 2D provengono da questo servizio. Se il servizio non è raggiungibile,
la UI mostra "richiede chemistry-engine" invece di inventare valori.

## Test

`pytest` copre `/health`, il caso 503 (senza RDKit) e — quando RDKit è presente —
proprietà dell'aspirina (C9H8O4 ≈ 180.16), SMILES invalidi (422) e similarità.
