"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Play, X } from "lucide-react";

const STEPS = [
  {
    href: "/",
    title: "Overview",
    body: "Start here: Amplo-style overview with cohort vinyl, model pulse, and live workflow stages.",
  },
  {
    href: "/performance",
    title: "Model Performance",
    body: "Compare baseline models, inspect tuned XGBoost, and explore the 0.60 threshold.",
  },
  {
    href: "/predict",
    title: "Prediction Studio",
    body: "Run the saved pipeline on synthetic inputs and inspect local SHAP contributions.",
  },
  {
    href: "/project?tab=explain",
    title: "Detailed project",
    body: "Open the Project tab for research brief, methods, and global SHAP.",
  },
] as const;

const STORAGE_KEY = "diabetesinsight-tour-seen";

export function DemoTour() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const idx = STEPS.findIndex((s) => {
      const pathOnly = s.href.split("?")[0];
      return pathOnly === "/" ? pathname === "/" : pathname.startsWith(pathOnly);
    });
    if (idx >= 0) setStep(idx);
  }, [pathname]);

  function close() {
    setOpen(false);
    window.localStorage.setItem(STORAGE_KEY, "1");
  }

  function next() {
    if (step >= STEPS.length - 1) {
      close();
      return;
    }
    const upcoming = STEPS[step + 1];
    setStep(step + 1);
    router.push(upcoming.href);
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setStep(0);
            router.push(STEPS[0].href);
          }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-40 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-[var(--float-shadow)] backdrop-blur-xl"
        >
          <Play className="h-4 w-4 shrink-0 text-sky-500" />
          <span>Demo tour</span>
        </button>
      ) : null}

      {open ? (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[min(420px,calc(100vw-1.5rem))] -translate-x-1/2 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--float-shadow)] backdrop-blur-xl sm:left-auto sm:right-[max(1rem,env(safe-area-inset-right))] sm:translate-x-0 sm:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Guided demo · {step + 1}/{STEPS.length}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold text-[var(--foreground)] sm:text-xl">
                {STEPS[step].title}
              </h3>
            </div>
            <button
              type="button"
              onClick={close}
              className="shrink-0 rounded-xl border border-[var(--border)] p-2 text-[var(--muted)]"
              aria-label="Close demo tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">{STEPS[step].body}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={STEPS[step].href}
              className="text-sm font-medium text-sky-700 dark:text-sky-300"
            >
              Stay on this page
            </Link>
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-teal-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              {step >= STEPS.length - 1 ? "Finish" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
