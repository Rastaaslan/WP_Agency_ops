import { formatEnumLabel } from "@/lib/format";

const statusTones: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-zinc-200 bg-zinc-100 text-zinc-600",
  paused: "border-amber-200 bg-amber-50 text-amber-800",
  production: "border-cyan-200 bg-cyan-50 text-cyan-800",
  staging: "border-violet-200 bg-violet-50 text-violet-700",
  development: "border-zinc-200 bg-zinc-50 text-zinc-700",
  planned: "border-cyan-200 bg-cyan-50 text-cyan-800",
  in_progress: "border-amber-200 bg-amber-50 text-amber-800",
  done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  issue: "border-red-200 bg-red-50 text-red-700",
  cancelled: "border-zinc-200 bg-zinc-100 text-zinc-600",
  skipped: "border-zinc-200 bg-zinc-100 text-zinc-600",
  failed: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  not_tested: "border-zinc-200 bg-zinc-100 text-zinc-600",
  ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ignored: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2 text-xs font-medium ${
        statusTones[value] ?? "border-zinc-200 bg-zinc-50 text-zinc-700"
      }`}
    >
      {formatEnumLabel(value)}
    </span>
  );
}
