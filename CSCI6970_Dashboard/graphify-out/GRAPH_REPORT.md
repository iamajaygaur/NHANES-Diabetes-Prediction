# Graph Report - CSCI6970_Dashboard  (2026-11-08)

## Corpus Check
- 71 files · ~29,618 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 137 file(s) not represented in the graph (top: .csv 120, (none) 7, .pkl 3)
- WARNING: 137 of 235 files seen (58%) have no supported extractor and are missing from this graph entirely. It may look complete while representing only part of the codebase.

## Summary
- 524 nodes · 905 edges · 39 communities (26 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a97f3e4b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_model_and_api.py
- AppShell.tsx
- NHANES-Based Diabetes Prediction Using Machine Learning
- Render free Web Service setup (DiabetesInsight API)
- routes.py
- project/page.tsx
- test_model_and_api.py
- app/page.tsx
- frontend/package.json
- performance/page.tsx
- compilerOptions
- dependencies
- ModelService
- api.ts
- cn
- analysis/page.tsx
- DiabetesInsight
- eslint.config.mjs
- Model Integration Guide — DiabetesInsight
- tailwind-merge
- keepalive.yml
- scripts
- DiabetesInsight Backend
- DiabetesInsight API (Hugging Face Space)
- scripts
- DiabetesInsight Enhancement Plan
- tailwindcss
- postcss.config.mjs
- AGENTS.md
- frontend/README.md
- READ_ONLY.md
- react
- route.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 42 edges
2. `NHANES-Based Diabetes Prediction Using Machine Learning` - 21 edges
3. `PredictPage()` - 18 edges
4. `apiGet()` - 16 edges
5. `lucide-react` - 16 edges
6. `compilerOptions` - 16 edges
7. `DataService` - 15 edges
8. `react` - 15 edges
9. `ModelService` - 14 edges
10. `LoadingState()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `AnalysisPage()` --calls--> `AmploSelect()`  [EXTRACTED]
  frontend/src/app/analysis/page.tsx → frontend/src/components/AmploSelect.tsx
- `AnalysisPage()` --calls--> `apiGet()`  [EXTRACTED]
  frontend/src/app/analysis/page.tsx → frontend/src/lib/api.ts
- `AnalysisPage()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/app/analysis/page.tsx → frontend/src/lib/utils.ts
- `PastelStat()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/app/analysis/page.tsx → frontend/src/lib/utils.ts
- `AppShell()` --calls--> `warmApi()`  [EXTRACTED]
  frontend/src/components/AppShell.tsx → frontend/src/lib/api.ts

## Import Cycles
- None detected.

## Communities (39 total, 13 thin omitted)

### Community 0 - "test_model_and_api.py"
Cohesion: 0.09
Nodes (11): get_settings(), Settings, configure_logging(), create_app(), lifespan(), DataService, _df_records(), _feature_mix_shares() (+3 more)

### Community 1 - "AppShell.tsx"
Cohesion: 0.09
Nodes (21): LINKS, body, display, metadata, RootLayout(), viewport, AppShell(), HeaderDensity (+13 more)

### Community 2 - "NHANES-Based Diabetes Prediction Using Machine Learning"
Cohesion: 0.05
Nodes (37): 10. XGBoost Hyperparameter Tuning, 11. Classification Threshold Optimization, 12. Final Test-Set Evaluation, 13. Model Interpretability Using SHAP, 14. Model Saving and Reproducibility, 15. Repository Structure, 16. Technologies and Libraries, 17. Project Status (+29 more)

### Community 3 - "Render free Web Service setup (DiabetesInsight API)"
Cohesion: 0.06
Nodes (34): Backend hosting options, Checklist, Deploy, Docker (API), Environment, Frontend, Hugging Face Spaces (PRO only), Pieces (+26 more)

### Community 4 - "routes.py"
Cohesion: 0.12
Nodes (21): analysis_distributions(), confusion_matrix(), dataset_features(), dataset_summary(), explainability_importance(), final_metrics(), get_figure(), health() (+13 more)

### Community 5 - "project/page.tsx"
Cohesion: 0.13
Nodes (17): recharts@^3.10.1, Confusion, Explainability, Mini(), MODELS, NHANES_FILES, OBJECTIVES, Overview (+9 more)

### Community 6 - "test_model_and_api.py"
Cohesion: 0.17
Nodes (12): client(), test_confusion_matrix(), test_dataset_does_not_expose_seqn(), test_feature_order_matches_bundle(), test_health(), test_overview_metrics(), test_predict_allows_partial_missing(), test_predict_includes_local_shap() (+4 more)

### Community 7 - "app/page.tsx"
Cohesion: 0.22
Nodes (11): Comparison, DONUT, MetricView, MiniStat(), Overview, OverviewPage(), ThresholdCurve, WORKFLOW (+3 more)

### Community 8 - "frontend/package.json"
Cohesion: 0.15
Nodes (18): devDependencies, eslint@^9, eslint-config-next@15.1.0, postcss@^8, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5 (+10 more)

### Community 9 - "performance/page.tsx"
Cohesion: 0.20
Nodes (12): Comparison, Confusion, FinalMetrics, MatrixCell(), MetricMini(), METRICS, MODEL_COLORS, PastelStat() (+4 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @hookform/resolvers@^7.0.3, lucide-react@^1.70.0, next@^16.4.5, react@^19.0.0, react-dom@^19.0.0 (+8 more)

### Community 13 - "api.ts"
Cohesion: 0.36
Nodes (8): API_URL, apiGet(), apiPost(), apiUrl(), CacheEnvelope, readSessionCache(), warmApi(), writeSessionCache()

### Community 14 - "cn"
Cohesion: 0.08
Nodes (35): PredictPage(), onSubmit(), PredictResponse, Schema, ShapContribution, UNITS, AmploSelect(), AmploSelectProps (+27 more)

### Community 15 - "analysis/page.tsx"
Cohesion: 0.17
Nodes (16): Analysis, AnalysisPage(), METRIC_META, Missingness, PastelStat(), shortFeat(), Tab, Target (+8 more)

### Community 16 - "DiabetesInsight"
Cohesion: 0.15
Nodes (12): 1. Backend, 2. Frontend, 3. Tests, Deployment notes, DiabetesInsight, Environment, Folder structure, Isolation (+4 more)

### Community 17 - "eslint.config.mjs"
Cohesion: 0.22
Nodes (6): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc@^3, @eslint/eslintrc

### Community 18 - "Model Integration Guide — DiabetesInsight"
Cohesion: 0.25
Nodes (7): Bundle contents, Critical encoding note, Inference steps, Model Integration Guide — DiabetesInsight, Preprocessing (from fitted pipeline), Security, Source artifacts (read-only)

### Community 20 - "keepalive.yml"
Cohesion: 0.17
Nodes (11): jobs, ping, name, on, schedule, workflow_dispatch, runs-on, steps (+3 more)

### Community 21 - "scripts"
Cohesion: 0.25
Nodes (7): name, private, scripts, dev, dev:backend, dev:frontend, test:backend

### Community 22 - "DiabetesInsight Backend"
Cohesion: 0.33
Nodes (5): DiabetesInsight Backend, Model artifact, Run, Setup, Tests

### Community 23 - "DiabetesInsight API (Hugging Face Space)"
Cohesion: 0.33
Nodes (5): DiabetesInsight API (Hugging Face Space), Environment / secrets, Frontend wiring, Health check, Space files

### Community 24 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 25 - "DiabetesInsight Enhancement Plan"
Cohesion: 0.50
Nodes (3): DiabetesInsight Enhancement Plan, Implemented in this pass, Later backlog

### Community 37 - "react"
Cohesion: 0.20
Nodes (4): nextConfig, STEPS, next, react

### Community 38 - "route.ts"
Cohesion: 0.36
Nodes (6): BACKEND_URL, Ctx, GET(), POST(), proxy(), upstreamUrl()

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `performance/page.tsx`, `project/page.tsx`, `AppShell.tsx`, `analysis/page.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `test_model_and_api.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08552188552188553 - nodes in this community are weakly interconnected._
- **Why does `next` connect `react` to `AppShell.tsx`, `project/page.tsx`, `route.ts`, `app/page.tsx`, `frontend/package.json`, `dependencies`, `cn`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `AppShell.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0928030303030303 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `AppShell.tsx`, `project/page.tsx`, `app/page.tsx`, `frontend/package.json`, `performance/page.tsx`, `dependencies`, `cn`, `analysis/page.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `NHANES-Based Diabetes Prediction Using Machine Learning` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `Render free Web Service setup (DiabetesInsight API)` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._