# NHANES-Based Diabetes Prediction Using Machine Learning

**Course:** CSCI 6970 – MS Course Project  
**Project Domain:** Data Science | Machine Learning | Healthcare Analytics  
**Dataset:** National Health and Nutrition Examination Survey (NHANES), 2021–2023  
**Programming Language:** Python  
**Environment:** Jupyter Notebook

---

## 1. Project Overview

Diabetes is a major public health concern that requires effective approaches for understanding associated health and lifestyle factors. Machine learning provides opportunities to analyze demographic, socioeconomic, behavioral, and clinical measurements to identify patterns associated with diabetes.

This project develops and evaluates multiple machine learning classification models to predict **self-reported diagnosed diabetes** using data from the National Health and Nutrition Examination Survey (NHANES) 2021–2023.

The study investigates relationships between diabetes status and demographic characteristics, body measurements, blood pressure, physical activity, smoking habits, and alcohol consumption.

The project follows a complete data science workflow, including dataset integration, data cleaning, missingness analysis, exploratory data analysis, preprocessing, model development, hyperparameter tuning, evaluation, and model interpretation.

> **Important:** The target represents self-reported diagnosed diabetes. The model is developed for academic research and is not a clinical diagnostic or medical screening tool.

## 2. Project Objectives

The main objectives are:

- Integrate relevant NHANES datasets into a unified analytical dataset.
- Perform data cleaning, validation, and missingness analysis.
- Investigate demographic, lifestyle, and health-related patterns through Exploratory Data Analysis (EDA).
- Develop preprocessing pipelines for numerical, categorical, and ordinal variables.
- Implement and compare multiple machine learning classification algorithms.
- Evaluate model performance using metrics appropriate for imbalanced classification.
- Optimize XGBoost hyperparameters and classification threshold.
- Interpret model predictions using feature importance and SHAP.
- Save the final trained model for future use.

## 3. Dataset Description

This project uses the National Health and Nutrition Examination Survey (NHANES) August 2021–August 2023 data.

NHANES is conducted by the National Center for Health Statistics (NCHS), part of the Centers for Disease Control and Prevention (CDC).

The following datasets were integrated using the participant identifier `SEQN`.

| Dataset | Description |
|---|---|
| DEMO_L | Demographic information |
| DIQ_L | Diabetes questionnaire |
| BMX_L | Body measurements |
| BPXO_L | Blood pressure examination |
| BPQ_L | Blood pressure questionnaire |
| PAQ_L | Physical activity questionnaire |
| SMQ_L | Smoking questionnaire |
| ALQ_L | Alcohol use questionnaire |

### Initial dataset dimensions

- **Participants:** 7,536
- **Variables:** 69

### Final modeling dataset

- **Observations:** 7,536
- **Predictor variables:** 51
- **Target variable:** 1

### Target Variable

The target variable `DIABETES` was derived from NHANES variable `DIQ010`.

| DIQ010 Response | Description | Target |
|---|---|---|
| 1 | Yes | 1 |
| 2 | No | 0 |
| 3 | Borderline | Excluded |
| 7 / 9 or missing | Refused / Don't know / Missing | Excluded |

The target identifies participants who self-reported a previous diabetes diagnosis.

## 4. Project Methodology

The project follows these stages:

1. Dataset collection and integration.
2. Data cleaning and validation.
3. Missingness and questionnaire eligibility analysis.
4. Exploratory Data Analysis.
5. Feature classification and preprocessing.
6. Stratified training and testing split.
7. Machine learning model development.
8. Cross-validation and model comparison.
9. Hyperparameter optimization.
10. Classification threshold optimization.
11. Final model evaluation.
12. Feature importance and SHAP interpretation.
13. Model saving and validation.

## 5. Data Cleaning and Missingness Analysis

Data cleaning was performed to improve data quality and consistency before model development.

Key activities included:

- Removing empty and constant columns.
- Removing temporary and non-modeling variables.
- Converting SAS missing-value representations to appropriate missing values.
- Identifying and handling NHANES special response codes.
- Reviewing questionnaire eligibility and skip patterns.
- Validating participant identifiers and dataset dimensions.

### Missingness Analysis

The 51 predictor variables were classified according to their missing-value percentages.

| Missingness Category | Number of Features |
|---|---:|
| No missing values | 8 |
| Low (less than 5%) | 9 |
| Moderate (5–less than 30%) | 17 |
| High (30–less than 60%) | 7 |
| Very high (60% or more) | 10 |

Structural missingness, questionnaire skip-pattern missingness, and genuine nonresponse were reviewed separately.

No imputation was performed during the initial data-cleaning stage. Missing-value imputation was subsequently incorporated into the machine learning preprocessing pipelines.

## 6. Exploratory Data Analysis (EDA)

EDA was conducted to understand the target distribution, predictor characteristics, and relationships among variables.

### Target Distribution

| Diabetes Status | Participants | Percentage |
|---|---:|---:|
| No Diabetes | 6,466 | 85.8% |
| Diabetes | 1,070 | 14.2% |
| **Total** | **7,536** | **100%** |

The dataset demonstrates class imbalance, with approximately 14.2% of participants belonging to the diabetes class.

### Selected Observations

| Variable | No Diabetes Mean | Diabetes Mean |
|---|---:|---:|
| Age | 51.64 | 63.61 |
| BMI | 29.19 | 32.95 |
| Weight (kg) | 81.71 | 91.07 |
| Income-to-Poverty Ratio | 3.01 | 2.54 |
| Household Size | 2.60 | 2.39 |

These observations describe associations within the dataset and do not establish causal relationships.

### EDA Activities

- Numerical feature descriptive statistics.
- Categorical and ordinal feature distributions.
- Correlation matrix and heatmap analysis.
- Numerical feature comparisons by diabetes status.
- Identification of highly correlated predictors.
- Investigation of missingness patterns.

## 7. Data Preprocessing

The modeling dataset contains 51 predictors classified into three feature groups.

| Feature Type | Number of Features |
|---|---:|
| Numerical | 25 |
| Categorical | 20 |
| Ordinal | 6 |
| **Total** | **51** |

### Preprocessing Techniques

**Numerical features**
- Median imputation.
- StandardScaler normalization.

**Categorical features**
- Most-frequent imputation.
- One-hot encoding.
- Handling previously unseen categories.

**Ordinal features**
- Most-frequent imputation.
- StandardScaler normalization.

### Train-Test Split

The dataset was divided using stratified sampling.

| Dataset | Observations |
|---|---:|
| Training | 6,028 |
| Testing | 1,508 |
| **Total** | **7,536** |

Configuration:

- Test size: 20%.
- Training size: 80%.
- Random state: 42.
- Stratification: Enabled.

The preprocessing pipeline was fitted on training data to avoid data leakage.

## 8. Machine Learning Models

Six classification algorithms were implemented and evaluated:

1. Logistic Regression.
2. Random Forest Classifier.
3. Gradient Boosting Classifier.
4. Support Vector Machine (SVM).
5. Decision Tree Classifier.
6. XGBoost Classifier.

### Model Evaluation Strategy

Five-fold Stratified Cross-Validation was used for model comparison.

The evaluation metrics included:

- **Accuracy:** Overall proportion of correct predictions.
- **Precision:** Proportion of predicted diabetes cases that are actual diabetes cases.
- **Recall:** Proportion of actual diabetes cases correctly identified.
- **F1-score:** Harmonic mean of precision and recall.
- **ROC-AUC:** Ability of the model to distinguish between the two classes.

## 9. Cross-Validation Model Comparison

The following table presents the baseline five-fold cross-validation results.

| Model | Accuracy | Precision | Recall | F1-score | ROC-AUC |
|---|---:|---:|---:|---:|---:|
| Logistic Regression (SAGA) | 77.34% | 36.25% | 78.27% | 49.53% | 85.67% |
| Random Forest | 86.61% | 55.25% | 30.73% | 39.45% | 84.85% |
| Gradient Boosting | 86.98% | 59.36% | 26.05% | 36.20% | 85.56% |
| SVM | 79.78% | 38.62% | 71.73% | 50.20% | 84.19% |
| Decision Tree | 71.90% | 29.96% | 73.14% | 42.48% | 75.85% |
| XGBoost | 79.38% | 38.41% | 74.65% | 50.71% | 85.75% |

### Preliminary Findings

- Logistic Regression achieved the highest recall among the baseline models.
- Gradient Boosting achieved the highest accuracy and precision.
- XGBoost achieved the highest baseline F1-score and ROC-AUC.
- Random Forest achieved high accuracy but comparatively low recall.
- Decision Tree demonstrated the lowest ROC-AUC.

## 10. XGBoost Hyperparameter Tuning

XGBoost was selected for further optimization.

RandomizedSearchCV was performed using 20 candidate configurations and five-fold cross-validation, resulting in 100 model fits.

### Best Hyperparameters

| Parameter | Selected Value |
|---|---:|
| Subsample | 0.7 |
| Reg_lambda | 1 |
| n_estimators | 400 |
| min_child_weight | 5 |
| max_depth | 5 |
| learning_rate | 0.03 |
| colsample_bytree | 1.0 |

The best cross-validation F1-score obtained during hyperparameter tuning was **51.29%**.

### Tuned XGBoost Cross-Validation Results

| Metric | Result |
|---|---:|
| Accuracy | 82.27% |
| Precision | 42.12% |
| Recall | 65.65% |
| F1-score | 51.29% |
| ROC-AUC | 85.36% |

## 11. Classification Threshold Optimization

The default classification threshold of 0.50 was evaluated against alternative thresholds using out-of-fold predictions generated from the training data.

A threshold of **0.60** was selected based on the highest F1-score among the tested thresholds.

| Metric | Threshold 0.50 | Threshold 0.60 |
|---|---:|---:|
| Accuracy | 80.84% | 84.08% |
| Precision | 39.32% | 45.15% |
| Recall | 64.49% | 56.54% |
| F1-score | 48.85% | 50.21% |
| ROC-AUC | 84.87% | 84.87% |

The threshold was selected using training-set out-of-fold predictions, without using test labels.

## 12. Final Test-Set Evaluation

The tuned XGBoost model was evaluated on the held-out test dataset containing 1,508 observations.

### Final Test Metrics

| Metric | Result |
|---|---:|
| Accuracy | 84.08% |
| Precision | 45.15% |
| Recall | 56.54% |
| F1-score | 50.21% |
| ROC-AUC | 84.87% |

### Confusion Matrix

| | Predicted No Diabetes | Predicted Diabetes |
|---|---:|---:|
| Actual No Diabetes | 1,147 | 147 |
| Actual Diabetes | 93 | 121 |

The model correctly identified 121 of the 214 participants with diabetes in the test set.

Although the model achieved 84.08% accuracy, its recall of 56.54% indicates that some participants with diabetes were not identified. The results should therefore be interpreted in the context of class imbalance and the intended academic use of the model.

### Evaluation Visualizations

The following figures are available in `outputs/figures/`:

- XGBoost confusion matrix.
- ROC curve.
- Precision-recall curve.
- XGBoost feature importance.
- SHAP feature importance.
- SHAP summary plot.

## 13. Model Interpretability Using SHAP

SHAP (SHapley Additive exPlanations) was used to investigate the contribution of input features to model predictions.

The analysis provides a global feature-importance perspective and helps interpret how the trained XGBoost model uses the available predictors.

The top features by mean absolute SHAP value included:

| Feature | Mean Absolute SHAP Value |
|---|---:|
| BPQ101D | 0.7165 |
| RIDAGEYR | 0.4718 |
| BPQ020 | 0.4706 |
| BMXWAIST | 0.2635 |
| RIDRETH1 | 0.2380 |
| DMDEDUC2 | 0.1954 |
| BPXOPLS1 | 0.1663 |
| BMXBMI | 0.1567 |

These values represent global feature importance, not causal effects.

## 14. Model Saving and Reproducibility

The final trained XGBoost model and its configuration bundle were saved in the `models/` directory.

| File | Description |
|---|---|
| `final_xgboost_diabetes_model.pkl` | Trained XGBoost model pipeline |
| `final_xgboost_model_bundle.pkl` | Model bundle and associated configuration |

The saved model and bundle were reloaded successfully during notebook validation.

## 15. Repository Structure

The project is organized as follows:

```text
CSCI6970/
│
├── data/
│   ├── raw/
│   └── processed/
│       ├── cleaning_checkpoints/
│       ├── nhanes_diabetes_integrated.csv
│       ├── nhanes_diabetes_cleaned.csv
│       ├── nhanes_diabetes_modeling.csv
│       └── preprocessed/
│
├── models/
│   ├── final_xgboost_diabetes_model.pkl
│   └── final_xgboost_model_bundle.pkl
│
├── notebooks/
│   ├── CSCI6970_01_Data_Collection.ipynb
│   ├── CSCI6970_02_Data_Cleaning_EDA.ipynb
│   └── CSCI6970_03_Machine_Learning.ipynb
│
├── outputs/
│   ├── figures/
│   ├── tables/
│   └── models/
│
├── scripts/
│
├── .gitignore
└── README.md
```

**Note:** Raw and processed datasets are excluded from Git tracking and must be obtained or generated locally before running the complete workflow. The local backup notebook is not part of the tracked repository.

## 16. Technologies and Libraries

| Technology | Purpose |
|---|---|
| Python | Programming language |
| Jupyter Notebook | Interactive development |
| Pandas | Data manipulation |
| NumPy | Numerical computation |
| Matplotlib | Data visualization |
| Seaborn | Statistical visualization |
| Scikit-learn | Machine learning and preprocessing |
| XGBoost | Gradient boosting classification |
| SHAP | Model interpretation |

## 17. Project Status

| Project Component | Status |
|---|---|
| Dataset Collection and Integration | Completed |
| Data Cleaning and Validation | Completed |
| Missingness Analysis | Completed |
| Exploratory Data Analysis | Completed |
| Data Preprocessing | Completed |
| Machine Learning Model Development | Completed |
| Cross-Validation and Model Comparison | Completed |
| XGBoost Hyperparameter Tuning | Completed |
| Threshold Optimization | Completed |
| Final Test-Set Evaluation | Completed |
| SHAP Model Interpretation | Completed |
| Model Saving and Reloading | Completed |
| Final Research Report | In Progress |

## 18. Limitations

The project has several limitations:

- The target variable is based on self-reported diagnosed diabetes.
- The dataset contains class imbalance.
- Several predictors have substantial missingness.
- Questionnaire eligibility and skip patterns complicate missing-value treatment.
- The model may not generalize to other populations or survey periods.
- Predictive associations should not be interpreted as causal relationships.
- The model is intended for academic research and is not a substitute for clinical diagnosis.

## 19. Dataset and References

**Dataset Source:**

National Health and Nutrition Examination Survey (NHANES), August 2021–August 2023.

- NHANES Official Website: https://www.cdc.gov/nchs/nhanes/
- NHANES Data Documentation: https://wwwn.cdc.gov/nchs/nhanes/

**Organization:**

National Center for Health Statistics (NCHS)  
Centers for Disease Control and Prevention (CDC)

## 20. Disclaimer

This project is conducted for academic and research purposes as part of the CSCI6970 MS Course Project.

The machine learning models developed in this study are experimental and are not intended to provide medical diagnoses, treatment recommendations, or clinical decisions.

---

**Project:** NHANES-Based Diabetes Prediction Using Machine Learning  
**Course:** CSCI 6970 – MS Course Project  
**Domain:** Healthcare Analytics and Machine Learning
