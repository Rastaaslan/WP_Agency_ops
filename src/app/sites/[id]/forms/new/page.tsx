import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { WatchedFormForm } from "@/features/forms/components/watched-form-form";
import { createWatchedFormAction } from "@/features/forms/form-watch-actions";
import { getSiteById } from "@/features/sites/services/site-service";

export default async function NewWatchedFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const site = await getSiteById(id);

  if (!site) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={`Documenter un formulaire important à surveiller pour ${site.name}.`}
        eyebrow="Formulaires surveillés"
        title="Ajouter un formulaire surveillé"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/sites/${site.id}`}
        >
          Retour site
        </Link>
      </PageHeader>

      <SectionPanel
        description="Ce suivi reste manuel : aucun test automatique de formulaire n'est exécuté depuis WP Agency Ops."
        title="Suivi documentaire"
      >
        <WatchedFormForm
          action={createWatchedFormAction.bind(null, site.id)}
          cancelHref={`/sites/${site.id}`}
          submitLabel="Enregistrer le formulaire"
        />
      </SectionPanel>
    </div>
  );
}
