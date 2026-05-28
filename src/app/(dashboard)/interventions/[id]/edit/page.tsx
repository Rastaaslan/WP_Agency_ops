import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { updateIntervention } from "@/features/maintenance/actions";
import { InterventionForm } from "@/features/maintenance/components/intervention-form";
import { prisma } from "@/server/db/client";

export default async function EditInterventionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [intervention, sites] = await Promise.all([
    prisma.maintenanceIntervention.findUnique({ where: { id } }),
    prisma.wordPressSite.findMany({
      where: { status: { not: "archived" } },
      orderBy: { name: "asc" },
      include: { client: true },
    }),
  ]);

  if (!intervention) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Modifier l'intervention" description={intervention.title} />
      <Card className="max-w-3xl">
        <InterventionForm
          action={updateIntervention.bind(null, intervention.id)}
          sites={sites}
          intervention={intervention}
          submitLabel="Enregistrer"
        />
      </Card>
    </>
  );
}
