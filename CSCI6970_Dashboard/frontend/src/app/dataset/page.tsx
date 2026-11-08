"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Play, Ruler } from "lucide-react";
import { PackCard, PackRow } from "@/components/PackCard";
import { ErrorState, LoadingState } from "@/components/States";
import { apiGet } from "@/lib/api";
import { FEATURE_PACKS } from "@/lib/feature-packs";
import { cn, num } from "@/lib/utils";

type Summary = {
  rows: number;
  columns: number;
  predictor_features: number;
  target: string;
  feature_type_counts: { numerical: number; categorical: number; ordinal: number };
  overall_missing_pct: number;
  top_missing_features: { feature: string; missing_pct: number }[];
};

type Feature = {
  name: string;
  description: string;
  feature_type: string;
  dtype: string;
  missing_pct: number;
  n_unique: number;
  stats?: Record<string, number | null>;
  categories?: { value: string | number; count: number }[];
};

const TYPE_PACKS = [
  {
    id: "numerical",
    title: "Numerical",
    blurb: "Continuous measures and vitals",
    ring: "#0ea5e9",
    tint: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  {
    id: "categorical",
    title: "Categorical",
    blurb: "Questionnaire codes and classes",
    ring: "#f59e0b",
    tint: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  },
  {
    id: "ordinal",
    title: "Ordinal",
    blurb: "Ordered levels and scales",
    ring: "#14b8a6",
    tint: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  },
] as const;

export default function DatasetPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [tab, setTab] = useState<"tracks" | "types">("tracks");
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Feature | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<Summary>("/api/dataset/summary"),
      apiGet<{ features: Feature[] }>("/api/dataset/features"),
    ])
      .then(([s, f]) => {
        setSummary(s);
        setFeatures(f.features);
        // Start with nothing reviewed — user clicks a row to mark it seen
        setSelected(null);
        setSeen({});
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const trackCards = useMemo(() => {
    return FEATURE_PACKS.map((track) => {
      const items = features.filter((f) => track.match(f.name));
      const reviewed = items.filter((f) => seen[f.name]).length;
      return { ...track, items, reviewed };
    }).filter((t) => t.items.length > 0);
  }, [features, seen]);

  const typeCards = useMemo(() => {
    return TYPE_PACKS.map((d) => {
      const items = features.filter((f) => f.feature_type === d.id);
      const reviewed = items.filter((f) => seen[f.name]).length;
      return { ...d, items, reviewed, icon: Ruler };
    }).filter((t) => t.items.length > 0);
  }, [features, seen]);

  const cards = tab === "tracks" ? trackCards : typeCards;

  const upNext = useMemo(() => {
    const pool = summary?.top_missing_features?.length
      ? summary.top_missing_features
          .map((m) => features.find((f) => f.name === m.feature))
          .filter(Boolean)
      : features;
    return (pool as Feature[]).find((f) => !seen[f.name]) ?? features[0] ?? null;
  }, [features, seen, summary]);

  const reviewedCount = useMemo(
    () => features.filter((f) => seen[f.name]).length,
    [features, seen],
  );

  function openFeature(f: Feature) {
    setSelected(f);
    setSeen((prev) => ({ ...prev, [f.name]: true }));
  }

  if (error) return <ErrorState message={error} />;
  if (!summary) return <LoadingState />;

  return (
    <div className="page-stack min-w-0 fade-in">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h1 className="break-words font-display text-[1.55rem] font-semibold tracking-tight sm:text-[2.15rem]">
            Dataset
          </h1>
          <p className="mt-3 text-[1.1rem] leading-relaxed text-[var(--muted)]">
            {reviewedCount} of {summary.predictor_features} predictors reviewed.{" "}
            {num(summary.rows)} participants · target {summary.target} · avg missing{" "}
            {summary.overall_missing_pct.toFixed(1)}%. Same packs as Predict.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--panel)] p-1">
          <button
            type="button"
            onClick={() => setTab("tracks")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              tab === "tracks"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-[var(--muted)]",
            )}
          >
            Tracks
          </button>
          <button
            type="button"
            onClick={() => setTab("types")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              tab === "types"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-[var(--muted)]",
            )}
          >
            Types
          </button>
        </div>
      </section>

      {upNext ? (
        <button
          type="button"
          onClick={() => openFeature(upNext)}
          className="amplo-card flex w-full items-center gap-4 !p-4 text-left transition hover:ring-2 hover:ring-blue-500/30 sm:!p-5"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
            <Play className="h-5 w-5 fill-current" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-sm text-[var(--muted)]">
              Up next · {upNext.missing_pct.toFixed(1)}% missing
            </span>
            <span className="mt-0.5 block truncate font-display text-xl font-semibold">
              {upNext.description || upNext.name}
            </span>
            <span className="text-sm text-[var(--muted)]">{upNext.name}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[var(--muted)]" />
        </button>
      ) : null}

      <div className="page-grid min-w-0 2xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="page-grid min-w-0 md:grid-cols-2">
          {cards.map((card) => {
            const Icon = "icon" in card ? card.icon : Ruler;
            return (
              <PackCard
                key={card.id}
                title={card.title}
                subtitle={card.blurb}
                ring={card.ring}
                tint={card.tint}
                icon={Icon}
                done={card.reviewed}
                total={card.items.length}
              >
                <ul className="space-y-0.5">
                  {card.items.slice(0, 4).map((f, idx) => (
                    <li key={f.name}>
                      <PackRow
                        index={idx + 1}
                        done={Boolean(seen[f.name])}
                        title={f.description || f.name}
                        meta={`${f.name} · ${f.missing_pct.toFixed(1)}% missing`}
                        active={selected?.name === f.name}
                        ring={card.ring}
                        onClick={() => openFeature(f)}
                      />
                    </li>
                  ))}
                  {card.items.length > 4 ? (
                    <li className="px-3 py-2 text-xs text-[var(--muted)]">
                      +{card.items.length - 4} more in this{" "}
                      {tab === "tracks" ? "track" : "type"}
                    </li>
                  ) : null}
                </ul>
              </PackCard>
            );
          })}
        </div>

        <div className="page-stack min-w-0 !gap-[var(--section-gap)] 2xl:sticky 2xl:top-28 2xl:self-start">
          <article className="amplo-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Missingness board</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Highest missing rates in the modeling table
            </p>
            <ol className="mt-4 space-y-2">
              {summary.top_missing_features.slice(0, 6).map((row, i) => {
                const feature = features.find((f) => f.name === row.feature);
                return (
                  <li key={row.feature}>
                    <button
                      type="button"
                      onClick={() => feature && openFeature(feature)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2.5 text-left hover:border-blue-500/30"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--panel)] text-sm font-semibold tabular-nums">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{row.feature}</span>
                        <span className="text-xs text-[var(--muted)]">
                          {feature?.description || "Predictor"}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {row.missing_pct.toFixed(1)}%
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </article>

          <article className="amplo-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">
              {selected?.name ?? "Feature detail"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {selected?.description || "Pick a feature from a track."}
            </p>
            {selected ? (
              <div className="mt-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Meta label="Type" value={selected.feature_type} />
                  <Meta label="dtype" value={selected.dtype} />
                  <Meta label="Unique" value={String(selected.n_unique)} />
                  <Meta label="Missing %" value={selected.missing_pct.toFixed(2)} />
                </div>
                {selected.stats ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selected.stats).map(([k, v]) => (
                      <Meta
                        key={k}
                        label={k}
                        value={v == null ? "—" : Number(v).toFixed(2)}
                      />
                    ))}
                  </div>
                ) : null}
                {selected.categories ? (
                  <div className="max-h-48 space-y-1 overflow-auto">
                    {selected.categories.slice(0, 8).map((c) => (
                      <div
                        key={String(c.value)}
                        className="flex justify-between rounded-xl bg-[var(--panel-strong)] px-3 py-2"
                      >
                        <span className="truncate">{String(c.value)}</span>
                        <span className="text-[var(--muted)]">{num(c.count)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-[var(--foreground)]">{value}</p>
    </div>
  );
}
