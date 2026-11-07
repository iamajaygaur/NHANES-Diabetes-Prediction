"""Integration tests for model loading and prediction consistency."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.model_service import model_service

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "docs" / "feature_schema.json"


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health(client: TestClient):
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True
    assert body["n_features"] == 51
    assert body["threshold"] == 0.6


def test_feature_order_matches_bundle():
    bundle = joblib.load(ROOT / "backend" / "models" / "final_xgboost_model_bundle.pkl")
    assert model_service.feature_names == list(bundle["feature_names"])
    assert len(model_service.feature_names) == 51


def test_overview_metrics(client: TestClient):
    res = client.get("/api/overview")
    assert res.status_code == 200
    body = res.json()
    assert body["kpis"]["participants"] == 7536
    assert body["kpis"]["diabetes_cases"] == 1070
    metrics = body["final_test_metrics"]
    assert round(metrics["accuracy"], 4) == 0.8408
    assert round(metrics["precision"], 4) == 0.4515
    assert round(metrics["recall"], 4) == 0.5654
    assert round(metrics["f1_score"], 4) == 0.5021
    assert round(metrics["roc_auc"], 4) == 0.8487


def test_confusion_matrix(client: TestClient):
    res = client.get("/api/models/confusion-matrix")
    assert res.status_code == 200
    body = res.json()
    assert body["matrix"] == [[1147, 147], [93, 121]]


def test_predict_matches_direct_inference(client: TestClient):
    schema = json.loads(SCHEMA_PATH.read_text())
    features = schema["synthetic_demo"]
    expected = schema["synthetic_demo_expected"]

    # Direct inference
    bundle = joblib.load(ROOT / "backend" / "models" / "final_xgboost_model_bundle.pkl")
    frame = pd.DataFrame([features])[bundle["feature_names"]]
    direct_proba = float(bundle["model"].predict_proba(frame)[0, 1])
    direct_pred = int(direct_proba >= bundle["threshold"])

    res = client.post("/api/predict", json={"features": features})
    assert res.status_code == 200
    body = res.json()
    assert body["predicted_class"] == direct_pred == expected["predicted_class"]
    assert abs(body["probability"] - direct_proba) < 1e-9
    assert abs(body["probability"] - expected["probability"]) < 1e-9
    assert body["threshold"] == 0.6
    assert body["model"] == "Tuned XGBoost"


def test_predict_rejects_unknown_feature(client: TestClient):
    res = client.post("/api/predict", json={"features": {"NOT_A_FEATURE": 1}})
    assert res.status_code == 422


def test_predict_allows_partial_missing(client: TestClient):
    # Empty features → all null → pipeline imputes
    res = client.post("/api/predict", json={"features": {}})
    assert res.status_code == 200
    body = res.json()
    assert body["predicted_class"] in (0, 1)
    assert 0.0 <= body["probability"] <= 1.0


def test_dataset_does_not_expose_seqn(client: TestClient):
    res = client.get("/api/dataset/features")
    assert res.status_code == 200
    names = [f["name"] for f in res.json()["features"]]
    assert "SEQN" not in names


def test_shap_top_features(client: TestClient):
    res = client.get("/api/explainability/importance")
    assert res.status_code == 200
    top = res.json()["highlighted_features"]
    assert top[0]["feature"] == "BPQ101D"
    assert abs(top[0]["mean_abs_shap"] - 0.71654534) < 1e-6


def test_predict_includes_local_shap(client: TestClient):
    schema = json.loads(SCHEMA_PATH.read_text())
    res = client.post(
        "/api/predict",
        json={"features": schema["synthetic_demo"], "include_shap": True},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["shap_top"] is not None
    assert len(body["shap_top"]) > 0
    assert "feature" in body["shap_top"][0]
    assert "shap_value" in body["shap_top"][0]
    assert body["shap_note"]


def test_threshold_curve(client: TestClient):
    res = client.get("/api/models/threshold-curve")
    assert res.status_code == 200
    body = res.json()
    assert body["selected_threshold"] == 0.6
    assert len(body["train_oof_curve"]) >= 5
    assert len(body["held_out_test_comparison"]) == 2
