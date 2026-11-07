# DiabetesInsight

NHANES-Based Diabetes Prediction and Healthcare Analytics — interactive research showcase for the CSCI6970 MS Data Science project.

> Academic research and educational demonstration only. Not a medical diagnostic system.

## Isolation

| Project | Path |
|---|---|
| Original research (read-only) | `../CSCI6970/` |
| This dashboard | `CSCI6970_Dashboard/` |

The original research repository, notebooks, datasets, and models are **not modified**. Runtime uses a **copy** of the model bundle under `backend/models/`. Reference materials are copies under `reference/`.

## Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, Recharts, React Hook Form / Zod-ready forms
- **Backend:** FastAPI, Pydantic, scikit-learn, XGBoost, pandas, SHAP (for research artifacts)

## Quick start

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API: http://127.0.0.1:8000
- Swagger: http://127.0.0.1:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

The frontend proxies `/api/*` to the FastAPI backend, so the browser does not need
cross-origin requests. Keep the backend running on port 8000.

### 3. Tests

```bash
cd backend
source .venv/bin/activate
pytest -q
```

## Environment

See `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Key API routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health + model status |
| GET | `/api/overview` | KPI dashboard payload |
| GET | `/api/dataset/summary` | Dataset summary |
| GET | `/api/dataset/features` | Feature dictionary |
| GET | `/api/analysis/*` | EDA aggregates |
| GET | `/api/models/*` | CV + test metrics |
| GET | `/api/explainability/importance` | SHAP tables |
| POST | `/api/predict` | Tuned XGBoost inference |

## Model integration

See `docs/MODEL_INTEGRATION.md`. The saved bundle includes the fitted preprocessing pipeline and threshold `0.60`.

## Deployment notes

See `docs/DEPLOY.md` for Docker, env vars, and a go-live checklist.

1. Deploy FastAPI (or `backend/Dockerfile`) with the `backend/models` artifact.
2. Set `CORS_ORIGINS` to the frontend origin.
3. Deploy the Next.js app with `BACKEND_URL` pointing at the API.
4. Do not expose raw participant-level health records or SEQN.

## Folder structure

```text
CSCI6970_Dashboard/
├── reference/          # read-only research copies
├── backend/            # FastAPI + runtime model copy
├── frontend/           # Next.js dashboard
├── docs/               # model integration notes
├── .env.example
└── README.md
```
