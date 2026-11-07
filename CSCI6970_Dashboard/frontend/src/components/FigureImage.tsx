import { apiUrl } from "@/lib/api";

export function FigureImage({
  filename,
  alt,
  caption,
}: {
  filename: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={apiUrl(`/api/assets/figures/${filename}`)}
        alt={alt}
        className="h-auto w-full object-contain bg-[var(--panel-strong)]"
      />
      {caption ? (
        <figcaption className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
