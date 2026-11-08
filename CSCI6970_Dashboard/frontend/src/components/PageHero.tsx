import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  description,
  actions,
  meta,
  className,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0 max-w-4xl">
        <h1 className="break-words font-display text-[1.55rem] font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.15rem]">
          {title}
        </h1>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--muted)] sm:text-[1rem]">
          {description}
        </p>
        {meta ? <div className="mt-2.5 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </section>
  );
}

export function HeroLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-sm",
        primary
          ? "bg-blue-600 font-semibold text-white shadow-blue-600/25"
          : "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)]",
      )}
    >
      {children}
      {primary ? <ArrowRight className="h-4 w-4" /> : null}
    </Link>
  );
}
