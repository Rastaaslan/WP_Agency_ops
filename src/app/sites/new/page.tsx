import { connection } from "next/server";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { listClients } from "@/features/clients/services/client-service";
import { createSiteAction } from "@/features/sites/site-actions";
import { SiteForm } from "@/features/sites/components/site-form";

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string | string[] }>;
}) {
  await connection();

  const [clients, query] = await Promise.all([listClients(), searchParams]);
  const clientOptions = clients.map((client) => ({
    id: client.id,
    name: client.name,
  }));
  const requestedClientId = firstQueryValue(query.clientId);
  const initialClientId = clientOptions.some(
    (client) => client.id === requestedClientId,
  )
    ? requestedClientId
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        description="Créer une fiche site rattachée à un client existant."
        eyebrow="Sites"
        title="Nouveau site"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/sites"
        >
          Retour sites
        </Link>
      </PageHeader>

      {clients.length === 0 ? (
        <EmptyState
          description="Créez d'abord un client avant de rattacher un site WordPress."
          href="/clients/new"
          linkLabel="Créer un client"
          title="Aucun client disponible"
        />
      ) : (
        <SectionPanel title="Informations site">
          <SiteForm
            action={createSiteAction}
            cancelHref="/sites"
            clients={clientOptions}
            initialValues={{ clientId: initialClientId }}
            submitLabel="Créer le site"
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
