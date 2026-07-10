"""ChemLab chemistry engine — FastAPI microservice backed by RDKit.

Provides molecular parsing/property/rendering endpoints so the frontend does not
run heavy scientific logic. If RDKit is not installed, endpoints that need it
return HTTP 503 with a clear message instead of fabricating results
(rule: never falsify scientific output).
"""
from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chemistry-engine")

try:  # RDKit is optional at runtime; the service still boots without it.
    from rdkit import Chem
    from rdkit.Chem import AllChem, Descriptors, Draw, rdMolDescriptors
    from rdkit.Chem.Draw import rdMolDraw2D
    from rdkit import DataStructs

    RDKIT_AVAILABLE = True
except Exception as exc:  # pragma: no cover - depends on environment
    RDKIT_AVAILABLE = False
    logger.warning("RDKit not available: %s", exc)

app = FastAPI(title="ChemLab Chemistry Engine", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten via CORS_ORIGIN in production
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_rdkit() -> None:
    if not RDKIT_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="RDKit non disponibile in questo ambiente. Vedi docs/CHEMISTRY_ENGINE.md.",
        )


def parse_mol(smiles: str):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise HTTPException(status_code=422, detail=f"SMILES non valido: {smiles!r}")
    return mol


# ── Schemas ──────────────────────────────────────────────────────────────────
class SmilesIn(BaseModel):
    smiles: str = Field(..., min_length=1, max_length=2000)


class ConvertIn(BaseModel):
    input: str = Field(..., min_length=1)
    from_format: str = Field("smiles", pattern="^(smiles|molfile|inchi)$")
    to_format: str = Field("molfile", pattern="^(smiles|molfile|inchi|inchikey)$")


class SimilarityIn(BaseModel):
    smiles_a: str
    smiles_b: str


class HealthOut(BaseModel):
    status: str
    rdkit: bool


# ── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    return HealthOut(status="ok", rdkit=RDKIT_AVAILABLE)


@app.post("/chemistry/parse-smiles")
def parse_smiles(body: SmilesIn) -> dict[str, Any]:
    require_rdkit()
    mol = parse_mol(body.smiles)
    return {"valid": True, "canonical_smiles": Chem.MolToSmiles(mol)}


@app.post("/chemistry/molecular-properties")
def molecular_properties(body: SmilesIn) -> dict[str, Any]:
    require_rdkit()
    mol = parse_mol(body.smiles)
    return {
        "canonical_smiles": Chem.MolToSmiles(mol),
        "formula": rdMolDescriptors.CalcMolFormula(mol),
        "molar_mass": round(Descriptors.MolWt(mol), 4),
        "exact_mass": round(Descriptors.ExactMolWt(mol), 4),
        "num_atoms": mol.GetNumAtoms(),
        "num_bonds": mol.GetNumBonds(),
        "logp": round(Descriptors.MolLogP(mol), 4),
        "tpsa": round(Descriptors.TPSA(mol), 4),
        "h_donors": rdMolDescriptors.CalcNumHBD(mol),
        "h_acceptors": rdMolDescriptors.CalcNumHBA(mol),
        "rotatable_bonds": rdMolDescriptors.CalcNumRotatableBonds(mol),
        "inchi": Chem.MolToInchi(mol),
        "inchikey": Chem.InchiToInchiKey(Chem.MolToInchi(mol)),
    }


@app.post("/chemistry/convert-structure")
def convert_structure(body: ConvertIn) -> dict[str, Any]:
    require_rdkit()
    if body.from_format == "smiles":
        mol = parse_mol(body.input)
    elif body.from_format == "molfile":
        mol = Chem.MolFromMolBlock(body.input)
    else:
        mol = Chem.MolFromInchi(body.input)
    if mol is None:
        raise HTTPException(status_code=422, detail="Struttura di input non valida")

    if body.to_format == "smiles":
        out = Chem.MolToSmiles(mol)
    elif body.to_format == "molfile":
        out = Chem.MolToMolBlock(mol)
    elif body.to_format == "inchi":
        out = Chem.MolToInchi(mol)
    else:
        out = Chem.InchiToInchiKey(Chem.MolToInchi(mol))
    return {"output": out, "format": body.to_format}


@app.post("/chemistry/render-2d")
def render_2d(body: SmilesIn) -> dict[str, Any]:
    require_rdkit()
    mol = parse_mol(body.smiles)
    AllChem.Compute2DCoords(mol)
    drawer = rdMolDraw2D.MolDraw2DSVG(400, 300)
    drawer.DrawMolecule(mol)
    drawer.FinishDrawing()
    return {"svg": drawer.GetDrawingText()}


@app.post("/chemistry/similarity-search")
def similarity_search(body: SimilarityIn) -> dict[str, Any]:
    require_rdkit()
    a = parse_mol(body.smiles_a)
    b = parse_mol(body.smiles_b)
    fp_a = AllChem.GetMorganFingerprintAsBitVect(a, 2, nBits=2048)
    fp_b = AllChem.GetMorganFingerprintAsBitVect(b, 2, nBits=2048)
    return {"tanimoto": round(DataStructs.TanimotoSimilarity(fp_a, fp_b), 4)}


@app.post("/chemistry/substructure-search")
def substructure_search(body: dict[str, str]) -> dict[str, Any]:
    require_rdkit()
    target = parse_mol(body.get("target", ""))
    pattern = Chem.MolFromSmarts(body.get("pattern", ""))
    if pattern is None:
        raise HTTPException(status_code=422, detail="Pattern SMARTS non valido")
    return {"match": target.HasSubstructMatch(pattern)}
