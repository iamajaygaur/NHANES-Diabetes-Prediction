# NHANES-Based Diabetes Prediction Using Machine Learning

**Course:** CSCI 6970 -- MS Course Project  

**Project Domain:** Data Science | Machine Learning |
Healthcare Analytics  

**Dataset:** National Health and Nutrition Examination Survey
(NHANES) 2021--2023  

**Programming Language:** Python  

**Environment:** Jupyter Notebook | macOS
## 1. Project Overview

Diabetes is a major public health concern that requires effective
approaches for risk identification and early intervention. Machine
learning provides opportunities to analyze demographic, socioeconomic,
lifestyle, and health-related factors to identify patterns associated
with diabetes.

This project aims to develop and evaluate multiple machine learning
classification models to predict self-reported diagnosed diabetes using
data from the National Health and Nutrition Examination Survey (NHANES)
2021--2023.

The study investigates how demographic characteristics, body
measurements, blood pressure, physical activity, smoking habits, and
alcohol consumption relate to diabetes status.

The project follows a systematic data science workflow, from dataset
integration and preprocessing to model development, evaluation, and
interpretation.

**Note:** The prediction target represents self-reported
diagnosed diabetes and should not be interpreted as an independent
clinical diagnosis or medical screening tool.

## 2. Project Objectives

The primary objectives are:

- Integrate relevant NHANES datasets into a unified analytical dataset.

- Perform data cleaning, validation, and missingness analysis.

- Investigate demographic, lifestyle, and health-related patterns
through Exploratory Data Analysis (EDA).

- Develop appropriate preprocessing pipelines for numerical,
categorical, and ordinal variables.

- Implement and compare multiple machine learning classification
algorithms.

- Evaluate model performance using metrics suitable for imbalanced
classification.

- Identify important predictors associated with self-reported diabetes.

- Select and evaluate an appropriate final predictive model.

## 3. Dataset Description

This project uses data from the **National Health and Nutrition
Examination Survey (NHANES) 2021--2023**.

NHANES is a program conducted by the National Center for Health
Statistics (NCHS), part of the Centers for Disease Control and
Prevention (CDC).

The following datasets were integrated using the participant identifier
`SEQN`.

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

**Initial dataset dimensions:**

- 7,536 participants

- 69 variables

**Final modeling dataset:**

- 7,536 observations

- 51 predictor variables

- 1 target variable

### Target Variable

The target variable `DIABETES` was derived from NHANES variable
`DIQ010`.

| DIQ010 | Description | Target |

|---|---|---|

| 1 | Yes | 1 |

| 2 | No | 0 |

| Borderline | Excluded | Missing |

| Refused / Don't know | Excluded | Missing |

The target identifies participants who self-reported a previous diabetes
diagnosis.

## 4. Project Methodology

The project follows the following machine learning workflow:

1. Dataset collection and integration.

2. Data cleaning and validation.

3. Missingness and eligibility analysis.

4. Exploratory Data Analysis.

5. Feature classification and preprocessing.

6. Stratified train-test splitting.

7. Machine learning model development.

8. Cross-validation and model comparison.

9. Hyperparameter optimization.

10. Classification threshold optimization.

11. Final model evaluation.

12. Model interpretation and reporting.

## 5. Data Cleaning and Missingness Analysis

Data cleaning was performed to improve dataset quality and ensure
consistency before model development.

Key activities included:

- Removing empty and constant columns.

- Removing temporary and non-modeling variables.

- Identifying and handling NHANES special response codes.

- Converting SAS missing-value representations to appropriate missing
values.

- Reviewing questionnaire eligibility and skip patterns.

- Validating participant identifiers and dataset dimensions.

### Missingness Analysis

The 51 predictor variables were classified according to their
missing-value percentages.

| Missingness Category | Number of Features |

|---|---:|

| No missing values | 8 |

| Low (less than 5%) | 9 |

| Moderate (5--30%) | 17 |

| High (30--60%) | 7 |

| Very high (60% or more) | 10 |

Structural missingness, skip-pattern missingness, and genuine
nonresponse were reviewed separately.

No imputation was performed during the initial data-cleaning stage.

## 6. Exploratory Data Analysis (EDA)

EDA was conducted to understand the distribution of the target variable,
predictor characteristics, and relationships among variables.

### Target Distribution

| Diabetes Status | Participants | Percentage |

|---|---:|---:|

| No Diabetes | 6,466 | 85.8% |

| Diabetes | 1,070 | 14.2% |

| **Total** | **7,536** | **100%** |

The dataset demonstrates class imbalance, with approximately 14.2% of
participants belonging to the diabetes class.

### Key EDA Activities

- Numerical feature descriptive statistics.

- Categorical and ordinal feature distributions.

- Correlation matrix and heatmap analysis.

- Numerical feature comparisons by diabetes status.

- Identification of highly correlated predictors.

- Investigation of missingness patterns.

### Selected Observations

| Variable | No Diabetes Mean | Diabetes Mean |

|---|---:|---:|

| Age | 51.64 | 63.61 |

| BMI | 29.19 | 32.95 |

| Weight (kg) | 81.71 | 91.07 |

| Income-to-Poverty Ratio | 3.01 | 2.54 |

| Household Size | 2.60 | 2.39 |

These observations describe associations within the dataset and do not
establish causal relationships.

## 7. Data Preprocessing

The modeling dataset contains 51 predictors, classified into three
feature groups.

| Feature Type | Number of Features |

|---|---:|

| Numerical | 25 |

| Categorical | 20 |

| Ordinal | 6 |

| **Total** | **51** |

### Preprocessing Techniques

**Numerical Features**

- Median imputation.

- StandardScaler normalization.

**Categorical Features**

- Most-frequent imputation.

- One-hot encoding.

- Handling previously unseen categories.

**Ordinal Features**

- Most-frequent imputation.

- StandardScaler normalization.

### Train-Test Split

The dataset was divided using stratified sampling.

| Dataset | Observations |

|---|---:|

| Training | 6,028 |

| Testing | 1,508 |

| Total | 7,536 |

Configuration:

- Test size: 20%

- Training size: 80%

- Random state: 42

- Stratification: Enabled

The preprocessing pipeline was fitted on training data to avoid data
leakage.

## 8. Machine Learning Models

Multiple classification algorithms are being investigated to compare
their performance in predicting diabetes.

The implemented models include:

1. Logistic Regression

2. Random Forest Classifier

3. Gradient Boosting Classifier

4. Support Vector Machine (SVM)

5. Decision Tree Classifier

6. XGBoost Classifier (Pending)

### Model Evaluation Strategy

Five-fold Stratified Cross-Validation is used for model evaluation.

The following metrics are considered:

- **Accuracy:** Overall proportion of correct predictions.

- **Precision:** Proportion of predicted diabetes cases that
are actual diabetes cases.

- **Recall:** Proportion of actual diabetes cases correctly
identified.

- **F1-Score:** Harmonic mean of precision and recall.

- **ROC-AUC:** Ability of the model to distinguish between the
two classes.

## 9. Preliminary Model Results

The following results represent the current five-fold cross-validation
experiments.

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |

|---|---:|---:|---:|---:|---:|

| Logistic Regression (SAGA) | 77.34% | 36.25% | 78.27% | 49.53% |
**85.67%** |

| Random Forest | 86.61% | 55.25% | 30.73% | 39.45% | 84.85% |

| Gradient Boosting | **86.98%** | **59.36%** |
26.05% | 36.20% | 85.56% |

| SVM | 79.78% | 38.62% | 71.73% | **50.20%** | 84.19% |

| Decision Tree | 71.90% | 29.96% | 73.14% | 42.48% | 75.85% |

| XGBoost (baseline) | 79.38% | 38.41% | 74.65% | 50.71% | 85.75%
|

### Preliminary Findings

- Logistic Regression achieved the highest ROC-AUC and recall.

- SVM achieved the highest F1-score among the evaluated models.

- Gradient Boosting achieved the highest accuracy and precision.

- Random Forest achieved high accuracy but comparatively low recall.

- Decision Tree demonstrated the lowest ROC-AUC.

**Important:** These are preliminary cross-validation results.
No final model has been selected, and final test-set evaluation is
pending.

## 10. Tuned XGBoost: Final Test-Set Evaluation

XGBoost was selected for hyperparameter optimization using
RandomizedSearchCV with five-fold stratified cross-validation. The best
configuration achieved a cross-validation F1-score of approximately
0.5129 during tuning.

The classification threshold was selected as 0.60 using out-of-fold
predictions from the training data. The held-out test set was not used
to select this threshold.

Final independent test-set results:

  Metric                Test Result
  Accuracy                   84.08%
Precision                  45.15%
Recall                     56.54%
F1-score                   50.21%
ROC-AUC                    84.87%
Average Precision          49.93%

Confusion matrix at threshold 0.60:
                     Predicted No Diabetes   Predicted Diabetes

  Actual No Diabetes                     1,147                  147
Actual Diabetes                           93                  121

The final test set contained 1,508 observations. Of the 214 participants
in the positive class, 121 were correctly identified by the model.

These test results are distinct from the cross-validation results in
Section 9. The threshold was chosen using training-set out-of-fold
predictions, while final metrics were calculated on the independent test
set.
SHAP-Based Model Interpretation
SHAP analysis was performed on a sample of 300 test observations after
preprocessing. The leading features by mean absolute SHAP value
included:
1. categorical__BPQ101D_1.0
2. numerical__RIDAGEYR
3. categorical__BPQ020_1.0
4. numerical__BMXWAIST
5. categorical__RIDRETH1_3.0
Mean absolute SHAP values indicate the magnitude of a feature's
contribution to model output, not the direction of its effect or a
causal relationship. The precise questionnaire meaning and coding of
BPQ101D should be checked against NHANES documentation before
assigning a substantive interpretation.
Saved Model Artifacts
The fitted preprocessing and XGBoost pipeline, and a bundle containing
the pipeline, threshold, and feature information, were saved under
models/:
- final_xgboost_diabetes_model.pkl
- final_xgboost_model_bundle.pkl
The model bundle was reloaded and verified. It contains the selected
threshold of 0.60 and 51 input feature names.
## 11. Repository Structure

The repository is organized to separate datasets, notebooks, processed
files, experimental results, and documentation.

```text

CSCI6970-Diabetes-Prediction/

│

├── data/

│ ├── raw/

│ │ └── NHANES source datasets

│ │

│ └── processed/

│ ├── nhanes_diabetes_integrated.csv

│ ├── nhanes_diabetes_cleaned.csv

│ ├── nhanes_diabetes_modeling.csv

│ │

│ └── preprocessed/

│ ├── X_train_preprocessed.npy

│ ├── X_test_preprocessed.npy

│ ├── y_train.npy

│ ├── y_test.npy

│ └── feature_names.npy

│

├── notebooks/

│ ├── CSCI6970_01_Data_Integration.ipynb

│ ├── CSCI6970_02_Data_Cleaning.ipynb

│ └── CSCI6970_03_Machine_Learning.ipynb

│

├── outputs/

│ ├── figures/

│ └── tables/

│

├── README.md

└── requirements.txt

```

*The structure above represents the intended repository organization.
Adjust notebook filenames and directories to match the files actually
committed to GitHub.*

## 12. Technologies and Libraries

The project uses the following technologies:

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

## 13. Current Project Progress

| Project Component | Status |

|---|---|

| Dataset Integration | Completed |

| Data Cleaning and Validation | Completed |

| Missingness Analysis | Completed |

| Exploratory Data Analysis | Completed |

| Data Preprocessing | Completed |

| Logistic Regression | Completed |

| Random Forest | Completed |

| Gradient Boosting | Completed |

| Support Vector Machine | Completed |

| Decision Tree | Completed |

| XGBoost | Completed |

| Combined Model Comparison | Completed |

| Hyperparameter Tuning | Completed |

| Threshold Optimization | Completed |

| Final Model Selection | Completed |

| Test-Set Evaluation | Completed |

| Model Interpretation (SHAP) | Completed |

| Final Research Report | In progress |

## 14. Future Work

The remaining work focuses on improving model performance, validating
results, and completing the research study.

Planned activities include:

1. Complete XGBoost implementation and evaluation.

2. Consolidate all cross-validation results.

3. Perform hyperparameter tuning on promising models.

4. Investigate classification thresholds to improve the
precision-recall trade-off.

5. Select the final model using appropriate evaluation criteria.

6. Evaluate the selected model on the untouched test dataset.

7. Generate confusion matrices, ROC curves, and precision-recall
curves.

8. Perform feature importance and SHAP-based interpretation where
feasible.

9. Document limitations and research findings.

10. Complete the final CSCI6970 research report.

## 15. Limitations

The current study has several limitations:

- The target variable is based on self-reported diagnosed diabetes.

- The dataset contains class imbalance.

- Several predictors have substantial missingness.

- Questionnaire eligibility and skip patterns complicate missing-value
treatment.

- Cross-validation results are preliminary and do not represent final
test performance.

- Predictive associations should not be interpreted as causal
relationships.

- The model is intended for academic research and is not a substitute
for clinical diagnosis.

## 16. Dataset and References

**Dataset Source:**

National Health and Nutrition Examination Survey (NHANES), 2021--2023.

- NHANES Official Website: https://www.cdc.gov/nchs/nhanes/

- NHANES Data Documentation: https://wwwn.cdc.gov/nchs/nhanes/

**Organization:**

National Center for Health Statistics (NCHS)  

Centers for Disease Control and Prevention (CDC)

## 17. Disclaimer

This project is conducted for academic and research purposes as part of
the CSCI6970 MS Course Project.

The machine learning models developed in this study are experimental and
are not intended to provide medical diagnoses, treatment
recommendations, or clinical decisions.
**Project:** NHANES-Based Diabetes Prediction Using Machine
Learning  

**Course:** CSCI6970 -- MS Course Project  

**Domain:** Healthcare Analytics and Machine Learning