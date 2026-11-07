"""Load and run the saved XGBoost research model."""

from __future__ import annotations

import json
import logging
import math
from pathlib import Path
from typing import Any, Optional

import joblib
import numpy as np
import pandas as pd

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class ModelService:
    """Owns the trusted model bundle loaded once at startup."""

    def __init__(self) -> None:
        self._bundle: Optional[dict[str, Any]] = None
        self._schema: Optional[dict[str, Any]] = None
        self._explainer: Any = None
        self._transformed_feature_names: Optional[list[str]] = None

    @property
    def is_ready(self) -> bool:
        return self._bundle is not None

    def load(self) -> None:
        settings = get_settings()
        path = settings.model_bundle_path
        if not path.exists():
            raise FileNotFoundError(f"Model bundle not found: {path}")

        logger.info("Loading model bundle from %s", path)
        bundle = joblib.load(path)
        required = {"model", "threshold", "feature_names", "model_name", "target"}
        missing = required - set(bundle.keys())
        if missing:
            raise ValueError(f"Model bundle missing keys: {sorted(missing)}")

        self._bundle = bundle
        self._schema = self._load_schema(settings.feature_schema_path, bundle)

        pipe = bundle["model"]
        preprocessor = pipe.named_steps["preprocessor"]
        classifier = pipe.named_steps["classifier"]
        self._transformed_feature_names = list(preprocessor.get_feature_names_out())

        try:
            import shap

            self._explainer = shap.TreeExplainer(classifier)
            logger.info("SHAP TreeExplainer ready (%s transformed features)", len(self._transformed_feature_names))
        except Exception:  # noqa: BLE001
            logger.exception("SHAP explainer failed to initialize")
            self._explainer = None

        logger.info(
            "Loaded %s | features=%s | threshold=%s",
            bundle["model_name"],
            len(bundle["feature_names"]),
            bundle["threshold"],
        )

    @staticmethod
    def _load_schema(path: Path, bundle: dict[str, Any]) -> dict[str, Any]:
        if path.exists():
            return json.loads(path.read_text())
        pipe = bundle["model"]
        pre = pipe.named_steps["preprocessor"]
        groups = {
            name: list(cols)
            for name, _, cols in pre.transformers_
            if name != "remainder"
        }
        return {
            "model_name": bundle["model_name"],
            "threshold": bundle["threshold"],
            "target": bundle["target"],
            "random_state": bundle.get("random_state"),
            "feature_names": list(bundle["feature_names"]),
            "feature_groups": groups,
        }

    def _require(self) -> dict[str, Any]:
        if self._bundle is None:
            raise RuntimeError("Model is not loaded")
        return self._bundle

    @property
    def feature_names(self) -> list[str]:
        return list(self._require()["feature_names"])

    @property
    def threshold(self) -> float:
        return float(self._require()["threshold"])

    @property
    def model_name(self) -> str:
        return str(self._require()["model_name"])

    @property
    def schema(self) -> dict[str, Any]:
        self._require()
        assert self._schema is not None
        return self._schema

    def build_frame(self, features: dict[str, Any]) -> pd.DataFrame:
        names = self.feature_names
        unknown = sorted(set(features) - set(names))
        if unknown:
            raise ValueError(f"Unknown features: {unknown}")

        row = {name: features.get(name, None) for name in names}
        return pd.DataFrame([row], columns=names)

    def predict(self, features: dict[str, Any], include_shap: bool = True) -> dict[str, Any]:
        bundle = self._require()
        frame = self.build_frame(features)
        model = bundle["model"]
        probability = float(model.predict_proba(frame)[0, 1])
        threshold = float(bundle["threshold"])
        predicted_class = int(probability >= threshold)
        result: dict[str, Any] = {
            "predicted_class": predicted_class,
            "probability": probability,
            "threshold": threshold,
            "model": bundle["model_name"],
            "interpretation": (
                "Model prediction: diabetes class"
                if predicted_class == 1
                else "Model prediction: non-diabetes class"
            ),
            "disclaimer": (
                "This tool is for academic research and educational demonstration only. "
                "It is not a medical diagnostic system and must not be used to make "
                "healthcare decisions."
            ),
            "shap_base_value": None,
            "shap_top": None,
            "shap_note": None,
        }

        if include_shap:
            shap_payload = self._local_shap(frame)
            result.update(shap_payload)

        return result

    def _local_shap(self, frame: pd.DataFrame, top_n: int = 12) -> dict[str, Any]:
        if self._explainer is None or self._transformed_feature_names is None:
            return {
                "shap_base_value": None,
                "shap_top": None,
                "shap_note": "Local SHAP is unavailable for this runtime.",
            }

        try:
            pipe = self._require()["model"]
            preprocessor = pipe.named_steps["preprocessor"]
            transformed = preprocessor.transform(frame)
            values = self._explainer.shap_values(transformed)
            base = self._explainer.expected_value

            # Normalize SHAP output shapes across shap/xgboost versions
            if isinstance(values, list):
                values = values[1] if len(values) > 1 else values[0]
            arr = np.asarray(values)
            if arr.ndim == 3:
                arr = arr[0, :, -1] if arr.shape[-1] > 1 else arr[0, :, 0]
            elif arr.ndim == 2:
                arr = arr[0]
            arr = np.asarray(arr, dtype=float).reshape(-1)

            if isinstance(base, (list, tuple, np.ndarray)):
                base_arr = np.asarray(base, dtype=float).reshape(-1)
                base_value = float(base_arr[-1] if base_arr.size > 1 else base_arr[0])
            else:
                base_value = float(base)

            names = self._transformed_feature_names
            if len(arr) != len(names):
                raise ValueError(
                    f"SHAP length mismatch: values={len(arr)} features={len(names)}"
                )

            rows = []
            for name, value in zip(names, arr):
                number = float(value)
                if not math.isfinite(number):
                    continue
                rows.append(
                    {
                        "feature": str(name),
                        "shap_value": number,
                        "abs_shap": abs(number),
                        "direction": (
                            "increases diabetes probability"
                            if number > 0
                            else "decreases diabetes probability"
                        ),
                    }
                )
            rows.sort(key=lambda r: r["abs_shap"], reverse=True)
            return {
                "shap_base_value": base_value,
                "shap_top": rows[:top_n],
                "shap_note": (
                    "Local SHAP values explain this single model prediction. "
                    "They do not demonstrate causality and are not medical advice."
                ),
            }
        except Exception:  # noqa: BLE001
            logger.exception("Local SHAP computation failed")
            return {
                "shap_base_value": None,
                "shap_top": None,
                "shap_note": "Local SHAP computation failed for this input.",
            }


model_service = ModelService()
