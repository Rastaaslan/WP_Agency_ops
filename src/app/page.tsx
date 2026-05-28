import Link from "next/link";
import { APP_DESCRIPTION, APP_DISPLAY_NAME, APP_TAGLINE } from "@/lib/app-info";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-md border border-zinc-200 bg-white px-6 py-8 sm:px-8">
        <p className="mb-3 text-sm font-medium text-cyan-800">{APP_TAGLINE}</p>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
          {APP_DISPLAY_NAME}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-600">
          {APP_DESCRIPTION}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <HomeLink
          description="Parcourir le portefeuille clients et accéder aux sites rattachés."
          href="/clients"
          title="Clients"
        />
        <HomeLink
          description="Consulter les sites WordPress, leur environnement et leur statut."
          href="/sites"
          title="Sites"
        />
        <HomeLink
          description="Vérifier la réponse JSON minimale de santé applicative."
          href="/api/health"
          title="API Health"
        />
      </section>
    </div>
  );
}

function HomeLink({
  description,
  href,
  title,
}: {
  description: string;
  href: string;
  title: string;
}) {
  return (
    <Link
      className="rounded-md border border-zinc-200 bg-white p-5 transition hover:border-cyan-300 hover:shadow-sm"
      href={href}
    >
      <span className="text-lg font-semibold text-zinc-950">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-zinc-600">
        {description}
      </span>
    </Link>
  );
}
