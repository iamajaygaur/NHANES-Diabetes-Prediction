import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  detail,
  className,
}: {
  value: number;
  label: string;
  detail?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-end justify-between gap-3 text-sm">
        <span className="font-medium text-[var(--foreground)]">{label}</span>
        <span className="tabular-nums text-[var(--muted)]">
          {detail ?? `${pct.toFixed(1)}%`}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
