"use client";

import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AmploSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Stretch to parent width (forms). Default true. */
  fullWidth?: boolean;
};

/**
 * Amplo pill select — soft surface, muted label color, custom chevron.
 * Use for every native dropdown in the app.
 */
export function AmploSelect({
  className,
  fullWidth = true,
  children,
  ...props
}: AmploSelectProps) {
  return (
    <div className={cn("relative inline-flex", fullWidth ? "w-full" : "w-auto")}>
      <select
        {...props}
        className={cn(
          "amplo-select appearance-none truncate pr-9 outline-none",
          "focus-visible:ring-2 focus-visible:ring-blue-500/35",
          fullWidth ? "w-full" : "min-w-[7.5rem]",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]"
      />
    </div>
  );
}
