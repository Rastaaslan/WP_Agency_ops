import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { WatchedFormForm } from "@/features/forms/components/watched-form-form";
import { updateWatchedFormAction } from "@/features/forms/form-watch-actions";
import { watchedFormValuesFromRecord } from "@/features/forms/form-watch-form-state";
import { getFormById } from "@/features/forms/services/form-watch-service";

export default async function EditWatchedFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const watchedForm = await getFormById(id);

  if (!watchedForm) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={`Mettre à jour le suivi manuel de ce formulaire pour ${watchedForm.site.name}.`}
        eyebrow="Formulaires surveillés"
        title="Modifier un formulaire surveillé"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/sites/${watchedForm.siteId}`}
        >
          Retour site
        </Link>
      </PageHeader>

      <SectionPanel
        description="La modification ajuste uniquement le suivi documentaire du formulaire, sans test automatique."
        title="Informations formulaire"
      >
        <WatchedFormForm
          action={updateWatchedFormAction.bind(
            null,
            watchedForm.id,
            watchedForm.siteId,
          )}
          cancelHref={`/sites/${watchedForm.siteId}`}
          initialValues={watchedFormValuesFromRecord(watchedForm)}
          submitLabel="Enregistrer"
        />
      </SectionPanel>
    </div>
  );
}
