"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Check, ChevronRight, type LucideIcon } from "lucide-react";
import { FractionRing } from "@/components/ProgressRing";
import { cn } from "@/lib/utils";

type PackCardProps = {
  title: string;
  subtitle: string;
  ring: string;
  tint: string;
  icon: LucideIcon;
  done: number;
  total: number;
  selected?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
};

/**
 * Amplo Learn-track card — soft icon tile, title/blurb, fraction ring, checklist rows.
 * Shared by Dataset tracks and Predict packs.
 */
export function PackCard({
  title,
  subtitle,
  ring,
  tint,
  icon: Icon,
  done,
  total,
  selected = false,
  onClick,
  children,
  className,
}: PackCardProps) {
  const Wrapper = onClick ? "button" : "article";

  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "amplo-card amplo-card-clip flex w-full min-w-0 flex-col !p-0 text-left transition",
        onClick && "hover:ring-2 hover:ring-blue-500/25",
        selected && "ring-2 ring-blue-500/70",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              tint,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold leading-tight">
              {title}
            </p>
            <p className="mt-1 break-words text-sm text-[var(--muted)]">{subtitle}</p>
          </div>
        </div>
        <FractionRing done={done} total={total} color={ring} />
      </div>

      <div className="mt-3.5 flex-1 px-3 pb-4 sm:px-3.5 sm:pb-5">{children}</div>
    </Wrapper>
  );
}

type PackRowProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  index: number;
  done?: boolean;
  title: string;
  meta: string;
  active?: boolean;
  ring?: string;
};

/** Checklist row inside a PackCard (numbered / checked + chevron). */
export function PackRow({
  index,
  done = false,
  title,
  meta,
  active = false,
  ring,
  className,
  ...props
}: PackRowProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition",
        active ? "bg-blue-600/10" : "hover:bg-[var(--panel-strong)]",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          done
            ? "bg-blue-600 text-white"
            : "border border-[var(--border)] bg-[var(--panel)] text-[var(--muted)]",
        )}
        style={
          !done && ring
            ? { borderColor: ring, color: ring }
            : undefined
        }
      >
        {done ? <Check className="h-3.5 w-3.5" /> : index}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-[var(--foreground)]">
          {title}
        </span>
        <span className="block truncate text-xs text-[var(--muted)]">{meta}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
    </button>
  );
}
