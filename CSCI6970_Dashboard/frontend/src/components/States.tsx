"use client";

import { useEffect, useState } from "react";

export function LoadingState({
  label = "Loading research data…",
}: {
  label?: string;
}) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), 3500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="space-y-4 py-2">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-6 py-4 text-sm text-[var(--muted)]">
        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-sky-400" />
        {slow
          ? "Waking the model API (free tier)… first load can take up to a minute."
          : label}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--panel)]"
          />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--panel)]" />
        <div className="h-72 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--panel)]" />
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  const looksCold =
    /waking|503|timeout|unreachable|failed to fetch|ECONNREFUSED/i.test(
      message,
    );

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-5 py-4 text-sm text-[var(--danger-text)]">
      <p className="font-medium">
        {looksCold
          ? "The API is still starting up. Wait ~30–60s and tap Retry."
          : "Unable to load data from the API."}
      </p>
      {!looksCold ? (
        <p className="break-words text-[var(--muted)]">{message}</p>
      ) : null}
      <p className="text-[var(--muted)]">
        Dashboard data is cached for a few minutes after a successful load so
        the next visit should be much faster.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full bg-sky-500/15 px-4 py-2 text-sky-700 ring-1 ring-sky-400/30 dark:text-sky-200"
      >
        Retry
      </button>
    </div>
  );
}
