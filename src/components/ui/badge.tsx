import { cn, labelFromEnum } from "@/lib/utils";

const statusTone: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  connected: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  generated: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  issue: "bg-amber-50 text-amber-700 ring-amber-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  archived: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  paused: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  planned: "bg-blue-50 text-blue-700 ring-blue-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
  running: "bg-blue-50 text-blue-700 ring-blue-200",
  draft: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  untested: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  unknown: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export function Badge({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
        statusTone[value] ?? "bg-zinc-100 text-zinc-600 ring-zinc-200",
        className,
      )}
    >
      {label ?? labelFromEnum(value)}
    </span>
  );
}
