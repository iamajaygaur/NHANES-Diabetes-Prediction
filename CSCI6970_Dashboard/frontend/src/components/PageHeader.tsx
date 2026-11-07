export function PageHeader({
  title,
  description,
  action,
  tabs,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  tabs?: React.ReactNode;
}) {
  return (
    <div className="mb-8 space-y-5 fade-in">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-5xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {description}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {tabs}
    </div>
  );
}
