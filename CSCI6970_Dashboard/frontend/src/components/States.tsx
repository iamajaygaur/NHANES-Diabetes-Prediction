"use client";

export function LoadingState({ label = "Loading research data…" }: { label?: string }) {
  return (
    <div className="space-y-4 py-2">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-6 py-4 text-sm text-[var(--muted)]">
        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-sky-400" />
        {label}
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
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-5 py-4 text-sm text-[var(--danger-text)]">
      <p className="font-medium">Unable to load data from the API. {message}</p>
      <p className="text-[var(--muted)]">
        Make sure the FastAPI backend is running on port 8000, then refresh this page:
      </p>
      <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-xs text-[var(--foreground)]">
        {`cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`}
      </pre>
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
