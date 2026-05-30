import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { InterventionForm } from "@/features/interventions/components/intervention-form";
import { updateInterventionAction } from "@/features/interventions/intervention-actions";
import { interventionValuesFromRecord } from "@/features/interventions/intervention-form-state";
import { getInterventionById } from "@/features/interventions/services/intervention-service";
import { listSites } from "@/features/sites/services/site-service";

export default async function EditInterventionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const [intervention, sites] = await Promise.all([
    getInterventionById(id),
    listSites(),
  ]);

  if (!intervention) {
    notFound();
  }

  const siteOptions = sites.map((site) => ({
    id: site.id,
    name: site.name,
    clientName: site.client?.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        description="Modifier les informations générales de cette fiche de suivi."
        eyebrow="Interventions"
        title={`Modifier ${intervention.title}`}
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/interventions/${intervention.id}`}
        >
          Retour fiche intervention
        </Link>
      </PageHeader>

      <SectionPanel
        description="Ajustez le site, le titre, le type, la date et les notes de suivi."
        title="Informations de suivi"
      >
        <InterventionForm
          action={updateInterventionAction.bind(null, intervention.id)}
          cancelHref={`/interventions/${intervention.id}`}
          initialValues={interventionValuesFromRecord(intervention)}
          sites={siteOptions}
          submitLabel="Enregistrer"
        />
      </SectionPanel>
    </div>
  );
}
