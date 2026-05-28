import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { updateClient } from "@/features/clients/actions";
import { ClientForm } from "@/features/clients/components/client-form";
import { prisma } from "@/server/db/client";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Modifier le client" description={client.companyName || client.name} />
      <Card className="max-w-3xl">
        <ClientForm
          action={updateClient.bind(null, client.id)}
          client={client}
          submitLabel="Enregistrer"
        />
      </Card>
    </>
  );
}
