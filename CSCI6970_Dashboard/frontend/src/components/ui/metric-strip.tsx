import { cn } from "@/lib/utils";

export type MetricItem = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "warn";
};

export function MetricStrip({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 panel-lift transition hover:-translate-y-0.5",
            item.tone === "accent" && "ring-1 ring-sky-500/20",
            item.tone === "warn" && "ring-1 ring-amber-500/20",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {item.label}
          </p>
          <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] xl:text-[1.75rem]">
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
