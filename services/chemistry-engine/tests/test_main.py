"""Pytest suite for the chemistry engine.

Tests that don't need RDKit always run. RDKit-dependent tests are skipped
gracefully when RDKit is not installed so the suite never fails spuriously.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app, RDKIT_AVAILABLE

client = TestClient(app)

needs_rdkit = pytest.mark.skipif(not RDKIT_AVAILABLE, reason="RDKit non installato")


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@needs_rdkit
def test_molecular_properties_aspirin():
    r = client.post("/chemistry/molecular-properties", json={"smiles": "CC(=O)Oc1ccccc1C(=O)O"})
    assert r.status_code == 200
    data = r.json()
    assert data["formula"] == "C9H8O4"
    assert abs(data["molar_mass"] - 180.16) < 0.1


@needs_rdkit
def test_parse_invalid_smiles():
    r = client.post("/chemistry/parse-smiles", json={"smiles": "not_a_smiles~~"})
    assert r.status_code == 422


@needs_rdkit
def test_similarity_identical():
    r = client.post(
        "/chemistry/similarity-search",
        json={"smiles_a": "CCO", "smiles_b": "CCO"},
    )
    assert r.status_code == 200
    assert r.json()["tanimoto"] == 1.0


def test_properties_without_rdkit_returns_503():
    if RDKIT_AVAILABLE:
        pytest.skip("RDKit disponibile: 503 non applicabile")
    r = client.post("/chemistry/molecular-properties", json={"smiles": "CCO"})
    assert r.status_code == 503
