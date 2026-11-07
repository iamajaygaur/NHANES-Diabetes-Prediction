"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Binary,
  Layers,
  Link2,
  PieChart as PieIcon,
} from "lucide-react";
import { AmploSelect } from "@/components/AmploSelect";
import { ErrorState, LoadingState } from "@/components/States";
import { apiGet } from "@/lib/api";
import { cn, num } from "@/lib/utils";

type Analysis = {
  histograms: Record<string, { left: number; count: number; bin?: string }[]>;
  strong_correlations: {
    Feature_1?: string;
    Feature_2?: string;
    Correlation?: number;
    [key: string]: string | number | undefined;
  }[];
  eda_findings: { Analysis?: string; Finding?: string; [key: string]: string | number | undefined }[];
  numerical_by_diabetes: Record<string, string | number>[];
  disclaimer: string;
};

type Missingness = {
  category_summary: { Missingness_Category: string; Variable_Count: number }[];
  top_missing?: { Feature?: string; Column?: string; Missing_Percentage?: number; [key: string]: string | number | undefined }[];
  readme_final_predictor_missingness: Record<string, number | string>;
};

type Target = {
  overall: { DIABETES: string; Participant_Count: number; Percentage: number }[];
  by_age_group?: { age_group: string; diabetes: string; count: number }[];
  note?: string;
};

type Tab = "target" | "distributions" | "missing" | "links";

const METRIC_META: Record<string, { label: string; unit: string; color: string }> = {
  RIDAGEYR: { label: "Age", unit: "years", color: "#2d5bff" },
  BMXBMI: { label: "BMI", unit: "kg/m²", color: "#f97316" },
  BMXWT: { label: "Weight", unit: "kg", color: "#14b8a6" },
  BMXWAIST: { label: "Waist", unit: "cm", color: "#a855f7" },
  INDFMPIR: { label: "Income ratio", unit: "PIR", color: "#0ea5e9" },
  BPXOSY1: { label: "Systolic BP", unit: "mm Hg", color: "#f43f5e" },
  BPXODI1: { label: "Diastolic BP", unit: "mm Hg", color: "#8b5cf6" },
};

function shortFeat(code: string) {
  return code.length > 10 ? `${code.slice(0, 9)}…` : code;
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [missing, setMissing] = useState<Missingness | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [tab, setTab] = useState<Tab>("target");
  const [metric, setMetric] = useState("RIDAGEYR");
  const [activeCorr, setActiveCorr] = useState(0);
  const [activeMissing, setActiveMissing] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<Analysis>("/api/analysis/distributions"),
      apiGet<Missingness>("/api/analysis/missingness"),
      apiGet<Target>("/api/analysis/target-distribution"),
    ])
      .then(([a, m, t]) => {
        setAnalysis(a);
        setMissing(m);
        setTarget(t);
        const keys = Object.keys(a.histograms);
        if (keys.length && !keys.includes("RIDAGEYR")) setMetric(keys[0]);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const histKeys = useMemo(
    () => (analysis ? Object.keys(analysis.histograms) : []),
    [analysis],
  );

  const targetChart = useMemo(() => {
    if (!target) return [];
    return target.overall.map((row) => ({
      label: row.DIABETES.replace("No Diabetes", "Non-diabetes").replace("Diabetes", "Diabetes"),
      count: row.Participant_Count,
      pct: row.Percentage,
    }));
  }, [target]);

  const ageSeries = useMemo(() => {
    if (!target?.by_age_group?.length) return [];
    const groups = new Map<string, { age: string; diabetes: number; none: number }>();
    for (const row of target.by_age_group) {
      const cur = groups.get(row.age_group) ?? { age: row.age_group, diabetes: 0, none: 0 };
      if (row.diabetes === "Diabetes") cur.diabetes = row.count;
      else cur.none = row.count;
      groups.set(row.age_group, cur);
    }
    return [...groups.values()];
  }, [target]);

  const histData = useMemo(() => {
    if (!analysis) return [];
    return (analysis.histograms[metric] ?? []).map((bin) => ({
      ...bin,
      label: bin.left == null ? "—" : Number(bin.left).toFixed(0),
    }));
  }, [analysis, metric]);

  const corrRows = useMemo(() => {
    if (!analysis) return [];
    return analysis.strong_correlations.slice(0, 12).map((row, i) => {
      const f1 = String(row.Feature_1 ?? Object.values(row)[0] ?? "");
      const f2 = String(row.Feature_2 ?? Object.values(row)[1] ?? "");
      const value = Number(row.Correlation ?? Object.values(row)[2] ?? 0);
      return {
        id: i,
        pair: `${shortFeat(f1)} × ${shortFeat(f2)}`,
        full: `${f1} × ${f2}`,
        f1,
        f2,
        value,
        abs: Math.abs(value),
      };
    });
  }, [analysis]);

  const missingCats = useMemo(() => {
    if (!missing) return [];
    return missing.category_summary.map((row) => ({
      label: row.Missingness_Category.replace(/_/g, " "),
      short: row.Missingness_Category.replace(/_/g, " ").slice(0, 12),
      count: row.Variable_Count,
    }));
  }, [missing]);

  const topMissing = useMemo(() => {
    if (!missing?.top_missing) return [];
    return missing.top_missing.slice(0, 10).map((row) => {
      const name = String(
        row.Feature ??
          row.Column ??
          row.Variable ??
          row["Unnamed: 0"] ??
          Object.values(row)[0] ??
          "",
      );
      const pctVal = Number(
        row.Missing_Percentage ??
          row.Percent_Missing ??
          row.missing_pct ??
          Object.values(row).find((v) => typeof v === "number" && Number(v) <= 100) ??
          0,
      );
      return { name, pct: pctVal };
    });
  }, [missing]);

  if (error) return <ErrorState message={error} />;
  if (!analysis || !missing || !target) return <LoadingState />;

  const diabetes = target.overall.find((r) => /diabetes/i.test(r.DIABETES) && !/no/i.test(r.DIABETES));
  const non = target.overall.find((r) => /no/i.test(r.DIABETES));
  const total = target.overall.reduce((s, r) => s + r.Participant_Count, 0);
  const miss = missing.readme_final_predictor_missingness;
  const metricMeta = METRIC_META[metric] ?? {
    label: metric,
    unit: "",
    color: "#2d5bff",
  };
  const selectedCorr = corrRows[activeCorr] ?? corrRows[0];
  const selectedMiss = missingCats[activeMissing] ?? missingCats[0];

  return (
    <div className="space-y-6 fade-in">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h1 className="font-display text-[2.4rem] font-semibold tracking-tight sm:text-[2.75rem]">
            Analysis
          </h1>
          <p className="mt-3 text-[1.1rem] leading-relaxed text-[var(--muted)]">
            Exploratory patterns from the NHANES modeling cohort — target balance, distributions,
            missingness, and strong correlations. Associations are not causation.
          </p>
        </div>
        <div className="inline-flex flex-wrap rounded-full border border-[var(--border)] bg-[var(--panel)] p-1">
          {(
            [
              ["target", "Target"],
              ["distributions", "Distributions"],
              ["missing", "Missingness"],
              ["links", "Correlations"],
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PastelStat
          tone="blue"
          icon={PieIcon}
          label="Modeling cohort"
          value={num(total)}
          hint={`${diabetes?.Percentage ?? "—"}% diabetes prevalence`}
        />
        <PastelStat
          tone="orange"
          icon={Binary}
          label="Diabetes cases"
          value={num(diabetes?.Participant_Count ?? 0)}
          hint={`${num(non?.Participant_Count ?? 0)} non-diabetes`}
        />
        <PastelStat
          tone="teal"
          icon={Activity}
          label="Strong corr. pairs"
          value={String(analysis.strong_correlations.length)}
          hint="|r| ≥ 0.70 in project table"
        />
        <PastelStat
          tone="green"
          icon={Layers}
          label="High / very high miss."
          value={String(Number(miss.high_30_to_60) + Number(miss.very_high_ge_60))}
          hint="Of final 51 predictors"
        />
      </div>

      {tab === "target" ? (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="amplo-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">Class balance</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Verified diabetes target counts from the research table
                  </p>
                </div>
                <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Imbalanced
                </span>
              </div>
              <div
                className="mt-5 h-[320px]"
                role="img"
                aria-label="Bar chart of diabetes class distribution"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={targetChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(148,163,184,0.12)", radius: 12 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload as (typeof targetChart)[0];
                        return (
                          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm shadow-lg">
                            <p className="font-semibold">{row.label}</p>
                            <p className="text-[var(--muted)]">
                              {num(row.count)} · {row.pct}%
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]} maxBarSize={96}>
                      {targetChart.map((row) => (
                        <Cell
                          key={row.label}
                          fill={row.label === "Diabetes" ? "#2d5bff" : "#94a3b8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="amplo-card p-5 sm:p-6">
              <h2 className="font-display text-xl font-semibold">Split snapshot</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Same numbers the model train/test used</p>
              <div className="mt-5 space-y-3">
                {targetChart.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{row.label}</p>
                      <p className="font-display text-2xl font-semibold tabular-nums">
                        {row.pct}%
                      </p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          row.label === "Diabetes" ? "bg-blue-600" : "bg-slate-400",
                        )}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">{num(row.count)} participants</p>
                  </div>
                ))}
              </div>
              {target.note ? (
                <p className="mt-4 text-sm text-[var(--muted)]">{target.note}</p>
              ) : null}
            </article>
          </div>

          {ageSeries.length ? (
            <article className="amplo-card p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold">By age band</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Counts stacked by diabetes status · observed pattern only
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[#2d5bff]" />
                    Diabetes
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[#cbd5e1]" />
                    Non-diabetes
                  </span>
                </div>
              </div>
              <div className="mt-5 h-[340px]" role="img" aria-label="Diabetes counts by age group">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="age"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(148,163,184,0.12)", radius: 12 }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--panel)",
                      }}
                    />
                    <Bar dataKey="none" stackId="a" fill="#cbd5e1" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="diabetes" stackId="a" fill="#2d5bff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          ) : null}

          <article className="amplo-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">EDA findings</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {analysis.eda_findings.map((row) => (
                <div
                  key={String(row.Analysis)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {String(row.Analysis)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)]/85">
                    {String(row.Finding)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {tab === "distributions" ? (
        <div className="space-y-4">
          <article className="amplo-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">Numerical distributions</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Cohort histograms for key continuous predictors
                </p>
              </div>
              <AmploSelect
                fullWidth={false}
                aria-label="Distribution metric"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="min-w-[11rem]"
              >
                {histKeys.map((key) => (
                  <option key={key} value={key}>
                    {METRIC_META[key]?.label ?? key}
                  </option>
                ))}
              </AmploSelect>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <div
                className="h-[380px]"
                role="img"
                aria-label={`Histogram of ${metricMeta.label}`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={histData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(148,163,184,0.12)", radius: 10 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload as (typeof histData)[0];
                        return (
                          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm shadow-lg">
                            <p className="font-semibold">
                              {row.bin ?? row.label}
                              {metricMeta.unit ? ` ${metricMeta.unit}` : ""}
                            </p>
                            <p className="text-[var(--muted)]">{num(row.count)} participants</p>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill={metricMeta.color}
                      fillOpacity={0.85}
                      radius={[8, 8, 0, 0]}
                      maxBarSize={28}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--foreground)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Selected</p>
                  <p className="mt-1 font-display text-2xl font-semibold">{metricMeta.label}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {metric}
                    {metricMeta.unit ? ` · ${metricMeta.unit}` : ""}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Bin count</p>
                  <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                    {histData.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Peak bin</p>
                  <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                    {histData.length
                      ? num(Math.max(...histData.map((d) => d.count)))
                      : "—"}
                  </p>
                </div>
                <p className="text-sm text-[var(--muted)]">{analysis.disclaimer}</p>
              </div>
            </div>
          </article>
        </div>
      ) : null}

      {tab === "missing" ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {(
              [
                ["No missing", miss.no_missing, "blue"],
                ["Low <5%", miss.low_lt_5, "teal"],
                ["Moderate 5–30%", miss.moderate_5_to_30, "orange"],
                ["High 30–60%", miss.high_30_to_60, "rose"],
                ["Very high ≥60%", miss.very_high_ge_60, "violet"],
              ] as const
            ).map(([label, value, tone]) => (
              <div
                key={label}
                className={cn(
                  "rounded-[1.5rem] px-4 py-4",
                  tone === "blue" && "bg-sky-500/10",
                  tone === "teal" && "bg-teal-500/10",
                  tone === "orange" && "bg-orange-500/10",
                  tone === "rose" && "bg-rose-500/10",
                  tone === "violet" && "bg-violet-500/10",
                )}
              >
                <p className="text-xs text-[var(--muted)]">{label}</p>
                <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="amplo-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">Missingness by category</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Hover a column to inspect variable counts
                  </p>
                </div>
                {selectedMiss ? (
                  <span className="rounded-full bg-[var(--foreground)] px-3 py-1 text-xs font-medium text-[var(--panel)]">
                    {selectedMiss.label}
                  </span>
                ) : null}
              </div>
              <div
                className="mt-5 h-[360px]"
                role="img"
                aria-label="Missingness categories by variable count"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={missingCats}
                    margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
                    onMouseMove={(state) => {
                      if (state?.activeTooltipIndex == null) return;
                      const idx = Number(state.activeTooltipIndex);
                      if (!Number.isNaN(idx)) setActiveMissing(idx);
                    }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="short"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      height={48}
                      tick={({ x, y, payload, index }) => {
                        const on = index === activeMissing;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <foreignObject x={-36} y={4} width={72} height={28}>
                              <div
                                className={cn(
                                  "flex h-full items-center justify-center rounded-full px-1 text-[10px] font-medium",
                                  on
                                    ? "bg-[var(--foreground)] text-[var(--panel)]"
                                    : "text-[var(--muted)]",
                                )}
                              >
                                {payload.value}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(148,163,184,0.12)", radius: 12 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload as (typeof missingCats)[0];
                        return (
                          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm shadow-lg">
                            <p className="font-semibold">{row.label}</p>
                            <p className="text-[var(--muted)]">{row.count} variables</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={48}>
                      {missingCats.map((row, i) => (
                        <Cell
                          key={row.label}
                          fill={i === activeMissing ? "#2d5bff" : "#93a8ff"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="amplo-card overflow-hidden !p-0">
              <div className="border-b border-[var(--border)] px-5 py-4">
                <h2 className="font-display text-lg font-semibold">Top missing features</h2>
                <p className="text-sm text-[var(--muted)]">From early missing-value summary</p>
              </div>
              <ul className="max-h-[400px] divide-y divide-[var(--border)] overflow-auto">
                {topMissing.length ? (
                  topMissing.map((row, i) => (
                    <li
                      key={`${row.name}-${i}`}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--panel-strong)] text-xs font-semibold tabular-nums">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{row.name}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {Number.isFinite(row.pct) ? `${row.pct.toFixed(1)}%` : "—"}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="px-5 py-6 text-sm text-[var(--muted)]">
                    No top-missing table rows returned.
                  </li>
                )}
              </ul>
            </article>
          </div>

          <section className="rounded-[1.75rem] border border-[var(--warning-border)] bg-[var(--warning-bg)] p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning-icon)]" />
              <p className="text-sm leading-relaxed text-[var(--warning-text)]">
                Structural skip patterns and questionnaire missingness are intentional in NHANES.
                Treat high missingness as a design signal, not only as data quality noise.
              </p>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "links" ? (
        <div className="space-y-4">
          <article className="amplo-card p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-blue-600" />
                  <h2 className="font-display text-xl font-semibold">Strong correlations</h2>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Top |Pearson r| pairs · hover to select · correlation ≠ causation
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[#2d5bff]" />
                  |r|
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded-full bg-[var(--foreground)]" />
                  Cumulative share
                </span>
              </div>
            </div>

            <div
              className="mt-5 h-[400px]"
              role="img"
              aria-label="Bar chart of strong numerical correlations"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={corrRows.map((row, i, arr) => {
                    const totalAbs = arr.reduce((s, r) => s + r.abs, 0) || 1;
                    const cumulative =
                      (arr.slice(0, i + 1).reduce((s, r) => s + r.abs, 0) / totalAbs) * 100;
                    return { ...row, cumulative };
                  })}
                  margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
                  onMouseMove={(state) => {
                    if (state?.activeTooltipIndex == null) return;
                    const idx = Number(state.activeTooltipIndex);
                    if (!Number.isNaN(idx)) setActiveCorr(idx);
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="pair"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    height={54}
                    tick={({ x, y, payload, index }) => {
                      const on = index === activeCorr;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <foreignObject x={-40} y={2} width={80} height={44}>
                            <div
                              className={cn(
                                "flex h-full items-center justify-center rounded-full px-1 text-center text-[10px] font-medium leading-tight",
                                on
                                  ? "bg-[var(--foreground)] text-[var(--panel)]"
                                  : "text-[var(--muted)]",
                              )}
                            >
                              {payload.value}
                            </div>
                          </foreignObject>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    yAxisId="abs"
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 1]}
                    tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="share"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(148,163,184,0.12)", radius: 12 }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload as (typeof corrRows)[0] & {
                        cumulative: number;
                      };
                      return (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm shadow-lg">
                          <p className="font-semibold">{row.full}</p>
                          <p className="mt-1 text-[var(--muted)]">
                            r = {row.value.toFixed(4)} · |r| = {row.abs.toFixed(4)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    yAxisId="abs"
                    dataKey="abs"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={40}
                    onClick={(_, index) => setActiveCorr(index)}
                  >
                    {corrRows.map((row, i) => (
                      <Cell
                        key={row.id}
                        fill={i === activeCorr ? "#2d5bff" : "#93a8ff"}
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="share"
                    type="monotone"
                    dataKey="cumulative"
                    stroke="var(--foreground)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {selectedCorr ? (
              <div className="mt-4 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                    Selected pair
                  </p>
                  <p className="mt-1 text-sm font-semibold">{selectedCorr.full}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                    Correlation
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold tabular-nums">
                    {selectedCorr.value.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">|r|</p>
                  <p className="mt-1 font-display text-xl font-semibold tabular-nums">
                    {selectedCorr.abs.toFixed(4)}
                  </p>
                </div>
              </div>
            ) : null}
          </article>

          <article className="amplo-card overflow-hidden !p-0">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="font-display text-lg font-semibold">Correlation table</h2>
              <p className="text-sm text-[var(--muted)]">{analysis.disclaimer}</p>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <caption className="sr-only">Strong numerical feature correlations</caption>
                <thead className="bg-[var(--panel-strong)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Feature 1
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Feature 2
                    </th>
                    <th scope="col" className="px-4 py-3">
                      r
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {corrRows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-t border-[var(--border)] cursor-pointer",
                        activeCorr === row.id && "bg-blue-600/5",
                      )}
                      onClick={() => setActiveCorr(row.id)}
                    >
                      <td className="px-4 py-3 font-medium">{row.f1}</td>
                      <td className="px-4 py-3 font-medium">{row.f2}</td>
                      <td className="px-4 py-3 tabular-nums text-[var(--muted)]">
                        {row.value.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
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
  icon: typeof Activity;
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
