import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("transition duration-300 hover:border-sky-400/30", className)}>
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          {label}
        </p>
        <p className="mt-3.5 font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          {value}
        </p>
        {hint ? <p className="mt-2.5 text-xs text-[var(--muted)]">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
