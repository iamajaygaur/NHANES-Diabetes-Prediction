"""Application configuration."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[2]
DASHBOARD_ROOT = BACKEND_ROOT.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "DiabetesInsight API"
    app_version: str = "1.0.0"
    api_prefix: str = "/api"
    cors_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:3001,http://127.0.0.1:3001,"
        "https://diabetesinsight.vercel.app"
    )

    model_bundle_path: Path = BACKEND_ROOT / "models" / "final_xgboost_model_bundle.pkl"
    reference_root: Path = DASHBOARD_ROOT / "reference"
    tables_dir: Path = DASHBOARD_ROOT / "reference" / "outputs" / "tables"
    figures_dir: Path = DASHBOARD_ROOT / "reference" / "outputs" / "figures"
    modeling_csv: Path = (
        DASHBOARD_ROOT / "reference" / "data" / "processed" / "nhanes_diabetes_modeling.csv"
    )
    feature_schema_path: Path = DASHBOARD_ROOT / "docs" / "feature_schema.json"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
