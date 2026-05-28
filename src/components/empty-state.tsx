import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
};

export function EmptyState({
  title,
  description,
  href,
  linkLabel,
}: EmptyStateProps) {
  return (
    <section className="rounded-md border border-dashed border-zinc-300 bg-white px-5 py-8">
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
        {description}
      </p>
      {href && linkLabel ? (
        <Link
          className="mt-5 inline-flex min-h-10 items-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={href}
        >
          {linkLabel}
        </Link>
      ) : null}
    </section>
  );
}
