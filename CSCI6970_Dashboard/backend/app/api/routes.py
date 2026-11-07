"""REST API routes for DiabetesInsight."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

from app.core.config import get_settings
from app.schemas.predict import HealthResponse, PredictRequest, PredictResponse
from app.services.data_service import data_service
from app.services.model_service import model_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    ready = model_service.is_ready
    return HealthResponse(
        status="ok" if ready else "degraded",
        model_loaded=ready,
        model_name=model_service.model_name if ready else None,
        threshold=model_service.threshold if ready else None,
        n_features=len(model_service.feature_names) if ready else None,
    )


@router.get("/overview")
def overview():
    return data_service.overview()


@router.get("/dataset/summary")
def dataset_summary():
    return data_service.dataset_summary()


@router.get("/dataset/features")
def dataset_features(
    search: Optional[str] = Query(default=None),
    feature_type: Optional[str] = Query(default=None),
):
    return data_service.dataset_features(search=search, feature_type=feature_type)


@router.get("/analysis/target-distribution")
def target_distribution():
    return data_service.target_distribution()


@router.get("/analysis/missingness")
def missingness():
    return data_service.missingness()


@router.get("/analysis/distributions")
def analysis_distributions():
    return data_service.analysis_distributions()


@router.get("/models/comparison")
def model_comparison():
    return data_service.model_comparison()


@router.get("/models/final-metrics")
def final_metrics():
    return data_service.final_metrics()


@router.get("/models/confusion-matrix")
def confusion_matrix():
    return data_service.confusion_matrix()


@router.get("/models/threshold-curve")
def threshold_curve():
    return data_service.threshold_curve()


@router.get("/explainability/importance")
def explainability_importance():
    return data_service.explainability()


@router.get("/model/schema")
def model_schema():
    from app.services.data_service import FEATURE_DESCRIPTIONS

    payload = dict(model_service.schema)
    payload["feature_descriptions"] = FEATURE_DESCRIPTIONS
    return payload


@router.get("/model/demo")
def synthetic_demo():
    schema = model_service.schema
    return {
        "label": "Synthetic demonstration profile",
        "features": schema.get("synthetic_demo", {}),
        "expected": schema.get("synthetic_demo_expected"),
        "note": "Synthetic values derived from cohort medians/modes. Do not enter real personal health data.",
    }


@router.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    try:
        result = model_service.predict(
            payload.features,
            include_shap=payload.include_shap,
        )
        return PredictResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed") from exc


@router.get("/assets/figures")
def list_figures():
    return {"figures": data_service.list_figures()}


@router.get("/assets/figures/{filename}")
def get_figure(filename: str):
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = get_settings().figures_dir / filename
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="Figure not found")
    # Ensure resolved path stays inside figures dir
    figures_root = get_settings().figures_dir.resolve()
    resolved = path.resolve()
    if figures_root not in resolved.parents and resolved != figures_root:
        raise HTTPException(status_code=400, detail="Invalid path")
    return FileResponse(resolved, media_type="image/png")
