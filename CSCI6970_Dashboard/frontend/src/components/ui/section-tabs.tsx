"use client";

import { cn } from "@/lib/utils";

export function SectionTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string; count?: string | number }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] ring-1 ring-sky-500/25"
                : "text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)] dark:hover:bg-white/5",
            )}
          >
            {tab.label}
            {tab.count != null ? (
              <span className="ml-2 rounded-full bg-black/5 px-1.5 py-0.5 text-[11px] dark:bg-white/10">
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
