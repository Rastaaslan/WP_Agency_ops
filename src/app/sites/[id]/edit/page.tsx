import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { listClients } from "@/features/clients/services/client-service";
import { updateSiteAction } from "@/features/sites/site-actions";
import { siteValuesFromRecord } from "@/features/sites/site-form-state";
import { SiteForm } from "@/features/sites/components/site-form";
import { getSiteById } from "@/features/sites/services/site-service";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const [site, clients] = await Promise.all([getSiteById(id), listClients()]);

  if (!site) {
    notFound();
  }

  const clientOptions = clients.map((client) => ({
    id: client.id,
    name: client.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        description="Modifier les informations générales du site WordPress."
        eyebrow="Sites"
        title={`Modifier ${site.name}`}
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/sites/${site.id}`}
        >
          Retour fiche site
        </Link>
      </PageHeader>

      <SectionPanel title="Informations site">
        <SiteForm
          action={updateSiteAction.bind(null, site.id)}
          cancelHref={`/sites/${site.id}`}
          clients={clientOptions}
          initialValues={siteValuesFromRecord(site)}
          submitLabel="Enregistrer"
        />
      </SectionPanel>
    </div>
  );
}
