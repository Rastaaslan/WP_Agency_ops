import type { ReactNode } from "react";

type SectionPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SectionPanel({
  title,
  description,
  children,
}: SectionPanelProps) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
        ) : null}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}
