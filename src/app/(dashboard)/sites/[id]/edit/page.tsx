import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { updateSite } from "@/features/sites/actions";
import { SiteForm } from "@/features/sites/components/site-form";
import { prisma } from "@/server/db/client";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [site, clients] = await Promise.all([
    prisma.wordPressSite.findUnique({ where: { id } }),
    prisma.client.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, companyName: true },
    }),
  ]);

  if (!site) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Modifier le site" description={site.name} />
      <Card className="max-w-3xl">
        <SiteForm
          action={updateSite.bind(null, site.id)}
          clients={clients}
          site={site}
          submitLabel="Enregistrer"
        />
      </Card>
    </>
  );
}
