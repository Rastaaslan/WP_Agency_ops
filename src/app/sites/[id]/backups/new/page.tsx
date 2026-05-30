import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { createBackupAction } from "@/features/backups/backup-actions";
import { BackupForm } from "@/features/backups/components/backup-form";
import { listInterventionsBySite } from "@/features/interventions/services/intervention-service";
import { getSiteById } from "@/features/sites/services/site-service";

export default async function NewBackupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const [site, interventions] = await Promise.all([
    getSiteById(id),
    listInterventionsBySite(id),
  ]);

  if (!site) {
    notFound();
  }

  const interventionOptions = interventions.map((intervention) => ({
    id: intervention.id,
    title: intervention.title,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        description={`Documenter une sauvegarde prévue ou déjà réalisée pour ${site.name}.`}
        eyebrow="Sauvegardes"
        title="Ajouter une sauvegarde"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/sites/${site.id}`}
        >
          Retour site
        </Link>
      </PageHeader>

      <SectionPanel
        description="Ce suivi reste documentaire : aucune sauvegarde automatique n'est lancée depuis WP Agency Ops."
        title="Suivi manuel"
      >
        <BackupForm
          action={createBackupAction.bind(null, site.id)}
          cancelHref={`/sites/${site.id}`}
          interventions={interventionOptions}
          submitLabel="Enregistrer la sauvegarde"
        />
      </SectionPanel>
    </div>
  );
}
