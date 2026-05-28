import { CircleDashed } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
      <CircleDashed className="mx-auto h-8 w-8 text-zinc-400" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-zinc-950">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
