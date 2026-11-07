import { cn } from "@/lib/utils";

/** Percent ring used in Predict result cards. */
export function ProgressRing({
  value,
  color,
  label,
  size = "md",
}: {
  value: number;
  color: string;
  label: string;
  size?: "sm" | "md";
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  const box = size === "sm" ? "h-[72px] w-[72px]" : "h-[112px] w-[112px]";
  const valueClass =
    size === "sm"
      ? "font-display text-sm font-semibold tabular-nums leading-none"
      : "font-display text-xl font-semibold tabular-nums leading-none";
  return (
    <div className={cn("relative shrink-0", box)}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={valueClass}>{Math.round(value)}%</span>
        <span className="mt-0.5 text-[9px] text-[var(--muted)]">{label}</span>
      </div>
    </div>
  );
}

/** Compact done/total ring shared by Dataset + Predict pack headers. */
export function FractionRing({
  done,
  total,
  color,
}: {
  done: number;
  total: number;
  color: string;
}) {
  const pct = total ? done / total : 0;
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - pct * c;
  return (
    <div className="relative h-12 w-12 shrink-0" aria-label={`${done} of ${total}`}>
      <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums">
        {done}/{total}
      </span>
    </div>
  );
}
