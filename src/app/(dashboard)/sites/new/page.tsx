import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { createSite } from "@/features/sites/actions";
import { SiteForm } from "@/features/sites/components/site-form";
import { prisma } from "@/server/db/client";

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const [{ clientId }, clients] = await Promise.all([
    searchParams,
    prisma.client.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, companyName: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="Ajouter un site WordPress" description="Rattachez un site a un client et choisissez le mode de connexion MVP." />
      <Card className="max-w-3xl">
        <SiteForm
          action={createSite}
          clients={clients}
          site={{ clientId }}
          submitLabel="Creer le site"
        />
      </Card>
    </>
  );
}
