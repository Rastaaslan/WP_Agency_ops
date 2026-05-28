import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default function NotFound() {
  return (
    <div>
      <PageHeader
        description="La ressource demandée n'existe pas ou n'est plus disponible dans cette base."
        eyebrow="Introuvable"
        title="Page non trouvée"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/"
        >
          Retour accueil
        </Link>
      </PageHeader>
    </div>
  );
}
