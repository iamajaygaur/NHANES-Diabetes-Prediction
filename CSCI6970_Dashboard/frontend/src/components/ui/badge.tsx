import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "blue" | "teal" | "amber" | "rose";
}) {
  const tones = {
    neutral:
      "bg-slate-500/10 text-slate-700 border-slate-300/60 dark:bg-white/5 dark:text-slate-200 dark:border-white/10",
    blue:
      "bg-sky-500/15 text-sky-800 border-sky-400/40 dark:text-sky-200 dark:border-sky-400/20",
    teal:
      "bg-teal-500/15 text-teal-800 border-teal-400/40 dark:text-teal-200 dark:border-teal-400/20",
    amber:
      "bg-amber-500/15 text-amber-900 border-amber-400/40 dark:text-amber-200 dark:border-amber-400/20",
    rose:
      "bg-rose-500/15 text-rose-900 border-rose-400/40 dark:text-rose-200 dark:border-rose-400/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
