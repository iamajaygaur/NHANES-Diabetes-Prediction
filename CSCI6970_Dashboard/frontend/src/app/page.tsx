"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Beaker,
  BrainCircuit,
  Clock3,
  Database,
  FlaskConical,
  Plus,
  Sparkles,
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { ErrorState, LoadingState } from "@/components/States";
import { apiGet } from "@/lib/api";
import { num, pct } from "@/lib/utils";

type Overview = {
  project: {
    name: string;
    subtitle: string;
    research_title: string;
    dataset: string;
    source: string;
  };
  kpis: {
    participants: number;
    diabetes_cases: number;
    non_diabetes_cases: number;
    prevalence_pct: number;
    predictor_features: number;
    model: string;
    threshold: number;
  };
  target_distribution: { DIABETES: string; Participant_Count: number; Percentage: number }[];
  final_test_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    threshold: number;
  };
  key_findings: string[];
  feature_mix?: { name: string; value: number; pct: number; color: string }[];
};

type Comparison = {
  baseline_cv: Record<string, string | number>[];
  baseline_vs_tuned: Record<string, string | number>[];
};

type ThresholdCurve = {
  selected_threshold: number;
  train_oof_curve: {
    Threshold: number;
    Precision: number;
    Recall: number;
    "F1-score": number;
  }[];
};

const DONUT = ["#2563eb", "#38bdf8", "#a78bfa", "#f472b6", "#34d399"];

const WORKFLOW = [
  { title: "NHANES join", owner: "Data", status: "Live", href: "/dataset", icon: Database },
  { title: "Cleaning & EDA", owner: "Analysis", status: "Live", href: "/analysis", icon: FlaskConical },
  { title: "Model bake-off", owner: "ML", status: "Live", href: "/performance", icon: Beaker },
  { title: "Tuned XGBoost", owner: "Model", status: "Live", href: "/performance", icon: BrainCircuit },
  { title: "SHAP stories", owner: "XAI", status: "Live", href: "/project?tab=explain", icon: Sparkles },
];

type MetricView = "roc" | "f1" | "recall" | "precision";

export default function OverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [curve, setCurve] = useState<ThresholdCurve | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metricView, setMetricView] = useState<MetricView>("f1");
  const [findingQuery, setFindingQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [overview, comp, thresh] = await Promise.all([
          apiGet<Overview>("/api/overview"),
          apiGet<Comparison>("/api/models/comparison"),
          apiGet<ThresholdCurve>("/api/models/threshold-curve"),
        ]);
        if (cancelled) return;
        setData(overview);
        setComparison(comp);
        setCurve(thresh);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Request failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const chartSeries = useMemo(() => {
    if (!curve) return [];
    return curve.train_oof_curve.map((row) => ({
      t: Number(row.Threshold).toFixed(2),
      value:
        metricView === "roc"
          ? Number(row["F1-score"])
          : metricView === "f1"
            ? Number(row["F1-score"])
            : metricView === "recall"
              ? Number(row.Recall)
              : Number(row.Precision),
      label: metricView === "roc" ? "F1 (proxy pulse)" : metricView,
    }));
  }, [curve, metricView]);

  const peak = useMemo(() => {
    if (!chartSeries.length) return null;
    return chartSeries.reduce((best, row) => (row.value > best.value ? row : best), chartSeries[0]);
  }, [chartSeries]);

  if (error) return <ErrorState message={error} />;
  if (!data || !comparison || !curve) return <LoadingState />;

  const pieData =
    data.feature_mix && data.feature_mix.length > 0
      ? data.feature_mix
      : [
          { name: "Numerical", value: 25, pct: 49, color: DONUT[0] },
          { name: "Categorical", value: 20, pct: 39, color: DONUT[1] },
          { name: "Ordinal", value: 6, pct: 12, color: DONUT[2] },
        ];

  const baselineRow = comparison.baseline_vs_tuned.find((r) =>
    String(r.Model ?? "").toLowerCase().includes("baseline"),
  );
  const tunedRow = comparison.baseline_vs_tuned.find((r) =>
    String(r.Model ?? "").toLowerCase().includes("tuned"),
  );
  const liftMetricKey =
    metricView === "roc"
      ? "ROC-AUC"
      : metricView === "f1"
        ? "F1-score"
        : metricView === "recall"
          ? "Recall"
          : "Precision";
  const baselineMetric = Number(baselineRow?.[liftMetricKey]);
  const tunedMetric = Number(tunedRow?.[liftMetricKey] ?? data.final_test_metrics.roc_auc);
  const rocLift =
    Number.isFinite(baselineMetric) && baselineMetric > 0
      ? ((tunedMetric - baselineMetric) / baselineMetric) * 100
      : 0;

  const heroMetric =
    metricView === "roc"
      ? data.final_test_metrics.roc_auc
      : metricView === "f1"
        ? data.final_test_metrics.f1_score
        : metricView === "recall"
          ? data.final_test_metrics.recall
          : data.final_test_metrics.precision;

  const heroLabel =
    metricView === "roc"
      ? "ROC-AUC"
      : metricView === "f1"
        ? "F1-score"
        : metricView === "recall"
          ? "Recall"
          : "Precision";

  const findings = data.key_findings.filter((f) =>
    f.toLowerCase().includes(findingQuery.trim().toLowerCase()),
  );

  return (
    <div className="page-stack fade-in">
      {/* Hero strip — Amplo greeting composition */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[2.35rem] font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.7rem]">
            {greeting}, researcher
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-[var(--muted)] sm:text-[0.95rem]">
            <span>{num(data.kpis.participants)} participants ready</span>
            <span className="text-[var(--border)]">·</span>
            <span>{data.kpis.prevalence_pct}% diabetes prevalence</span>
            <span className="text-[var(--border)]">·</span>
            <span>XGBoost · threshold {data.kpis.threshold.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/performance"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-sm"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Weekly report
          </Link>
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25"
          >
            <Plus className="h-4 w-4" />
            New prediction
          </Link>
        </div>
      </section>

      <Disclaimer compact />

      {/* Dual hero cards — natural height; charts must not clip */}
      <section className="page-grid xl:grid-cols-2">
        {/* Cohort wallet */}
        <article className="amplo-card flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Modeling cohort</p>
              <p className="mt-2 font-display text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                {num(data.kpis.participants)}
              </p>
            </div>
            <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
              NHANES
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <MiniStat label="Diabetes" value={num(data.kpis.diabetes_cases)} />
            <MiniStat label="Non-diabetes" value={num(data.kpis.non_diabetes_cases)} />
            <MiniStat label="Predictors" value={String(data.kpis.predictor_features)} />
          </div>

          <div className="relative mx-auto mt-6 h-[260px] w-full max-w-[280px] sm:h-[280px] sm:max-w-[300px]">
            {/* Channel ring — grows in on every mount */}
            <div className="absolute inset-0 z-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    key={`vinyl-ring-${pieData.map((d) => d.name).join("-")}`}
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={2.5}
                    stroke="none"
                    isAnimationActive
                    animationBegin={80}
                    animationDuration={1100}
                    animationEasing="ease-out"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${Number(value)}%`, String(name)]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--panel)",
                      color: "var(--foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Vinyl disc */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="vinyl-disc h-full w-full rounded-full bg-[radial-gradient(circle_at_32%_28%,#3f4b5f_0%,#111827_48%,#020617_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_32px_rgba(15,23,42,0.3)] ring-1 ring-white/10">
                <div className="absolute inset-[12%] rounded-full border border-white/[0.07]" />
                <div className="absolute inset-[24%] rounded-full border border-white/[0.06]" />
                <div className="absolute inset-[36%] rounded-full border border-white/[0.05]" />
              </div>
            </div>

            {/* Center label */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="vinyl-label flex flex-col items-center justify-center">
                <span className="text-[10px] font-medium uppercase leading-none tracking-[0.26em] text-slate-400 sm:text-[11px]">
                  Cohort
                </span>
                <span className="mt-2.5 font-display text-2xl font-semibold leading-none tracking-tight tabular-nums text-white sm:text-[28px]">
                  {data.kpis.prevalence_pct}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
            {pieData.map((item) => (
              <span key={item.name} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                {item.name}{" "}
                <span className="font-medium text-[var(--foreground)]">{item.pct}%</span>
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Pipeline autopilot</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                51 predictors · threshold locked at {data.kpis.threshold.toFixed(2)} for F1
              </p>
            </div>
            <Link
              href="/performance"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Rebalance
            </Link>
          </div>
        </article>

        {/* Model pulse / fans-gained analogue */}
        <article className="amplo-card flex flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">{heroLabel}</p>
              <div className="mt-2 flex items-end gap-3">
                <p className="font-display text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                  {pct(heroMetric)}
                </p>
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {rocLift >= 0 ? "+" : ""}
                  {rocLift.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--panel-strong)] p-1">
              {(
                [
                  ["roc", "ROC"],
                  ["f1", "F1"],
                  ["recall", "Recall"],
                  ["precision", "Prec"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMetricView(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    metricView === id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-frame mt-5 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartSeries} margin={{ top: 16, right: 12, left: 4, bottom: 28 }}>
                <defs>
                  <linearGradient id="pulseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} />
                <XAxis
                  dataKey="t"
                  tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  height={36}
                  label={{ value: "Threshold", position: "insideBottomRight", offset: 4, fill: "var(--muted)", fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(v) => pct(Number(v), 0)}
                  tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={46}
                />
                <Tooltip
                  formatter={(v) => pct(Number(v))}
                  labelFormatter={(l) => `Threshold ${l}`}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--panel)",
                    color: "var(--foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#pulseFill)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {peak ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-1.5 text-xs text-[var(--muted)]">
              Peak at threshold {peak.t}
              <span className="font-semibold text-[var(--foreground)]">{pct(peak.value)}</span>
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Accuracy", value: pct(data.final_test_metrics.accuracy) },
              { label: "Precision", value: pct(data.final_test_metrics.precision) },
              { label: "Recall", value: pct(data.final_test_metrics.recall) },
              { label: "F1", value: pct(data.final_test_metrics.f1_score) },
            ].map((cell) => (
              <div key={cell.label} className="mini-stat">
                <p className="text-[11px] text-[var(--muted)]">{cell.label}</p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums">{cell.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Held-out test · thr {data.kpis.threshold.toFixed(2)}
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                ROC-AUC {pct(data.final_test_metrics.roc_auc)} · chosen by OOF F1, not test peeking
              </p>
            </div>
            <Link
              href="/performance"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Open performance
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>
      </section>

      {/* Lower row — campaigns + countdown */}
      <section className="page-grid xl:grid-cols-[1.35fr_0.85fr]">
        <article className="amplo-card amplo-card-clip !p-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-lg font-semibold">Workflow on air</h2>
              <p className="text-xs text-[var(--muted)]">Research stages you can open live</p>
            </div>
            <Link href="/project" className="text-xs font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-2 py-3 font-medium">Stage</th>
                  <th className="px-2 py-3 font-medium">Owner</th>
                  <th className="px-2 py-3 font-medium">Squad</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {WORKFLOW.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <tr key={row.title} className="border-t border-[var(--border)]">
                      <td className="px-5 py-3 text-[var(--muted)]">{String(i + 1).padStart(2, "0")}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="font-medium text-[var(--foreground)]">{row.title}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-[var(--muted)]">{row.owner}</td>
                      <td className="px-2 py-3">
                        <div className="flex -space-x-1.5">
                          {["AG", "MS", "XR"].map((ini) => (
                            <span
                              key={ini}
                              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--panel)] bg-[var(--soft)] text-[10px] font-semibold"
                            >
                              {ini}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={row.href}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--panel-strong)]"
                        >
                          Join
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="amplo-card flex flex-col p-5 sm:p-6">
          <p className="text-sm font-medium text-[var(--muted)]">Next drop</p>
          <h2 className="mt-1.5 font-display text-xl font-semibold text-[var(--foreground)]">
            Prediction Studio
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Run a local risk score with optional SHAP drivers · academic demo only
          </p>

          <div className="mt-6 grid grid-cols-4 gap-3">
            {[
              { label: "Feat", value: String(data.kpis.predictor_features) },
              { label: "Thr", value: data.kpis.threshold.toFixed(2).replace("0.", ".") },
              { label: "AUC", value: pct(data.final_test_metrics.roc_auc, 0) },
              { label: "F1", value: pct(data.final_test_metrics.f1_score, 0) },
            ].map((cell) => (
              <div key={cell.label} className="mini-stat text-center">
                <p className="font-display text-xl font-semibold tabular-nums sm:text-2xl">{cell.value}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">{cell.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-2 pt-6 text-xs text-[var(--muted)]">
            <Clock3 className="h-3.5 w-3.5" />
            Held-out test · seed 42 · not clinical diagnosis
          </div>

          <Link
            href="/predict"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20"
          >
            Open studio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      {/* Findings strip */}
      <section className="amplo-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Key findings</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Verified from research outputs</p>
          </div>
          <input
            id="dashboard-search"
            value={findingQuery}
            placeholder="Filter findings…"
            className="w-full max-w-xs rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-2.5 text-sm outline-none ring-blue-500/20 focus:ring-2"
            onChange={(e) => setFindingQuery(e.target.value)}
          />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {findings.slice(0, 6).map((finding) => (
            <div
              key={finding}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3.5 text-sm text-[var(--foreground)]"
            >
              {finding}
            </div>
          ))}
          {findings.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No findings match that search.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="mini-stat">
      <p className="text-[11px] text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 text-[10px] text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}
