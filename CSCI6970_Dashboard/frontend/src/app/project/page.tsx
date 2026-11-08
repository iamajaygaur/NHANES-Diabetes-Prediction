"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  Beaker,
  BookOpen,
  BrainCircuit,
  Database,
  ExternalLink,
  FlaskConical,
  Layers,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { ShapImpactChart } from "@/components/ShapImpactChart";
import { ErrorState, LoadingState } from "@/components/States";
import { apiGet } from "@/lib/api";
import { cn, num, pct } from "@/lib/utils";

type Overview = {
  kpis: {
    participants: number;
    diabetes_cases: number;
    non_diabetes_cases: number;
    prevalence_pct: number;
    predictor_features: number;
    threshold: number;
  };
  final_test_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    threshold: number;
  };
  project: {
    research_title: string;
    dataset: string;
    source: string;
  };
};

type Explainability = {
  top_shap: { Feature: string; Mean_ABS_SHAP: number }[];
  highlighted_features: {
    feature: string;
    mean_abs_shap: number;
    label?: string;
  }[];
  disclaimer: string;
};

type Confusion = {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
};

type Tab = "brief" | "methods" | "explain" | "limits";

const OBJECTIVES = [
  {
    title: "Integrate NHANES",
    detail: "Join eight CDC cycle files on SEQN into one analytical table.",
    icon: Database,
  },
  {
    title: "Clean & explore",
    detail: "Missingness review, skip patterns, and association checks.",
    icon: FlaskConical,
  },
  {
    title: "Compare classifiers",
    detail: "Six models under stratified 5-fold cross-validation.",
    icon: Beaker,
  },
  {
    title: "Tune XGBoost",
    detail: "Hyperparameter search + threshold 0.60 locked on OOF F1.",
    icon: BrainCircuit,
  },
  {
    title: "Explain with SHAP",
    detail: "Global attributions from the saved research outputs.",
    icon: Sparkles,
  },
];

const NHANES_FILES = [
  { code: "DEMO_L", label: "Demographics" },
  { code: "DIQ_L", label: "Diabetes questionnaire" },
  { code: "BMX_L", label: "Body measures" },
  { code: "BPXO_L", label: "Blood pressure" },
  { code: "BPQ_L", label: "BP questionnaire" },
  { code: "PAQ_L", label: "Physical activity" },
  { code: "SMQ_L", label: "Smoking" },
  { code: "ALQ_L", label: "Alcohol" },
];

const MODELS = [
  "Logistic Regression (SAGA)",
  "Random Forest",
  "Gradient Boosting",
  "SVM",
  "Decision Tree",
  "XGBoost",
];

const PREPROCESS = [
  { title: "Numerical", body: "Median imputation + StandardScaler" },
  {
    title: "Categorical",
    body: "Most-frequent imputation + OneHotEncoder(handle_unknown='ignore')",
  },
  { title: "Ordinal", body: "Most-frequent imputation + StandardScaler" },
];

function tabFromSearch(): Tab {
  if (typeof window === "undefined") return "brief";
  const q = new URLSearchParams(window.location.search).get("tab");
  if (q === "methods" || q === "explain" || q === "limits" || q === "brief") return q;
  return "brief";
}

export default function ProjectPage() {
  const [tab, setTab] = useState<Tab>("brief");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [explain, setExplain] = useState<Explainability | null>(null);
  const [confusion, setConfusion] = useState<Confusion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTab(tabFromSearch());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ov, ex, cm] = await Promise.all([
          apiGet<Overview>("/api/overview"),
          apiGet<Explainability>("/api/explainability/importance"),
          apiGet<Confusion>("/api/models/confusion-matrix"),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setExplain(ex);
        setConfusion(cm);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Request failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function selectTab(next: Tab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.toString());
  }

  const chartData = useMemo(() => {
    if (!explain) return [];
    return explain.top_shap.slice(0, 15).map((row) => ({
      feature: row.Feature.replace(/^categorical__|^numerical__|^ordinal__/, ""),
      value: row.Mean_ABS_SHAP,
    }));
  }, [explain]);

  if (error) return <ErrorState message={error} />;
  if (!overview || !explain || !confusion) return <LoadingState />;

  const { kpis, final_test_metrics: metrics, project } = overview;

  return (
    <div className="page-stack fade-in">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h1 className="break-words font-display text-[1.55rem] font-semibold tracking-tight sm:text-[2.15rem]">
            Detailed project
          </h1>
          <p className="mt-3 text-[1.1rem] leading-relaxed text-[var(--muted)]">
            Research brief, methods, SHAP explainability, and limits for{" "}
            <span className="font-medium text-[var(--foreground)]">{project.research_title}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/performance"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Export view
          </Link>
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25"
          >
            Open predict
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="inline-flex flex-wrap rounded-full border border-[var(--border)] bg-[var(--panel)] p-1">
        {(
          [
            ["brief", "Brief"],
            ["methods", "Methods"],
            ["explain", "Explain"],
            ["limits", "Limits"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              tab === id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            {label}
            {id === "explain" ? (
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  tab === id ? "bg-white/20" : "bg-blue-600/10 text-blue-700 dark:text-blue-300",
                )}
              >
                SHAP
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <Disclaimer compact />

      {tab === "brief" ? (
        <div className="page-stack !gap-[var(--section-gap)]">
          <div className="page-grid xl:grid-cols-[1.15fr_0.85fr]">
            <article className="amplo-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--muted)]">Modeling cohort</p>
                  <p className="mt-1 font-display text-5xl font-semibold tabular-nums tracking-tight">
                    {num(kpis.participants)}
                  </p>
                  <p className="mt-2 inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {kpis.prevalence_pct}% diabetes prevalence
                  </p>
                </div>
                <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  {project.dataset}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
                <Mini label="Diabetes" value={num(kpis.diabetes_cases)} />
                <Mini label="Non-diabetes" value={num(kpis.non_diabetes_cases)} />
                <Mini label="Predictors" value={String(kpis.predictor_features)} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                    Target
                  </p>
                  <p className="mt-1 text-sm font-semibold">DIABETES</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    1 = self-reported diagnosed · 0 = otherwise
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                    Source
                  </p>
                  <p className="mt-1 text-sm font-semibold">{project.source}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Researched &amp; developed by Ajay Gaur
                  </p>
                </div>
              </div>
            </article>

            <article className="amplo-card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <h2 className="font-display text-lg font-semibold">Held-out scoreboard</h2>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Tuned XGBoost · thr {metrics.threshold.toFixed(2)} · test n=1,508
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  ["Accuracy", pct(metrics.accuracy)],
                  ["Precision", pct(metrics.precision)],
                  ["Recall", pct(metrics.recall)],
                  ["F1", pct(metrics.f1_score)],
                  ["ROC-AUC", pct(metrics.roc_auc)],
                  ["Thr", metrics.threshold.toFixed(2)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-3"
                  >
                    <p className="text-[11px] text-[var(--muted)]">{label}</p>
                    <p className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-blue-600 px-4 py-3 text-white">
                <p className="text-xs text-blue-100">Confusion [[TN, FP], [FN, TP]]</p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums">
                  [[{confusion.tn}, {confusion.fp}], [{confusion.fn}, {confusion.tp}]]
                </p>
              </div>
            </article>
          </div>

          <article className="amplo-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Research path</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              End-to-end from CDC files to SHAP
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {OBJECTIVES.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-[var(--muted)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold">{step.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{step.detail}</p>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      ) : null}

      {tab === "methods" ? (
        <div className="page-stack !gap-[var(--section-gap)]">
          <div className="page-grid xl:grid-cols-2">
            <article className="amplo-card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <h2 className="font-display text-lg font-semibold">NHANES sources</h2>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Eight cycle files integrated on SEQN · {project.dataset}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {NHANES_FILES.map((file) => (
                  <span
                    key={file.code}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-1.5 text-xs"
                  >
                    <span className="font-semibold">{file.code}</span>
                    <span className="text-[var(--muted)]">{file.label}</span>
                  </span>
                ))}
              </div>
            </article>

            <article className="amplo-card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-600" />
                <h2 className="font-display text-lg font-semibold">Preprocessing</h2>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Fitted ColumnTransformer stored in the model bundle
              </p>
              <div className="mt-4 space-y-2">
                {PREPROCESS.map((row) => (
                  <div
                    key={row.title}
                    className="grid gap-1 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 sm:grid-cols-[110px_1fr] sm:items-center"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      {row.title}
                    </span>
                    <span className="text-sm">{row.body}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <article className="amplo-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Machine learning bake-off</h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
              Six baselines compared with stratified 5-fold CV. Tuned XGBoost selected; threshold{" "}
              {kpis.threshold.toFixed(2)} chosen by F1 on out-of-fold training predictions.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {MODELS.map((model) => (
                <span
                  key={model}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium",
                    model === "XGBoost"
                      ? "bg-blue-600 text-white"
                      : "border border-[var(--border)] bg-[var(--panel-strong)]",
                  )}
                >
                  {model}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/performance"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Open performance
              </Link>
              <button
                type="button"
                onClick={() => selectTab("explain")}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium"
              >
                Jump to SHAP
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {tab === "explain" ? (
        <div className="page-stack !gap-[var(--section-gap)]">
          <div className="page-grid xl:grid-cols-[1.2fr_0.8fr]">
            <article className="amplo-card p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold">Top SHAP features</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Mean absolute SHAP from the saved research table
              </p>
              <div
                className="chart-frame chart-frame-tall mt-4"
                role="img"
                aria-label="Bar chart of top global SHAP feature importances"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 8, left: 12, right: 16, bottom: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fill: "var(--chart-tick)" }} />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      width={140}
                      tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2dd4bf" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="amplo-card amplo-card-clip !p-0">
              <div className="border-b border-[var(--border)] px-5 py-4">
                <h2 className="font-display text-lg font-semibold">Highlighted drivers</h2>
                <p className="text-sm text-[var(--muted)]">From xgboost_shap_feature_importance.csv</p>
              </div>
              <div className="max-h-[460px] overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <caption className="sr-only">Highlighted SHAP features</caption>
                  <thead className="sticky top-0 bg-[var(--panel-strong)] text-xs uppercase tracking-wide text-[var(--muted)]">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Feature
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Mean |SHAP|
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {explain.highlighted_features.map((row) => (
                      <tr key={row.feature} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3">
                          <p className="font-medium">{row.label || row.feature}</p>
                          <p className="text-xs text-[var(--muted)]">{row.feature}</p>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-[var(--muted)]">
                          {row.mean_abs_shap.toFixed(6)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          <ShapImpactChart rows={explain.top_shap} />

          <article className="amplo-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Interpretation</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Cholesterol medication history, age, hypertension history, waist, race/ethnicity,
              education, pulse, and BMI rank highly in global attributions for this cohort.
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{explain.disclaimer}</p>
          </article>
        </div>
      ) : null}

      {tab === "limits" ? (
        <div className="page-stack !gap-[var(--section-gap)]">
          <section className="rounded-[1.75rem] border border-[var(--warning-border)] bg-[var(--warning-bg)] p-5 sm:p-6">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning-icon)]" />
              <div>
                <h2 className="font-display text-lg font-semibold text-[var(--warning-text)]">
                  Limitations
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--warning-text)]/90">
                  Self-reported target, class imbalance, substantial missingness and skip patterns,
                  limited external generalizability, and non-causal associations. Academic research
                  demonstration only — not a clinical diagnostic system.
                </p>
              </div>
            </div>
          </section>

          <article className="amplo-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h2 className="font-display text-lg font-semibold">References</h2>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <a
                href="https://www.cdc.gov/nchs/nhanes/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 transition hover:border-blue-500/35"
              >
                <div>
                  <p className="text-sm font-semibold">CDC NHANES</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">cdc.gov/nchs/nhanes</p>
                </div>
                <ExternalLink className="h-4 w-4 text-[var(--muted)] group-hover:text-blue-600" />
              </a>
              <a
                href="https://wwwn.cdc.gov/nchs/nhanes/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 transition hover:border-blue-500/35"
              >
                <div>
                  <p className="text-sm font-semibold">NHANES documentation</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">wwwn.cdc.gov/nchs/nhanes</p>
                </div>
                <ExternalLink className="h-4 w-4 text-[var(--muted)] group-hover:text-blue-600" />
              </a>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2.5">
      <p className="text-[11px] text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 font-display text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
