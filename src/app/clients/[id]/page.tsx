import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { StatusBadge } from "@/components/status-badge";
import { archiveClientAction } from "@/features/clients/client-actions";
import { ArchiveClientForm } from "@/features/clients/components/archive-client-form";
import { getClientById } from "@/features/clients/services/client-service";
import { listSitesByClient } from "@/features/sites/services/site-service";
import { formatNullable } from "@/lib/format";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const [client, sites] = await Promise.all([
    getClientById(id),
    listSitesByClient(id),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={formatNullable(
          client.companyName,
          "Client sans entreprise renseignée",
        )}
        eyebrow="Client"
        title={client.name}
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/clients"
        >
          Retour clients
        </Link>
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/clients/${client.id}/edit`}
        >
          Modifier
        </Link>
        <ArchiveClientForm
          action={archiveClientAction.bind(null, client.id)}
          disabled={client.status === "archived"}
        />
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoTile label="Statut">
          <StatusBadge value={client.status} />
        </InfoTile>
        <InfoTile label="Email">{formatNullable(client.email)}</InfoTile>
        <InfoTile label="Téléphone">{formatNullable(client.phone)}</InfoTile>
      </section>

      <SectionPanel title="Notes">
        <p className="text-sm leading-6 text-zinc-700">
          {formatNullable(client.notes, "Aucune note client renseignée.")}
        </p>
      </SectionPanel>

      <SectionPanel
        description="Sites WordPress rattachés à ce client."
        title="Sites liés"
      >
        {sites.length === 0 ? (
          <p className="text-sm leading-6 text-zinc-600">
            Aucun site n&apos;est rattaché à ce client dans la base v2.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Environnement</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td className="px-4 py-4 font-medium text-zinc-950">
                      {site.name}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">{site.url}</td>
                    <td className="px-4 py-4">
                      <StatusBadge value={site.environment} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={site.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        className="font-medium text-cyan-800 hover:text-cyan-950"
                        href={`/sites/${site.id}`}
                      >
                        Ouvrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>
    </div>
  );
}

function InfoTile({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-5">
      <h2 className="text-xs font-semibold uppercase text-zinc-500">{label}</h2>
      <div className="mt-3 text-sm text-zinc-800">{children}</div>
    </section>
  );
}
