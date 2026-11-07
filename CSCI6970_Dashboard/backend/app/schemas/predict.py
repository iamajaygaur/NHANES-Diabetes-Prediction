"""Prediction request/response schemas."""

from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    features: dict[str, Any] = Field(
        ...,
        description="Map of feature name to value. Missing keys are treated as null.",
    )
    include_shap: bool = Field(
        default=True,
        description="When true, return local SHAP contributions for this prediction.",
    )


class ShapContribution(BaseModel):
    feature: str
    shap_value: float
    abs_shap: float
    direction: str


class PredictResponse(BaseModel):
    predicted_class: int
    probability: float
    threshold: float
    model: str
    interpretation: str
    disclaimer: str
    shap_base_value: Optional[float] = None
    shap_top: Optional[List[ShapContribution]] = None
    shap_note: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: Optional[str] = None
    threshold: Optional[float] = None
    n_features: Optional[int] = None
