"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Play } from "lucide-react";
import { AmploSelect } from "@/components/AmploSelect";
import { Disclaimer } from "@/components/Disclaimer";
import { PackCard, PackRow } from "@/components/PackCard";
import { ProgressRing } from "@/components/ProgressRing";
import { ErrorState, LoadingState } from "@/components/States";
import { apiGet, apiPost } from "@/lib/api";
import {
  featureLabel,
  optionLabel,
  stripPipelineFeatureName,
} from "@/lib/feature-labels";
import { FEATURE_PACKS } from "@/lib/feature-packs";
import { cn, pct } from "@/lib/utils";

type Schema = {
  model_name: string;
  threshold: number;
  feature_names: string[];
  feature_groups: {
    numerical: string[];
    categorical: string[];
    ordinal: string[];
  };
  categorical_options: Record<string, Array<string | number>>;
  ordinal_options: Record<string, Array<string | number>>;
  numerical_ranges: Record<string, { min: number; max: number; median: number; mean: number }>;
  synthetic_demo: Record<string, string | number | null>;
  feature_descriptions?: Record<string, string>;
};

type ShapContribution = {
  feature: string;
  shap_value: number;
  abs_shap: number;
  direction: string;
};

type PredictResponse = {
  predicted_class: number;
  probability: number;
  threshold: number;
  model: string;
  interpretation: string;
  disclaimer: string;
  shap_base_value?: number | null;
  shap_top?: ShapContribution[] | null;
  shap_note?: string | null;
};

const UNITS: Record<string, string> = {
  RIDAGEYR: "years",
  BMXBMI: "kg/m²",
  BMXWT: "kg",
  BMXHT: "cm",
  BMXWAIST: "cm",
  BPXOSY1: "mm Hg",
  BPXOSY2: "mm Hg",
  BPXOSY3: "mm Hg",
  BPXODI1: "mm Hg",
  BPXODI2: "mm Hg",
  BPXODI3: "mm Hg",
  BPXOPLS1: "bpm",
  BPXOPLS2: "bpm",
  BPXOPLS3: "bpm",
  PAD800: "minutes",
  PAD820: "minutes",
  PAD680: "minutes",
};

export default function PredictPage() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [tab, setTab] = useState<"packs" | "result">("packs");
  const [activeId, setActiveId] = useState("demo");

  useEffect(() => {
    apiGet<Schema>("/api/model/schema")
      .then((s) => {
        setSchema(s);
        // Start blank on every load — user fills packs or clicks "Load demo pack"
        const init: Record<string, string> = {};
        for (const name of s.feature_names) init[name] = "";
        setValues(init);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const groupLookup = useMemo(() => {
    if (!schema) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const [group, cols] of Object.entries(schema.feature_groups)) {
      for (const c of cols) map[c] = group;
    }
    return map;
  }, [schema]);

  const descriptions = schema?.feature_descriptions ?? {};

  const sectionStats = useMemo(() => {
    return FEATURE_PACKS.map((section) => {
      const filled = section.keys.filter((k) => (values[k] ?? "").trim() !== "").length;
      const total = section.keys.length;
      const pctReady = total ? (filled / total) * 100 : 0;
      return { ...section, filled, total, pctReady, left: total - filled };
    });
  }, [values]);

  const overall = useMemo(() => {
    const total = sectionStats.reduce((s, x) => s + x.total, 0);
    const filled = sectionStats.reduce((s, x) => s + x.filled, 0);
    return { total, filled, pct: total ? (filled / total) * 100 : 0 };
  }, [sectionStats]);

  const active = sectionStats.find((s) => s.id === activeId) ?? sectionStats[0];
  const ActiveIcon = active.icon;

  function setField(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function loadSyntheticDemo() {
    if (!schema) return;
    const init: Record<string, string> = {};
    for (const name of schema.feature_names) {
      const demo = schema.synthetic_demo?.[name];
      init[name] = demo == null ? "" : String(demo);
    }
    setValues(init);
    setResult(null);
    setFormError(null);
    setTab("packs");
  }

  function clearForm() {
    if (!schema) return;
    const init: Record<string, string> = {};
    for (const name of schema.feature_names) init[name] = "";
    setValues(init);
    setResult(null);
    setFormError(null);
  }

  async function onSubmit() {
    if (!schema) return;
    setLoading(true);
    setFormError(null);
    try {
      const features: Record<string, string | number | null> = {};
      for (const name of schema.feature_names) {
        const raw = values[name]?.trim() ?? "";
        if (raw === "") {
          features[name] = null;
          continue;
        }
        const group = groupLookup[name];
        if (group === "numerical" || group === "ordinal") {
          const num = Number(raw);
          if (Number.isNaN(num)) {
            throw new Error(`Invalid numeric value for ${featureLabel(name, descriptions)}`);
          }
          features[name] = num;
        } else {
          const asNum = Number(raw);
          features[name] = Number.isNaN(asNum) || raw.startsWith("b'") ? raw : asNum;
        }
      }
      const res = await apiPost<PredictResponse>("/api/predict", {
        features,
        include_shap: true,
      });
      setResult(res);
      setTab("result");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Prediction failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!schema || !active) return <LoadingState label="Loading model schema…" />;

  return (
    <div className="min-w-0 space-y-6 fade-in">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h1 className="font-display text-[2.4rem] font-semibold tracking-tight sm:text-[2.75rem]">
            Prediction studio
          </h1>
          <p className="mt-3 text-[1.1rem] leading-relaxed text-[var(--muted)]">
            Build a synthetic profile across six feature packs, then run the saved Tuned XGBoost
            pipeline. Missing values use trained imputation. Academic demo only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadSyntheticDemo}
            className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium"
          >
            Load demo pack
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 disabled:opacity-60"
          >
            <Play className="h-4 w-4 fill-current" />
            {loading ? "Running…" : "Run prediction"}
          </button>
        </div>
      </section>

      <Disclaimer compact />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--panel)] p-1">
          <button
            type="button"
            onClick={() => setTab("packs")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
              tab === "packs"
                ? "bg-blue-600 text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            Feature packs
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                tab === "packs" ? "bg-white/20" : "bg-blue-600/10 text-blue-700 dark:text-blue-300",
              )}
            >
              {sectionStats.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("result")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              tab === "result"
                ? "bg-blue-600 text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            Result
          </button>
        </div>
        <p className="text-sm text-[var(--muted)]">
          {overall.filled}/{overall.total} fields filled · {Math.round(overall.pct)}% ready ·{" "}
          {schema.model_name} · thr {schema.threshold.toFixed(2)}
        </p>
      </div>

      {formError ? (
        <div
          role="alert"
          className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]"
        >
          {formError}
        </div>
      ) : null}

      {tab === "packs" ? (
        <div className="space-y-5">
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {sectionStats.map((section) => {
              const Icon = section.icon;
              return (
                <PackCard
                  key={section.id}
                  title={section.title}
                  subtitle={section.blurb}
                  ring={section.ring}
                  tint={section.tint}
                  icon={Icon}
                  done={section.filled}
                  total={section.total}
                  selected={section.id === activeId}
                >
                  <ul className="space-y-0.5">
                    {section.keys.slice(0, 4).map((key, idx) => {
                      const filled = (values[key] ?? "").trim() !== "";
                      return (
                        <li key={key}>
                          <PackRow
                            index={idx + 1}
                            done={filled}
                            title={featureLabel(key, descriptions)}
                            meta={`${key} · edit pack`}
                            active={section.id === activeId && filled}
                            ring={section.ring}
                            onClick={() => setActiveId(section.id)}
                          />
                        </li>
                      );
                    })}
                    {section.keys.length > 4 ? (
                      <li>
                        <PackRow
                          index={5}
                          title={`+${section.keys.length - 4} more fields`}
                          meta="Open pack to edit all"
                          ring={section.ring}
                          onClick={() => setActiveId(section.id)}
                        />
                      </li>
                    ) : null}
                  </ul>
                </PackCard>
              );
            })}
          </div>

          <article className="amplo-card flex flex-col !p-0">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    active.tint,
                  )}
                >
                  <ActiveIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-[var(--muted)]">Editing pack</p>
                  <h2 className="font-display text-xl font-semibold sm:text-2xl">{active.title}</h2>
                  <p className="text-sm text-[var(--muted)]">
                    {active.filled}/{active.total} filled · labels shown, NHANES codes sent to API
                  </p>
                </div>
              </div>
              <ProgressRing value={active.pctReady} color={active.ring} label="pack" />
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
              {active.keys.map((name) => {
                const group = groupLookup[name];
                const unit = UNITS[name];
                const range = schema.numerical_ranges?.[name];
                const label = featureLabel(name, descriptions);
                const fieldId = `feature-${name}`;
                const filled = (values[name] ?? "").trim() !== "";

                if (group === "categorical" || group === "ordinal") {
                  const options =
                    group === "categorical"
                      ? schema.categorical_options[name] ?? []
                      : schema.ordinal_options[name] ?? [];
                  return (
                    <div
                      key={name}
                      className={cn(
                        "rounded-2xl border px-3 py-3",
                        filled
                          ? "border-blue-500/25 bg-blue-500/[0.04]"
                          : "border-[var(--border)] bg-[var(--panel-strong)]",
                      )}
                    >
                      <label htmlFor={fieldId} className="mb-1.5 flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-[11px] text-[var(--muted)]">
                          {name} · {group}
                        </span>
                      </label>
                      <AmploSelect
                        id={fieldId}
                        value={values[name] ?? ""}
                        onChange={(e) => setField(name, e.target.value)}
                      >
                        <option value="">Missing / leave blank</option>
                        {options.map((opt) => (
                          <option key={String(opt)} value={String(opt)}>
                            {optionLabel(opt)}
                          </option>
                        ))}
                      </AmploSelect>
                    </div>
                  );
                }

                return (
                  <div
                    key={name}
                    className={cn(
                      "rounded-2xl border px-3 py-3",
                      filled
                        ? "border-blue-500/25 bg-blue-500/[0.04]"
                        : "border-[var(--border)] bg-[var(--panel-strong)]",
                    )}
                  >
                    <label htmlFor={fieldId} className="mb-1.5 flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {label}
                        {unit ? <span className="text-[var(--muted)]"> ({unit})</span> : null}
                      </span>
                      <span className="text-[11px] text-[var(--muted)]">{name} · numerical</span>
                    </label>
                    <input
                      id={fieldId}
                      type="number"
                      step="any"
                      value={values[name] ?? ""}
                      onChange={(e) => setField(name, e.target.value)}
                      placeholder={
                        range ? `${range.min.toFixed(1)} – ${range.max.toFixed(1)}` : "Optional"
                      }
                      className="amplo-field w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                    />
                    {range ? (
                      <span className="mt-1 block text-[11px] text-[var(--muted)]">
                        Cohort {range.min.toFixed(1)}–{range.max.toFixed(1)} · median{" "}
                        {range.median.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4">
              <span className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    active.left === 0 ? "bg-emerald-500" : "bg-amber-500",
                  )}
                />
                {active.left === 0
                  ? "Pack complete — blanks still allowed at predict time"
                  : `${active.left} fields still empty`}
              </span>
              <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Run prediction
              </button>
            </div>
          </article>
        </div>
      ) : (
        <div className="space-y-4" aria-live="polite">
          {!result ? (
            <article className="amplo-card p-8 text-center">
              <p className="font-display text-xl font-semibold">No result yet</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Fill packs or load the synthetic demo, then run prediction.
              </p>
              <button
                type="button"
                onClick={() => setTab("packs")}
                className="mt-5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Back to feature packs
              </button>
            </article>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <article className="amplo-card flex flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-[var(--muted)]">{result.model}</p>
                      <h2 className="mt-1 font-display text-2xl font-semibold">
                        {result.predicted_class === 1 ? "Diabetes class" : "Non-diabetes class"}
                      </h2>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        result.predicted_class === 1
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                      )}
                    >
                      {result.predicted_class === 1 ? "Positive" : "Negative"}
                    </span>
                  </div>
                  <div className="mt-6 flex items-center justify-center">
                    <ProgressRing
                      value={result.probability * 100}
                      color={result.predicted_class === 1 ? "#f43f5e" : "#10b981"}
                      label="probability"
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-3">
                      <p className="text-[11px] text-[var(--muted)]">Probability</p>
                      <p className="font-display text-xl font-semibold">{pct(result.probability)}</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-3">
                      <p className="text-[11px] text-[var(--muted)]">Threshold</p>
                      <p className="font-display text-xl font-semibold">
                        {result.threshold.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[var(--foreground)]">{result.interpretation}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{result.disclaimer}</p>
                </article>

                {result.shap_top && result.shap_top.length > 0 ? (
                  <article className="amplo-card p-5 sm:p-6">
                    <h2 className="font-display text-lg font-semibold">Local SHAP drivers</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Top contributions for this synthetic run
                      {result.shap_base_value != null
                        ? ` · base ${result.shap_base_value.toFixed(4)}`
                        : ""}
                    </p>
                    <div
                      className="mt-4 h-[340px]"
                      role="img"
                      aria-label="Bar chart of local SHAP feature contributions"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={result.shap_top.map((row) => ({
                            feature: stripPipelineFeatureName(row.feature),
                            value: row.shap_value,
                          }))}
                          layout="vertical"
                          margin={{ left: 16, right: 12 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis type="number" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} />
                          <YAxis
                            type="category"
                            dataKey="feature"
                            width={140}
                            tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                          />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                            {result.shap_top.map((row) => (
                              <Cell
                                key={row.feature}
                                fill={row.shap_value >= 0 ? "#f43f5e" : "#0ea5e9"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {result.shap_note ? (
                      <p className="mt-3 text-sm text-[var(--muted)]">{result.shap_note}</p>
                    ) : null}
                  </article>
                ) : null}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
