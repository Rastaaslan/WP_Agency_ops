import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { updateBackupAction } from "@/features/backups/backup-actions";
import { backupValuesFromRecord } from "@/features/backups/backup-form-state";
import { BackupForm } from "@/features/backups/components/backup-form";
import { getBackupById } from "@/features/backups/services/backup-service";
import { listInterventionsBySite } from "@/features/interventions/services/intervention-service";

export default async function EditBackupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const backup = await getBackupById(id);

  if (!backup) {
    notFound();
  }

  const interventions = await listInterventionsBySite(backup.siteId);
  const interventionOptions = interventions.map((intervention) => ({
    id: intervention.id,
    title: intervention.title,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        description={`Mettre à jour les informations de suivi de sauvegarde pour ${backup.site.name}.`}
        eyebrow="Sauvegardes"
        title="Modifier une sauvegarde"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/sites/${backup.siteId}`}
        >
          Retour site
        </Link>
      </PageHeader>

      <SectionPanel
        description="La modification ajuste uniquement le suivi documentaire : aucune sauvegarde réelle n'est lancée."
        title="Informations sauvegarde"
      >
        <BackupForm
          action={updateBackupAction.bind(null, backup.id, backup.siteId)}
          cancelHref={`/sites/${backup.siteId}`}
          initialValues={backupValuesFromRecord(backup)}
          interventions={interventionOptions}
          submitLabel="Enregistrer"
        />
      </SectionPanel>
    </div>
  );
}
