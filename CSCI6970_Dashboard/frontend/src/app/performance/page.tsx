"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Crosshair,
  Gauge,
  Target,
  TrendingUp,
} from "lucide-react";
import { FigureImage } from "@/components/FigureImage";
import { ErrorState, LoadingState } from "@/components/States";
import { apiGet } from "@/lib/api";
import { cn, pct } from "@/lib/utils";

type Comparison = {
  baseline_cv: Record<string, string | number>[];
  tuned_xgboost_cv: { Metric: string; Mean: number; "Standard Deviation": number }[];
  baseline_vs_tuned: Record<string, string | number>[];
  notes: string[];
};

type FinalMetrics = {
  model: string;
  split: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    threshold: number;
  };
};

type Confusion = {
  matrix: number[][];
  tn: number;
  fp: number;
  fn: number;
  tp: number;
};

type ThresholdCurve = {
  selected_threshold: number;
  selection_basis: string;
  train_oof_curve: {
    Threshold: number;
    Precision: number;
    Recall: number;
    "F1-score": number;
  }[];
  held_out_test_comparison: Record<string, number>[];
  notes: string[];
};

const METRICS = ["Accuracy", "Precision", "Recall", "F1-score", "ROC-AUC"] as const;
const MODEL_COLORS = [
  "#2563eb",
  "#f97316",
  "#14b8a6",
  "#a855f7",
  "#f43f5e",
  "#0ea5e9",
  "#84cc16",
];

type Tab = "compare" | "threshold" | "test" | "figures";

export default function PerformancePage() {
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [finalMetrics, setFinalMetrics] = useState<FinalMetrics | null>(null);
  const [confusion, setConfusion] = useState<Confusion | null>(null);
  const [thresholdCurve, setThresholdCurve] = useState<ThresholdCurve | null>(null);
  const [metric, setMetric] = useState<(typeof METRICS)[number]>("ROC-AUC");
  const [tab, setTab] = useState<Tab>("compare");
  const [threshold, setThreshold] = useState(0.6);
  const [enabledModels, setEnabledModels] = useState<Record<string, boolean>>({});
  const [curveLines, setCurveLines] = useState({
    Precision: true,
    Recall: true,
    "F1-score": true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<Comparison>("/api/models/comparison"),
      apiGet<FinalMetrics>("/api/models/final-metrics"),
      apiGet<Confusion>("/api/models/confusion-matrix"),
      apiGet<ThresholdCurve>("/api/models/threshold-curve"),
    ])
      .then(([c, f, cm, th]) => {
        setComparison(c);
        setFinalMetrics(f);
        setConfusion(cm);
        setThresholdCurve(th);
        setThreshold(th.selected_threshold);
        const enabled: Record<string, boolean> = {};
        for (const row of c.baseline_cv) enabled[String(row.model)] = true;
        setEnabledModels(enabled);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const nearestTrain = useMemo(() => {
    if (!thresholdCurve) return null;
    return thresholdCurve.train_oof_curve.reduce((best, row) =>
      Math.abs(row.Threshold - threshold) < Math.abs(best.Threshold - threshold) ? row : best,
    );
  }, [thresholdCurve, threshold]);

  const rankedModels = useMemo(() => {
    if (!comparison) return [];
    return [...comparison.baseline_cv]
      .map((row, i) => ({
        model: String(row.model),
        value: Number(row[metric]),
        color: MODEL_COLORS[i % MODEL_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [comparison, metric]);

  const chartSeries = useMemo(() => {
    if (!comparison) return [];
    return comparison.baseline_cv
      .filter((row) => enabledModels[String(row.model)] !== false)
      .map((row, i) => ({
        model: String(row.model).replace(" (SAGA)", ""),
        short: String(row.model).split(" ")[0],
        value: Number(row[metric]),
        color: MODEL_COLORS[i % MODEL_COLORS.length],
      }));
  }, [comparison, enabledModels, metric]);

  const mixTotal = rankedModels.reduce((s, r) => s + r.value, 0) || 1;

  if (error) return <ErrorState message={error} />;
  if (!comparison || !finalMetrics || !confusion || !thresholdCurve) {
    return <LoadingState />;
  }

  const m = finalMetrics.metrics;
  const baselineBest = rankedModels[0];

  return (
    <div className="page-stack fade-in">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h1 className="break-words font-display text-[1.55rem] font-semibold tracking-tight sm:text-[2.15rem]">
            Performance
          </h1>
          <p className="mt-3 text-[1.1rem] leading-relaxed text-[var(--muted)]">
            Compare baseline CV models, explore the 0.60 threshold, and inspect held-out test
            results for Tuned XGBoost. Academic demonstration only.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--panel)] p-1">
          {(
            [
              ["compare", "Compare"],
              ["threshold", "Threshold"],
              ["test", "Held-out"],
              ["figures", "Figures"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                tab === id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Pastel KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PastelStat
          tone="blue"
          icon={Target}
          label="Held-out accuracy"
          value={pct(m.accuracy)}
          hint={`vs best CV ${baselineBest ? pct(baselineBest.value, 0) : "—"} ${metric}`}
        />
        <PastelStat
          tone="orange"
          icon={TrendingUp}
          label="F1-score"
          value={pct(m.f1_score)}
          hint={`Precision ${pct(m.precision, 0)} · Recall ${pct(m.recall, 0)}`}
        />
        <PastelStat
          tone="teal"
          icon={Activity}
          label="ROC-AUC"
          value={pct(m.roc_auc)}
          hint="Threshold-independent ranking"
        />
        <PastelStat
          tone="green"
          icon={Gauge}
          label="Operating threshold"
          value={m.threshold.toFixed(2)}
          hint="Locked from train OOF F1"
        />
      </div>

      {tab === "compare" ? (
        <>
          <article className="amplo-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">Baseline CV pulse</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Stratified 5-fold means. Toggle models and metrics.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {comparison.baseline_cv.map((row, i) => {
                    const name = String(row.model);
                    const on = enabledModels[name] !== false;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          setEnabledModels((prev) => ({ ...prev, [name]: !on }))
                        }
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                          on
                            ? "border-transparent bg-[var(--panel-strong)] text-[var(--foreground)]"
                            : "border-[var(--border)] text-[var(--muted)] opacity-60",
                        )}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: MODEL_COLORS[i % MODEL_COLORS.length] }}
                        />
                        {name.replace(" (SAGA)", "")}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--panel-strong)] p-1">
                {METRICS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMetric(item)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium",
                      metric === item
                        ? "bg-blue-600 text-white"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]",
                    )}
                  >
                    {item === "F1-score" ? "F1" : item === "ROC-AUC" ? "ROC" : item.slice(0, 4)}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="chart-frame chart-frame-tall mt-5"
              role="img"
              aria-label={`Area chart of ${metric} across baseline models`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSeries} margin={{ top: 14, right: 12, left: 4, bottom: 28 }}>
                  <defs>
                    <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} />
                  <XAxis
                    dataKey="short"
                    tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => pct(Number(v), 0)}
                    tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    formatter={(v, _n, item) => [
                      pct(Number(v)),
                      String((item?.payload as { model?: string })?.model ?? metric),
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--panel)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2.75}
                    fill="url(#perfFill)"
                    dot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="amplo-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">
              Where {metric} came from
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Share of total baseline {metric} mass across models (visual mix, not probability)
            </p>
            <div className="mt-5 flex h-5 w-full overflow-hidden rounded-full">
              {rankedModels.map((row) => (
                <button
                  key={row.model}
                  type="button"
                  title={`${row.model}: ${pct(row.value)}`}
                  onClick={() =>
                    setEnabledModels((prev) => ({
                      ...prev,
                      [row.model]: !(prev[row.model] !== false),
                    }))
                  }
                  className="h-full transition hover:brightness-110"
                  style={{
                    width: `${(row.value / mixTotal) * 100}%`,
                    background: row.color,
                    opacity: enabledModels[row.model] === false ? 0.25 : 1,
                  }}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {rankedModels.map((row) => (
                <span key={row.model} className="inline-flex items-center gap-2 text-[var(--muted)]">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: row.color }} />
                  {row.model.replace(" (SAGA)", "")}{" "}
                  <span className="font-medium text-[var(--foreground)]">{pct(row.value)}</span>
                </span>
              ))}
            </div>
          </article>

          <article className="amplo-card amplo-card-clip !p-0">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="font-display text-lg font-semibold">Baseline table</h2>
              <p className="text-sm text-[var(--muted)]">Click a metric header to re-rank the chart</p>
            </div>
            <div className="table-scroll">
              <table className="min-w-full text-left text-sm">
                <caption className="sr-only">Baseline CV metrics by model</caption>
                <thead className="bg-[var(--panel-strong)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Model
                    </th>
                    {METRICS.map((item) => (
                      <th key={item} scope="col" className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setMetric(item)}
                          className={cn(
                            "font-medium",
                            metric === item ? "text-blue-600" : "hover:text-[var(--foreground)]",
                          )}
                        >
                          {item}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.baseline_cv.map((row) => (
                    <tr key={String(row.model)} className="border-t border-[var(--border)]">
                      <td className="px-5 py-3 font-medium">{String(row.model)}</td>
                      {METRICS.map((item) => (
                        <td key={item} className="px-3 py-3 tabular-nums text-[var(--muted)]">
                          {pct(Number(row[item]))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </>
      ) : null}

      {tab === "threshold" ? (
        <div className="page-stack !gap-[var(--section-gap)]">
          <article className="amplo-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">Threshold explorer</h2>
                <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
                  {thresholdCurve.selection_basis}
                </p>
              </div>
              <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--panel-strong)] p-1">
                {(
                  [
                    ["Precision", "Prec"],
                    ["Recall", "Recall"],
                    ["F1-score", "F1"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setCurveLines((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium",
                      curveLines[key]
                        ? "bg-blue-600 text-white"
                        : "text-[var(--muted)]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium">
                Selected{" "}
                <span className="tabular-nums text-blue-600">{threshold.toFixed(2)}</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setThreshold(0.5)}
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"
                >
                  0.50
                </button>
                <button
                  type="button"
                  onClick={() => setThreshold(0.6)}
                  className="rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
                >
                  0.60
                </button>
              </div>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.7}
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-3 w-full accent-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/40"
              aria-label="Classification threshold"
            />

            {nearestTrain ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MetricMini label="Precision (OOF)" value={pct(nearestTrain.Precision)} />
                <MetricMini label="Recall (OOF)" value={pct(nearestTrain.Recall)} />
                <MetricMini label="F1 (OOF)" value={pct(nearestTrain["F1-score"])} />
              </div>
            ) : null}

            <div
              className="chart-frame chart-frame-tall mt-5"
              role="img"
              aria-label="Threshold curve for precision recall and F1"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={thresholdCurve.train_oof_curve}
                  margin={{ top: 14, right: 12, left: 4, bottom: 28 }}
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} />
                  <XAxis
                    dataKey="Threshold"
                    tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    height={36}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => pct(Number(v), 0)}
                    tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={46}
                  />
                  <Tooltip formatter={(v) => pct(Number(v))} />
                  {curveLines.Precision ? (
                    <Area
                      type="monotone"
                      dataKey="Precision"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.08}
                      strokeWidth={2}
                      dot={false}
                    />
                  ) : null}
                  {curveLines.Recall ? (
                    <Area
                      type="monotone"
                      dataKey="Recall"
                      stroke="#f43f5e"
                      fill="#f43f5e"
                      fillOpacity={0.06}
                      strokeWidth={2}
                      dot={false}
                    />
                  ) : null}
                  {curveLines["F1-score"] ? (
                    <Area
                      type="monotone"
                      dataKey="F1-score"
                      stroke="#14b8a6"
                      fill="#14b8a6"
                      fillOpacity={0.1}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  ) : null}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="amplo-card amplo-card-clip !p-0">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="font-display text-lg font-semibold">Held-out 0.50 vs 0.60</h2>
              <p className="text-sm text-[var(--muted)]">Checked after threshold selection</p>
            </div>
            <div className="table-scroll">
              <table className="min-w-full text-left text-sm">
                <caption className="sr-only">Held-out test threshold comparison</caption>
                <thead className="bg-[var(--panel-strong)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    {Object.keys(thresholdCurve.held_out_test_comparison[0] ?? {}).map((k) => (
                      <th key={k} scope="col" className="px-4 py-3">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {thresholdCurve.held_out_test_comparison.map((row, idx) => (
                    <tr key={idx} className="border-t border-[var(--border)]">
                      {Object.entries(row).map(([key, v]) => (
                        <td key={key} className="px-4 py-3 tabular-nums">
                          {key === "Threshold"
                            ? Number(v).toFixed(2)
                            : typeof v === "number"
                              ? pct(v)
                              : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      ) : null}

      {tab === "test" ? (
        <div className="page-stack !gap-[var(--section-gap)]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Accuracy", m.accuracy],
              ["Precision", m.precision],
              ["Recall", m.recall],
              ["F1-score", m.f1_score],
              ["ROC-AUC", m.roc_auc],
              ["Threshold", m.threshold],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="amplo-card !p-4"
              >
                <p className="text-sm text-[var(--muted)]">{label}</p>
                <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
                  {label === "Threshold" ? Number(value).toFixed(2) : pct(Number(value))}
                </p>
              </div>
            ))}
          </div>

          <article className="amplo-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-blue-600" />
              <h2 className="font-display text-lg font-semibold">Confusion matrix</h2>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {finalMetrics.split} · [[TN, FP], [FN, TP]]
            </p>
            <div className="mt-5 grid max-w-lg grid-cols-2 gap-3">
              <MatrixCell label="True negative" value={confusion.tn} tone="teal" />
              <MatrixCell label="False positive" value={confusion.fp} tone="orange" />
              <MatrixCell label="False negative" value={confusion.fn} tone="rose" />
              <MatrixCell label="True positive" value={confusion.tp} tone="blue" />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">
              Accuracy {pct(m.accuracy)} sits beside imbalance: precision {pct(m.precision)} and
              recall {pct(m.recall)} at threshold {m.threshold.toFixed(2)}. Self-reported target —
              not clinical performance.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
              {comparison.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </article>

          <article className="amplo-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Tuned XGBoost CV</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Separate from held-out test numbers</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {comparison.tuned_xgboost_cv.map((row) => (
                <div
                  key={row.Metric}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-4"
                >
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{row.Metric}</p>
                  <p className="mt-2 font-display text-3xl">{pct(row.Mean)}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {tab === "figures" ? (
        <div className="page-grid lg:grid-cols-2">
          <FigureImage
            filename="xgboost_final_confusion_matrix.png"
            alt="Confusion matrix figure"
            caption="Saved project confusion matrix."
          />
          <FigureImage
            filename="xgboost_roc_curve.png"
            alt="ROC curve"
            caption="Saved project ROC curve."
          />
          <FigureImage
            filename="xgboost_precision_recall_curve.png"
            alt="Precision-recall curve"
            caption="Saved project precision-recall curve."
          />
          <FigureImage
            filename="xgboost_feature_importance.png"
            alt="Feature importance"
            caption="Saved project XGBoost feature importance."
          />
        </div>
      ) : null}
    </div>
  );
}

function PastelStat({
  tone,
  icon: Icon,
  label,
  value,
  hint,
}: {
  tone: "blue" | "orange" | "teal" | "green";
  icon: typeof Target;
  label: string;
  value: string;
  hint: string;
}) {
  const tones = {
    blue: "bg-sky-500/10",
    orange: "bg-orange-500/10",
    teal: "bg-teal-500/10",
    green: "bg-emerald-500/10",
  };
  const iconTone = {
    blue: "bg-sky-500/20 text-sky-700 dark:text-sky-300",
    orange: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
    teal: "bg-teal-500/20 text-teal-700 dark:text-teal-300",
    green: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  };
  return (
    <article className={cn("rounded-[1.75rem] p-5", tones[tone])}>
      <div className="flex items-center gap-2">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconTone[tone])}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-sm text-[var(--muted)]">{label}</p>
      </div>
      <p className="mt-4 font-display text-4xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-3 inline-flex rounded-full bg-[var(--panel)]/80 px-2.5 py-1 text-xs font-medium text-[var(--foreground)]">
        {hint}
      </p>
    </article>
  );
}

function MatrixCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "teal" | "orange" | "rose" | "blue";
}) {
  const bg = {
    teal: "bg-teal-500/10",
    orange: "bg-orange-500/10",
    rose: "bg-rose-500/10",
    blue: "bg-sky-500/10",
  }[tone];
  return (
    <div className={cn("rounded-2xl px-4 py-5 text-center", bg)}>
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
