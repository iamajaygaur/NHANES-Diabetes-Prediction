import { AlertTriangle } from "lucide-react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning-text)]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning-icon)]" />
      <p className="font-medium leading-relaxed">
        {compact
          ? "Academic research and educational demonstration only. Not a medical diagnostic system."
          : "This tool is for academic research and educational demonstration only. It is not a medical diagnostic system and must not be used to make healthcare decisions. Do not enter real personal health information."}
      </p>
    </div>
  );
}
