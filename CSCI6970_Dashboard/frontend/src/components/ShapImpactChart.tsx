"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

type ShapRow = {
  Feature: string;
  Mean_ABS_SHAP: number;
};

type ChartRow = {
  key: string;
  label: string;
  short: string;
  impact: number;
  share: number;
  cumulative: number;
};

function cleanName(raw: string) {
  return raw.replace(/^categorical__|^numerical__|^ordinal__/, "");
}

function shortLabel(raw: string) {
  const cleaned = cleanName(raw);
  return cleaned.length > 10 ? `${cleaned.slice(0, 9)}…` : cleaned;
}

export function ShapImpactChart({ rows }: { rows: ShapRow[] }) {
  const data = useMemo(() => {
    const top = rows.slice(0, 12);
    const total = top.reduce((sum, row) => sum + row.Mean_ABS_SHAP, 0) || 1;
    let running = 0;
    return top.map((row): ChartRow => {
      const impact = row.Mean_ABS_SHAP;
      running += impact;
      return {
        key: row.Feature,
        label: cleanName(row.Feature),
        short: shortLabel(row.Feature),
        impact,
        share: (impact / total) * 100,
        cumulative: (running / total) * 100,
      };
    });
  }, [rows]);

  const [active, setActive] = useState(0);
  const selected = data[active] ?? data[0];

  return (
    <article className="amplo-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Impact by feature</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Mean |SHAP| for the top drivers · cumulative share as the net line
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#5b7cff]" />
            Impact
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full bg-[var(--foreground)]" />
            Cumulative
          </span>
        </div>
      </div>

      <div
        className="chart-frame chart-frame-tall mt-5"
        role="img"
        aria-label="Interactive chart of mean absolute SHAP impact by feature"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 16, right: 18, left: 4, bottom: 24 }}
            onMouseMove={(state) => {
              if (state?.activeTooltipIndex == null) return;
              const idx = Number(state.activeTooltipIndex);
              if (!Number.isNaN(idx)) setActive(idx);
            }}
          >
            <defs>
              <linearGradient id="shapImpactFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2d5bff" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#7b93ff" stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="short"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={44}
              tick={({ x, y, payload, index }) => {
                const isActive = index === active;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-30} y={2} width={60} height={30}>
                      <div
                        className={cn(
                          "flex h-full items-center justify-center rounded-full px-2 text-[11px] font-medium",
                          isActive
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
              yAxisId="impact"
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
            />
            <YAxis
              yAxisId="share"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={40}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.14)", radius: 14 }}
              content={({ active: tipActive, payload }) => {
                if (!tipActive || !payload?.length) return null;
                const row = payload[0]?.payload as ChartRow;
                return (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm shadow-lg">
                    <p className="font-semibold">{row.label}</p>
                    <p className="mt-1 text-[var(--muted)]">
                      Impact {row.impact.toFixed(4)} · share {row.share.toFixed(1)}%
                    </p>
                    <p className="text-[var(--muted)]">
                      Cumulative {row.cumulative.toFixed(1)}%
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              yAxisId="impact"
              dataKey="impact"
              name="Impact"
              maxBarSize={40}
              radius={[10, 10, 0, 0]}
              onClick={(_, index) => setActive(index)}
            >
              {data.map((row, index) => (
                <Cell
                  key={row.key}
                  fill={index === active ? "#2d5bff" : "url(#shapImpactFill)"}
                  fillOpacity={index === active ? 1 : 0.55}
                />
              ))}
            </Bar>
            <Line
              yAxisId="share"
              type="monotone"
              dataKey="cumulative"
              name="Cumulative"
              stroke="var(--foreground)"
              strokeWidth={2.75}
              dot={false}
              activeDot={{ r: 5, fill: "var(--foreground)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {selected ? (
        <div className="mt-4 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
              Selected feature
            </p>
            <p className="mt-1 text-sm font-semibold">{selected.label}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
              Mean |SHAP|
            </p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums">
              {selected.impact.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
              Cumulative
            </p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums">
              {selected.cumulative.toFixed(1)}%
            </p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
