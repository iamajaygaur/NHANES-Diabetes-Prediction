"""Aggregated research data access — never returns individual health records."""

from __future__ import annotations

import json
import logging
import math
from functools import lru_cache
from typing import Any

import numpy as np
import pandas as pd

from app.core.config import get_settings
from app.services.model_service import model_service

logger = logging.getLogger(__name__)

FEATURE_DESCRIPTIONS: dict[str, str] = {
    "RIDSTATR": "Interview/examination status",
    "RIAGENDR": "Gender",
    "RIDAGEYR": "Age in years at screening",
    "RIDRETH1": "Race/Hispanic origin",
    "RIDRETH3": "Race/Hispanic origin with NH Asian",
    "RIDEXMON": "Six-month examination period",
    "DMQMILIZ": "Served active duty in U.S. Armed Forces",
    "DMDBORN4": "Country of birth",
    "DMDYRUSR": "Length of time in the U.S.",
    "DMDEDUC2": "Education level (adults 20+)",
    "DMDMARTZ": "Marital status",
    "RIDEXPRG": "Pregnancy status at examination",
    "DMDHHSIZ": "Total number of people in household",
    "INDFMPIR": "Ratio of family income to poverty",
    "BMXBMI": "Body mass index (kg/m²)",
    "BMXWT": "Weight (kg)",
    "BMXHT": "Standing height (cm)",
    "BMXWAIST": "Waist circumference (cm)",
    "BPXOSY1": "Systolic blood pressure — reading 1 (mm Hg)",
    "BPXODI1": "Diastolic blood pressure — reading 1 (mm Hg)",
    "BPXOSY2": "Systolic blood pressure — reading 2 (mm Hg)",
    "BPXODI2": "Diastolic blood pressure — reading 2 (mm Hg)",
    "BPXOSY3": "Systolic blood pressure — reading 3 (mm Hg)",
    "BPXODI3": "Diastolic blood pressure — reading 3 (mm Hg)",
    "BPXOPLS1": "Pulse — reading 1 (bpm)",
    "BPXOPLS2": "Pulse — reading 2 (bpm)",
    "BPXOPLS3": "Pulse — reading 3 (bpm)",
    "BPQ020": "Ever told you have high blood pressure",
    "BPQ030": "Told on 2+ visits you have hypertension",
    "BPQ150": "Told to take prescribed hypertension medicine",
    "BPQ080": "Ever told you have high cholesterol",
    "BPQ101D": "Told to take prescribed cholesterol medicine",
    "PAD790Q": "Days of moderate work activity",
    "PAD790U": "Unit for moderate work activity days",
    "PAD800": "Minutes of moderate work activity",
    "PAD810Q": "Days of vigorous work activity",
    "PAD810U": "Unit for vigorous work activity days",
    "PAD820": "Minutes of vigorous work activity",
    "PAD680": "Minutes of sedentary activity on a typical day",
    "SMQ020": "Smoked at least 100 cigarettes in life",
    "SMQ040": "Current cigarette smoking frequency",
    "SMD641": "Days smoked cigarettes in past 30 days",
    "SMD650": "Average cigarettes per day (past 30 days)",
    "ALQ111": "Ever had ≥12 drinks in any one year",
    "ALQ121": "Alcohol frequency past 12 months",
    "ALQ130": "Average drinks per drinking day",
    "ALQ142": "Frequency of ≥5 drinks in a day",
    "ALQ270": "Frequency of ≥4 drinks in a day",
    "ALQ280": "Frequency of ≥8 drinks in a day",
    "ALQ151": "Ever had a period of heavy drinking",
    "ALQ170": "Frequency of ≥8 drinks in a day (alt)",
}


class DataService:
    def read_table(self, name: str) -> pd.DataFrame:
        path = get_settings().tables_dir / name
        if not path.exists():
            raise FileNotFoundError(f"Table not found: {name}")
        return pd.read_csv(path)

    @lru_cache(maxsize=1)
    def modeling_frame(self) -> pd.DataFrame:
        path = get_settings().modeling_csv
        if not path.exists():
            raise FileNotFoundError(f"Modeling CSV not found: {path}")
        df = pd.read_csv(path)
        # Hard safety: drop any participant identifiers if present
        drop_cols = [c for c in df.columns if c.upper() == "SEQN"]
        if drop_cols:
            df = df.drop(columns=drop_cols)
        return df

    def overview(self) -> dict[str, Any]:
        target = self.read_table("diabetes_target_distribution.csv")
        metrics = self.read_table("xgboost_final_test_metrics.csv").iloc[0]
        final_summary = self.read_table("final_model_summary.csv")

        diabetes_row = target[target["DIABETES"].astype(str).str.lower() == "diabetes"].iloc[0]
        no_diabetes_row = target[
            target["DIABETES"].astype(str).str.lower().str.contains("no")
        ].iloc[0]
        diabetes_cases = int(diabetes_row["Participant_Count"])
        non_diabetes_cases = int(no_diabetes_row["Participant_Count"])
        participants = diabetes_cases + non_diabetes_cases
        prevalence_pct = float(diabetes_row["Percentage"])
        n_features = len(model_service.feature_names) if model_service.is_ready else 51
        threshold = float(metrics["Threshold"])
        accuracy = float(metrics["Accuracy"])
        roc_auc = float(metrics["ROC-AUC"])

        shap = self.read_table("xgboost_shap_feature_importance.csv")
        top_shap_names = [
            _strip_transformed_feature_name(str(name))
            for name in shap["Feature"].head(4).tolist()
        ]
        top_shap_labels = [
            FEATURE_DESCRIPTIONS.get(name, name) for name in top_shap_names
        ]

        return {
            "project": {
                "name": "DiabetesInsight",
                "subtitle": "NHANES-Based Diabetes Prediction and Healthcare Analytics",
                "research_title": "NHANES-Based Diabetes Prediction Using Machine Learning",
                "dataset": "NHANES August 2021–August 2023",
                "source": "NCHS / CDC",
                "author": "Ajay Gaur",
                "credit": "Researched and developed by Ajay Gaur",
            },
            "kpis": {
                "participants": participants,
                "diabetes_cases": diabetes_cases,
                "non_diabetes_cases": non_diabetes_cases,
                "prevalence_pct": prevalence_pct,
                "predictor_features": n_features,
                "model": "Tuned XGBoost",
                "threshold": threshold,
            },
            "target_distribution": _df_records(target),
            "final_test_metrics": {
                "accuracy": accuracy,
                "precision": float(metrics["Precision"]),
                "recall": float(metrics["Recall"]),
                "f1_score": float(metrics["F1-score"]),
                "roc_auc": roc_auc,
                "threshold": threshold,
            },
            "final_model_summary": _df_records(final_summary),
            "key_findings": [
                (
                    f"Diabetes prevalence in the modeling cohort is {prevalence_pct}% "
                    f"({diabetes_cases:,} of {participants:,})."
                ),
                "Participants with diabetes had higher mean age and BMI than those without.",
                (
                    f"Tuned XGBoost with threshold {threshold:.2f} achieved "
                    f"{accuracy * 100:.2f}% test accuracy and {roc_auc * 100:.2f}% ROC-AUC."
                ),
                (
                    "SHAP ranked highest: "
                    + ", ".join(top_shap_labels)
                    + "."
                ),
                "Associations describe patterns in NHANES data and do not establish causation.",
            ],
            "feature_mix": _feature_mix_shares(
                model_service.schema.get("feature_groups", {}) if model_service.is_ready else {}
            ),
        }

    def dataset_summary(self) -> dict[str, Any]:
        df = self.modeling_frame()
        feature_names = model_service.feature_names
        groups = model_service.schema.get("feature_groups", {})
        missing = (df[feature_names].isna().mean() * 100).round(2)
        return {
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "predictor_features": len(feature_names),
            "target": "DIABETES",
            "feature_type_counts": {
                "numerical": len(groups.get("numerical", [])),
                "categorical": len(groups.get("categorical", [])),
                "ordinal": len(groups.get("ordinal", [])),
            },
            "overall_missing_pct": float(df[feature_names].isna().mean().mean() * 100),
            "top_missing_features": [
                {"feature": f, "missing_pct": float(missing[f])}
                for f in missing.sort_values(ascending=False).head(15).index
            ],
        }

    def dataset_features(
        self,
        search: str | None = None,
        feature_type: str | None = None,
    ) -> dict[str, Any]:
        df = self.modeling_frame()
        groups = model_service.schema.get("feature_groups", {})
        type_lookup = {
            f: g for g, cols in groups.items() for f in cols
        }
        rows: list[dict[str, Any]] = []
        for name in model_service.feature_names:
            ftype = type_lookup.get(name, "unknown")
            if feature_type and ftype != feature_type:
                continue
            if search and search.lower() not in name.lower() and search.lower() not in FEATURE_DESCRIPTIONS.get(name, "").lower():
                continue
            series = df[name]
            missing_pct = float(series.isna().mean() * 100)
            item: dict[str, Any] = {
                "name": name,
                "description": FEATURE_DESCRIPTIONS.get(name, ""),
                "feature_type": ftype,
                "dtype": str(series.dtype),
                "missing_pct": round(missing_pct, 2),
                "n_unique": int(series.nunique(dropna=True)),
            }
            if ftype == "numerical" and pd.api.types.is_numeric_dtype(series):
                desc = series.describe()
                item["stats"] = {
                    "count": float(desc.get("count", 0)),
                    "mean": float(desc.get("mean", 0)) if pd.notna(desc.get("mean")) else None,
                    "std": float(desc.get("std", 0)) if pd.notna(desc.get("std")) else None,
                    "min": float(desc.get("min", 0)) if pd.notna(desc.get("min")) else None,
                    "p25": float(desc.get("25%", 0)) if pd.notna(desc.get("25%")) else None,
                    "p50": float(desc.get("50%", 0)) if pd.notna(desc.get("50%")) else None,
                    "p75": float(desc.get("75%", 0)) if pd.notna(desc.get("75%")) else None,
                    "max": float(desc.get("max", 0)) if pd.notna(desc.get("max")) else None,
                }
            else:
                vc = series.value_counts(dropna=True).head(12)
                item["categories"] = [
                    {"value": _jsonable(idx), "count": int(cnt)}
                    for idx, cnt in vc.items()
                ]
            rows.append(item)
        return {"count": len(rows), "features": rows}

    def target_distribution(self) -> dict[str, Any]:
        table = self.read_table("diabetes_target_distribution.csv")
        df = self.modeling_frame()
        age_bins = pd.cut(
            df["RIDAGEYR"],
            bins=[20, 30, 40, 50, 60, 70, 80],
            right=True,
            include_lowest=True,
        )
        by_age = (
            df.groupby([age_bins, "DIABETES"], observed=False)
            .size()
            .reset_index(name="count")
        )
        by_age["age_group"] = by_age["RIDAGEYR"].astype(str)
        by_age["diabetes"] = by_age["DIABETES"].map({0: "No Diabetes", 1: "Diabetes"})
        return {
            "overall": _df_records(table),
            "by_age_group": by_age[["age_group", "diabetes", "count"]].to_dict(orient="records"),
            "note": "Observed associations do not establish causation.",
        }

    def missingness(self) -> dict[str, Any]:
        category = self.read_table("05_updated_missingness_category_summary.csv")
        by_feature_type = self.read_table("26_missingness_by_feature_category.csv")
        top = self.read_table("01_missing_value_summary.csv").copy()
        # First column is the feature name (often Unnamed: 0 in the CSV export)
        name_col = top.columns[0]
        if name_col != "Feature":
            top = top.rename(columns={name_col: "Feature"})
        return {
            "category_summary": _df_records(category),
            "by_feature_category": _df_records(by_feature_type),
            "top_missing": _df_records(top.head(20)),
            "readme_final_predictor_missingness": {
                "no_missing": 8,
                "low_lt_5": 9,
                "moderate_5_to_30": 17,
                "high_30_to_60": 7,
                "very_high_ge_60": 10,
                "source": "reference/README.md §5 (final 51 predictors)",
            },
        }

    def analysis_distributions(self) -> dict[str, Any]:
        df = self.modeling_frame()
        numerical_stats = self.read_table("numerical_features_descriptive_statistics.csv")
        by_status = self.read_table("numerical_features_by_diabetes_status.csv")
        corr = self.read_table("strong_numerical_correlations.csv")
        eda = self.read_table("eda_findings_summary.csv")

        def hist(col: str, bins: int = 20) -> list[dict[str, Any]]:
            series = df[col].dropna()
            if series.empty:
                return []
            counts, _edges = pd.cut(series, bins=bins, retbins=True)
            out = series.groupby(counts, observed=False).size()
            rows: list[dict[str, Any]] = []
            for idx, val in out.items():
                left = float(idx.left)
                right = float(idx.right)
                rows.append(
                    {
                        "bin": str(idx),
                        "count": int(val),
                        "left": None if not math.isfinite(left) else left,
                        "right": None if not math.isfinite(right) else right,
                    }
                )
            return rows

        payload = {
            "numerical_descriptive": _df_records(numerical_stats),
            "numerical_by_diabetes": _df_records(by_status),
            "strong_correlations": _df_records(corr),
            "eda_findings": _df_records(eda),
            "histograms": {
                "RIDAGEYR": hist("RIDAGEYR"),
                "BMXBMI": hist("BMXBMI"),
                "BMXWT": hist("BMXWT"),
                "BMXWAIST": hist("BMXWAIST"),
                "INDFMPIR": hist("INDFMPIR"),
                "BPXOSY1": hist("BPXOSY1"),
                "BPXODI1": hist("BPXODI1"),
            },
            "disclaimer": "Associations observed in EDA do not imply causation.",
        }
        return _sanitize_json(payload)

    def model_comparison(self) -> dict[str, Any]:
        cv = self.read_table("model_comparison_cv_results.csv")
        tuned = self.read_table("xgboost_tuned_cv_results.csv")
        baseline_vs_tuned = self.read_table("xgboost_baseline_vs_tuned_comparison.csv")
        # Pivot baseline CV to wide form for charts
        wide: dict[str, dict[str, float]] = {}
        for _, row in cv.iterrows():
            model = row["Model"]
            metric = row["Metric"]
            wide.setdefault(model, {})
            wide[model][metric] = float(row["Mean"])
            wide[model][f"{metric}_std"] = float(row["Standard Deviation"])
        comparison = [
            {"model": model, **metrics} for model, metrics in wide.items()
        ]
        return _sanitize_json(
            {
                "baseline_cv": comparison,
                "baseline_cv_long": _df_records(cv),
                "tuned_xgboost_cv": _df_records(tuned),
                "baseline_vs_tuned": _df_records(baseline_vs_tuned),
                "notes": [
                    "Baseline metrics are five-fold stratified cross-validation means.",
                    "Tuned XGBoost CV results are separate from held-out test metrics.",
                ],
            }
        )

    def final_metrics(self) -> dict[str, Any]:
        metrics = self.read_table("xgboost_final_test_metrics.csv").iloc[0]
        threshold_cmp = self.read_table("xgboost_final_test_threshold_comparison.csv")
        return {
            "model": "Tuned XGBoost",
            "split": "Held-out test set (n=1,508)",
            "metrics": {
                "accuracy": float(metrics["Accuracy"]),
                "precision": float(metrics["Precision"]),
                "recall": float(metrics["Recall"]),
                "f1_score": float(metrics["F1-score"]),
                "roc_auc": float(metrics["ROC-AUC"]),
                "average_precision": float(metrics["Average Precision"]),
                "threshold": float(metrics["Threshold"]),
            },
            "threshold_comparison": _df_records(threshold_cmp),
            "figures": [
                "xgboost_final_confusion_matrix.png",
                "xgboost_roc_curve.png",
                "xgboost_precision_recall_curve.png",
                "xgboost_feature_importance.png",
            ],
        }

    def confusion_matrix(self) -> dict[str, Any]:
        # CSV layout:
        # Prediction, Actual No Diabetes, Actual Diabetes
        # No Diabetes, TN, FN
        # Diabetes, FP, TP
        # Canonical report orientation: [[TN, FP], [FN, TP]]
        table = self.read_table("final_confusion_matrix_summary.csv")
        no_diabetes = table[table["Prediction"].astype(str).str.lower().str.contains("no")].iloc[0]
        diabetes = table[~table["Prediction"].astype(str).str.lower().str.contains("no")].iloc[0]
        tn = int(no_diabetes["Actual No Diabetes"])
        fn = int(no_diabetes["Actual Diabetes"])
        fp = int(diabetes["Actual No Diabetes"])
        tp = int(diabetes["Actual Diabetes"])
        return {
            "matrix": [[tn, fp], [fn, tp]],
            "labels": {
                "rows": ["Actual No Diabetes", "Actual Diabetes"],
                "columns": ["Predicted No Diabetes", "Predicted Diabetes"],
            },
            "tn": tn,
            "fp": fp,
            "fn": fn,
            "tp": tp,
            "source": "reference/outputs/tables/final_confusion_matrix_summary.csv",
        }

    def threshold_curve(self) -> dict[str, Any]:
        train_curve = self.read_table("xgboost_threshold_optimization.csv")
        test_cmp = self.read_table("xgboost_final_test_threshold_comparison.csv")
        selected = 0.6
        return _sanitize_json(
            {
                "selected_threshold": selected,
                "selection_basis": (
                    "Highest F1 among evaluated thresholds using training-set "
                    "out-of-fold predictions (not test labels)."
                ),
                "train_oof_curve": _df_records(train_curve),
                "held_out_test_comparison": _df_records(test_cmp),
                "notes": [
                    "Training curve is for threshold selection.",
                    "Held-out test comparison validates 0.50 vs 0.60 after selection.",
                    "ROC-AUC is threshold-independent.",
                ],
            }
        )

    def explainability(self) -> dict[str, Any]:
        shap = self.read_table("xgboost_shap_feature_importance.csv")
        fi = self.read_table("xgboost_feature_importance.csv")
        top = shap.head(20)
        highlighted: list[dict[str, Any]] = []
        for _, row in shap.head(8).iterrows():
            raw_name = str(row["Feature"])
            feature = _strip_transformed_feature_name(raw_name)
            highlighted.append(
                {
                    "feature": feature,
                    "transformed_feature": raw_name,
                    "label": FEATURE_DESCRIPTIONS.get(feature, feature),
                    "mean_abs_shap": float(row["Mean_ABS_SHAP"]),
                }
            )
        return {
            "shap_importance": _df_records(shap),
            "top_shap": _df_records(top),
            "xgboost_gain_importance": _df_records(fi.head(20)),
            "highlighted_features": highlighted,
            "figures": [
                "xgboost_shap_importance_bar.png",
                "xgboost_shap_summary.png",
                "xgboost_feature_importance.png",
            ],
            "disclaimer": "SHAP feature importance does not demonstrate causality.",
            "feature_descriptions": FEATURE_DESCRIPTIONS,
        }

    def list_figures(self) -> list[dict[str, str]]:
        figures_dir = get_settings().figures_dir
        return [
            {"name": p.name, "path": f"/api/assets/figures/{p.name}"}
            for p in sorted(figures_dir.glob("*.png"))
        ]


def _feature_mix_shares(groups: dict[str, list[str]]) -> list[dict[str, Any]]:
    """Percent shares for Overview vinyl legend from real feature groups."""
    counts = {
        "Numerical": len(groups.get("numerical", [])),
        "Categorical": len(groups.get("categorical", [])),
        "Ordinal": len(groups.get("ordinal", [])),
    }
    total = sum(counts.values()) or 1
    colors = {
        "Numerical": "#2563eb",
        "Categorical": "#38bdf8",
        "Ordinal": "#a78bfa",
    }
    return [
        {
            "name": name,
            "value": count,
            "pct": round((count / total) * 100),
            "color": colors[name],
        }
        for name, count in counts.items()
        if count > 0
    ]


def _strip_transformed_feature_name(name: str) -> str:
    """Map pipeline column names like categorical__BPQ101D_1.0 → BPQ101D."""
    cleaned = name
    for prefix in ("categorical__", "numerical__", "ordinal__"):
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix) :]
            break
    if "_" in cleaned:
        head, tail = cleaned.rsplit("_", 1)
        if tail.replace(".", "", 1).isdigit() or tail in {"True", "False"}:
            cleaned = head
    return cleaned


def _df_records(df: pd.DataFrame) -> list[dict[str, Any]]:
    """Convert DataFrame rows to JSON-safe dictionaries (NaN/Inf → null)."""
    cleaned = df.replace([np.inf, -np.inf], np.nan)
    return json.loads(cleaned.to_json(orient="records"))


def _sanitize_json(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: _sanitize_json(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_sanitize_json(v) for v in value]
    if isinstance(value, (float, np.floating)):
        number = float(value)
        return None if not math.isfinite(number) else number
    if isinstance(value, (np.integer,)):
        return int(value)
    if pd.isna(value):
        return None
    return value


def _jsonable(value: Any) -> Any:
    if pd.isna(value):
        return None
    if isinstance(value, (float, np.floating)):
        number = float(value)
        return None if not math.isfinite(number) else number
    if hasattr(value, "item"):
        try:
            return _jsonable(value.item())
        except Exception:
            return str(value)
    if isinstance(value, (str, int, bool)):
        return value
    return str(value)


data_service = DataService()
