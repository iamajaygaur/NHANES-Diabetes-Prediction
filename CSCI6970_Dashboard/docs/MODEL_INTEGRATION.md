# Model Integration Guide — DiabetesInsight

## Source artifacts (read-only)

| Artifact | Location |
|---|---|
| Research project | `../CSCI6970/` (never modify) |
| Reference copy | `reference/` |
| Runtime bundle | `backend/models/final_xgboost_model_bundle.pkl` |

## Bundle contents

Verified with `joblib.load`:

```python
{
  "model": sklearn.pipeline.Pipeline([
      ("preprocessor", ColumnTransformer(...)),
      ("classifier", XGBClassifier(...)),
  ]),
  "threshold": 0.6,
  "feature_names": [...],  # 51 raw features, exact order
  "model_name": "Tuned XGBoost",
  "target": "DIABETES",
  "random_state": 42,
}
```

The bundle **includes** the fitted preprocessing pipeline. Do not recreate preprocessing.

## Preprocessing (from fitted pipeline)

| Group | Count | Imputation | Transform |
|---|---:|---|---|
| Numerical | 25 | median | StandardScaler |
| Categorical | 20 | most_frequent | OneHotEncoder(handle_unknown="ignore") |
| Ordinal | 6 | most_frequent | StandardScaler |

Transformed feature count: **87**.

## Inference steps

1. Validate incoming keys against `feature_names`.
2. Build a one-row `pandas.DataFrame` in exact `feature_names` order.
3. Preserve dtypes; allow `null` for missing values (pipeline imputes).
4. `probability = model.predict_proba(X)[0, 1]`.
5. `predicted_class = int(probability >= 0.6)`.
6. Return class, probability, threshold, model name.

## Critical encoding note

`PAD790U` and `PAD810U` were serialized with Python `bytes` string representations
(e.g. `"b'W'"`, `"b'D'"`, `"b'M'"`, `"b'Y'"`, `"b''"`). Form options and API
values must use these exact strings.

## Security

- Load the trusted local pickle once at startup.
- Never deserialize client-uploaded model files.
- Never expose `SEQN` or raw individual health rows to the browser.
