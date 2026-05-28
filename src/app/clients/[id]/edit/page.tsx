import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { updateClientAction } from "@/features/clients/client-actions";
import { clientValuesFromRecord } from "@/features/clients/client-form-state";
import { ClientForm } from "@/features/clients/components/client-form";
import { getClientById } from "@/features/clients/services/client-service";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Modifier les informations générales du client."
        eyebrow="Clients"
        title={`Modifier ${client.name}`}
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/clients/${client.id}`}
        >
          Retour fiche client
        </Link>
      </PageHeader>

      <SectionPanel title="Informations client">
        <ClientForm
          action={updateClientAction.bind(null, client.id)}
          cancelHref={`/clients/${client.id}`}
          initialValues={clientValuesFromRecord(client)}
          submitLabel="Enregistrer"
        />
      </SectionPanel>
    </div>
  );
}
