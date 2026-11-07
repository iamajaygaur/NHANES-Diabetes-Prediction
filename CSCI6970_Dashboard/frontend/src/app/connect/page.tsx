import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Code2,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { CREATOR, SITE } from "@/lib/site";

const LINKS = [
  {
    id: "github",
    title: "GitHub",
    detail: "Code, notebooks, and project history",
    href: CREATOR.links.github,
    icon: Code2,
    tint: "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    detail: "Professional profile and updates",
    href: CREATOR.links.linkedin,
    icon: UserRound,
    tint: "bg-[#0a66c2] text-white",
  },
] as const;

export default function ConnectPage() {
  return (
    <div className="page-stack min-w-0 fade-in">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h1 className="font-display text-[2.4rem] font-semibold tracking-tight sm:text-[2.75rem]">
            Get connected
          </h1>
          <p className="mt-3 text-[1.1rem] leading-relaxed text-[var(--muted)]">
            Meet the person behind {SITE.productName} — researched and developed
            end-to-end by {CREATOR.name}.
          </p>
        </div>
        <a
          href={CREATOR.links.linkedin}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25"
        >
          Connect on LinkedIn
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </section>

      <article className="amplo-card !p-6 sm:!p-8 lg:!p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <span className="relative mx-auto h-48 w-48 shrink-0 overflow-hidden rounded-[2rem] shadow-xl shadow-blue-600/20 ring-4 ring-white/90 dark:ring-white/10 sm:h-56 sm:w-56 lg:mx-0 lg:h-64 lg:w-64">
            <Image
              src={CREATOR.photo}
              alt={CREATOR.name}
              fill
              sizes="(max-width: 1024px) 224px, 256px"
              className="object-cover object-top"
              priority
            />
          </span>
          <div className="min-w-0 flex-1 text-center lg:text-left">
            <p className="text-base font-medium text-[var(--muted)]">{CREATOR.role}</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {CREATOR.name}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg lg:mx-0">
              {CREATOR.tagline}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="rounded-full bg-blue-600/10 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300">
                {SITE.productName}
              </span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-1.5 text-sm font-medium text-[var(--muted)]">
                NHANES · XGBoost · SHAP
              </span>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Official research", value: SITE.researchTitle },
                { label: "Product", value: SITE.productName },
                { label: "Data source", value: SITE.source },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-4 text-left"
                >
                  <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                    {row.label}
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-snug sm:text-base">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      <article className="amplo-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h2 className="font-display text-lg font-semibold">What I built</h2>
        </div>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          <li className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--muted)]">
            End-to-end NHANES integration, cleaning, and exploratory analysis
          </li>
          <li className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--muted)]">
            Model bake-off, tuned XGBoost, and threshold selection
          </li>
          <li className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--muted)]">
            SHAP explainability and this interactive {SITE.productName} dashboard
          </li>
        </ul>
        <Link
          href="/project"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
        >
          Open detailed project
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </article>

      <section className="page-grid md:grid-cols-2">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="amplo-card group flex items-center gap-4 !p-5 transition hover:ring-2 hover:ring-blue-500/30"
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${link.tint}`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-semibold">
                  {link.title}
                </span>
                <span className="mt-0.5 block text-sm text-[var(--muted)]">
                  {link.detail}
                </span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--muted)] transition group-hover:text-blue-600" />
            </a>
          );
        })}
      </section>

      <article className="amplo-card flex flex-col gap-4 !p-5 sm:flex-row sm:items-center sm:justify-between sm:!p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Say hello</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Open to research chats, collaborations, and dashboard walkthroughs.
            </p>
            <a
              href={`mailto:${CREATOR.email}`}
              className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
            >
              {CREATOR.email}
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`mailto:${CREATOR.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-2.5 text-sm font-medium"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
          <a
            href={CREATOR.links.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-2.5 text-sm font-medium"
          >
            <Code2 className="h-4 w-4" />
            GitHub
          </a>
          <a
            href={CREATOR.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <UserRound className="h-4 w-4" />
            Get connected
          </a>
        </div>
      </article>

      <p className="text-center text-sm text-[var(--muted)]">
        {SITE.productName} · {SITE.researchTitle}
        <span className="mx-2">·</span>
        Researched &amp; developed by {CREATOR.name}
      </p>
    </div>
  );
}
