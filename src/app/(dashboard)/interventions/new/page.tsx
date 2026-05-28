import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { createIntervention } from "@/features/maintenance/actions";
import { InterventionForm } from "@/features/maintenance/components/intervention-form";
import { prisma } from "@/server/db/client";

export default async function NewInterventionPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const [{ siteId }, sites] = await Promise.all([
    searchParams,
    prisma.wordPressSite.findMany({
      where: { status: { not: "archived" } },
      orderBy: { name: "asc" },
      include: { client: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="Nouvelle intervention" description="Documentez une maintenance, un correctif ou une verification." />
      <Card className="max-w-3xl">
        <InterventionForm
          action={createIntervention}
          sites={sites}
          intervention={{ siteId }}
          submitLabel="Creer l'intervention"
        />
      </Card>
    </>
  );
}
