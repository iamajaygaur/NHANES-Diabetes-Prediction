# DiabetesInsight Backend

FastAPI service that loads the saved NHANES XGBoost research model and serves
aggregated analytics for the dashboard.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs: http://127.0.0.1:8000/docs

## Tests

```bash
cd backend
source .venv/bin/activate
pytest -q
```

## Model artifact

Runtime model copy: `backend/models/final_xgboost_model_bundle.pkl`

This is a **copy** of the research artifact. The original under `../CSCI6970/models/`
must not be modified.
