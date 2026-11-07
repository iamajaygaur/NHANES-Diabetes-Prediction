# Graph Report - CSCI6970_Dashboard  (2026-11-07)

## Corpus Check
- 69 files · ~28,694 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 137 file(s) not represented in the graph (top: .csv 120, (none) 7, .pkl 3)
- WARNING: 137 of 233 files seen (59%) have no supported extractor and are missing from this graph entirely. It may look complete while representing only part of the codebase.

## Summary
- 499 nodes · 876 edges · 37 communities (25 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3170577e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_model_and_api.py
- AppShell.tsx
- NHANES-Based Diabetes Prediction Using Machine Learning
- Render free Web Service setup (DiabetesInsight API)
- routes.py
- project/page.tsx
- DataService
- cn
- frontend/package.json
- performance/page.tsx
- compilerOptions
- dependencies
- ModelService
- analysis/page.tsx
- predict/page.tsx
- dataset/page.tsx
- DiabetesInsight
- eslint.config.mjs
- Model Integration Guide — DiabetesInsight
- ShapImpactChart.tsx
- card.tsx
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 44 edges
2. `NHANES-Based Diabetes Prediction Using Machine Learning` - 21 edges
3. `PredictPage()` - 18 edges
4. `lucide-react` - 16 edges
5. `compilerOptions` - 16 edges
6. `DataService` - 15 edges
7. `ModelService` - 14 edges
8. `react` - 14 edges
9. `apiGet()` - 14 edges
10. `get_settings()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `CardHeader()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/card.tsx → frontend/src/lib/utils.ts
- `CardTitle()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/card.tsx → frontend/src/lib/utils.ts
- `CardDescription()` --calls--> `cn()`  [EXTRACTED]
  frontend/src/components/ui/card.tsx → frontend/src/lib/utils.ts
- `health()` --uses--> `HealthResponse`  [INFERRED]
  backend/app/api/routes.py → backend/app/schemas/predict.py
- `predict()` --uses--> `PredictRequest`  [INFERRED]
  backend/app/api/routes.py → backend/app/schemas/predict.py

## Import Cycles
- None detected.

## Communities (37 total, 12 thin omitted)

### Community 0 - "test_model_and_api.py"
Cohesion: 0.07
Nodes (18): get_settings(), Settings, configure_logging(), create_app(), lifespan(), _jsonable(), client(), test_confusion_matrix() (+10 more)

### Community 1 - "AppShell.tsx"
Cohesion: 0.08
Nodes (22): nextConfig, LINKS, body, display, metadata, RootLayout(), AppShell(), HeaderDensity (+14 more)

### Community 2 - "NHANES-Based Diabetes Prediction Using Machine Learning"
Cohesion: 0.05
Nodes (37): 10. XGBoost Hyperparameter Tuning, 11. Classification Threshold Optimization, 12. Final Test-Set Evaluation, 13. Model Interpretability Using SHAP, 14. Model Saving and Reproducibility, 15. Repository Structure, 16. Technologies and Libraries, 17. Project Status (+29 more)

### Community 3 - "Render free Web Service setup (DiabetesInsight API)"
Cohesion: 0.06
Nodes (33): Backend hosting options, Checklist, Deploy, Docker (API), Environment, Frontend, Hugging Face Spaces (PRO only), Pieces (+25 more)

### Community 4 - "routes.py"
Cohesion: 0.12
Nodes (21): analysis_distributions(), confusion_matrix(), dataset_features(), dataset_summary(), explainability_importance(), final_metrics(), get_figure(), health() (+13 more)

### Community 5 - "project/page.tsx"
Cohesion: 0.11
Nodes (21): Comparison, DONUT, MetricView, MiniStat(), Overview, OverviewPage(), ThresholdCurve, WORKFLOW (+13 more)

### Community 6 - "DataService"
Cohesion: 0.22
Nodes (5): DataService, _df_records(), _feature_mix_shares(), _sanitize_json(), _strip_transformed_feature_name()

### Community 7 - "cn"
Cohesion: 0.17
Nodes (14): PackCard(), PackCardProps, PackRow(), PackRowProps, HeroLink(), PageHero(), FractionRing(), ProgressRing() (+6 more)

### Community 8 - "frontend/package.json"
Cohesion: 0.15
Nodes (18): devDependencies, eslint@^9, eslint-config-next@15.1.0, postcss@^8, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5 (+10 more)

### Community 9 - "performance/page.tsx"
Cohesion: 0.18
Nodes (16): Comparison, Confusion, FinalMetrics, MatrixCell(), MetricMini(), METRICS, MODEL_COLORS, PastelStat() (+8 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @hookform/resolvers@^7.0.3, lucide-react@^1.70.0, next@^16.4.5, react@^19.0.0, react-dom@^19.0.0 (+10 more)

### Community 13 - "analysis/page.tsx"
Cohesion: 0.18
Nodes (14): Analysis, AnalysisPage(), METRIC_META, Missingness, PastelStat(), shortFeat(), Tab, Target (+6 more)

### Community 14 - "predict/page.tsx"
Cohesion: 0.18
Nodes (11): PredictPage(), onSubmit(), PredictResponse, Schema, ShapContribution, UNITS, COMMON_VALUE_LABELS, featureLabel() (+3 more)

### Community 15 - "dataset/page.tsx"
Cohesion: 0.23
Nodes (9): DatasetPage(), Feature, Meta(), Summary, TYPE_PACKS, ErrorState(), LoadingState(), FEATURE_PACKS (+1 more)

### Community 16 - "DiabetesInsight"
Cohesion: 0.15
Nodes (12): 1. Backend, 2. Frontend, 3. Tests, Deployment notes, DiabetesInsight, Environment, Folder structure, Isolation (+4 more)

### Community 17 - "eslint.config.mjs"
Cohesion: 0.22
Nodes (6): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc@^3, @eslint/eslintrc

### Community 18 - "Model Integration Guide — DiabetesInsight"
Cohesion: 0.25
Nodes (7): Bundle contents, Critical encoding note, Inference steps, Model Integration Guide — DiabetesInsight, Preprocessing (from fitted pipeline), Security, Source artifacts (read-only)

### Community 19 - "ShapImpactChart.tsx"
Cohesion: 0.36
Nodes (7): recharts@^3.10.1, ChartRow, cleanName(), ShapImpactChart(), ShapRow, shortLabel(), recharts

### Community 20 - "card.tsx"
Cohesion: 0.39
Nodes (6): KpiCard(), Card(), CardContent(), CardDescription(), CardHeader(), CardTitle()

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

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `AppShell.tsx`, `project/page.tsx`, `performance/page.tsx`, `analysis/page.tsx`, `predict/page.tsx`, `dataset/page.tsx`, `ShapImpactChart.tsx`, `card.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `test_model_and_api.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07372549019607844 - nodes in this community are weakly interconnected._
- **Why does `react` connect `analysis/page.tsx` to `AppShell.tsx`, `project/page.tsx`, `cn`, `frontend/package.json`, `performance/page.tsx`, `dependencies`, `predict/page.tsx`, `dataset/page.tsx`, `ShapImpactChart.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `AppShell.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `analysis/page.tsx` to `AppShell.tsx`, `project/page.tsx`, `cn`, `frontend/package.json`, `performance/page.tsx`, `dependencies`, `predict/page.tsx`, `dataset/page.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `NHANES-Based Diabetes Prediction Using Machine Learning` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `Render free Web Service setup (DiabetesInsight API)` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._