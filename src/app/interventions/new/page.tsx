import { connection } from "next/server";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { createInterventionAction } from "@/features/interventions/intervention-actions";
import { InterventionForm } from "@/features/interventions/components/intervention-form";
import { listSites } from "@/features/sites/services/site-service";

export default async function NewInterventionPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string | string[] }>;
}) {
  await connection();

  const [sites, query] = await Promise.all([listSites(), searchParams]);
  const siteOptions = sites.map((site) => ({
    id: site.id,
    name: site.name,
    clientName: site.client?.name,
  }));
  const requestedSiteId = firstQueryValue(query.siteId);
  const initialSiteId = siteOptions.some((site) => site.id === requestedSiteId)
    ? requestedSiteId
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        description="Créer une intervention globale rattachée à un site existant."
        eyebrow="Interventions"
        title="Nouvelle intervention"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/interventions"
        >
          Retour interventions
        </Link>
      </PageHeader>

      {siteOptions.length === 0 ? (
        <EmptyState
          description="Créez d'abord un site avant de planifier une intervention."
          href="/sites/new"
          linkLabel="Créer un site"
          title="Aucun site disponible"
        />
      ) : (
        <SectionPanel title="Informations intervention">
          <InterventionForm
            action={createInterventionAction}
            cancelHref="/interventions"
            initialValues={{ siteId: initialSiteId }}
            sites={siteOptions}
            submitLabel="Créer l'intervention"
          />
        </SectionPanel>
      )}
    </div>
  );
}

function firstQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
