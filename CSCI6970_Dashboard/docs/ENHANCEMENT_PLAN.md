# DiabetesInsight Enhancement Plan

## Implemented in this pass

1. **Local SHAP on Prediction Studio**
   - `POST /api/predict` accepts `include_shap`
   - Returns top local contributions for the synthetic prediction
   - UI chart + table on Prediction Studio

2. **Threshold explorer**
   - `GET /api/models/threshold-curve`
   - Interactive slider + train OOF curve + held-out 0.50 vs 0.60 table
   - Available under Model Performance → Threshold explorer

3. **Guided demo walkthrough**
   - Floating “Demo tour” control
   - Steps: Overview → Performance → Predict → Explainability

4. **Loading skeletons**
   - Dashboard loading state now shows KPI/chart placeholders

## Later backlog

- NHANES codebook labels in Dataset Explorer
- Export PDF/PNG summary pack
- Deploy (Vercel + API host)
- Accessibility audit
