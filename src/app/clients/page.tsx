import { connection } from "next/server";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listClients } from "@/features/clients/services/client-service";
import { listSites } from "@/features/sites/services/site-service";
import { formatNullable } from "@/lib/format";

export default async function ClientsPage() {
  await connection();

  const [clients, sites] = await Promise.all([listClients(), listSites()]);
  const siteCounts = countSitesByClient(sites);

  return (
    <div>
      <PageHeader
        description="Vue de lecture du portefeuille clients et des sites WordPress rattachés."
        eyebrow="Lecture seule"
        title="Clients"
      />

      {clients.length === 0 ? (
        <EmptyState
          description="Aucun client n'est encore présent dans la base v2."
          title="Aucun client"
        />
      ) : (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Entreprise</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Sites</th>
                  <th className="px-4 py-3 text-right">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {clients.map((client) => (
                  <tr key={client.id} className="align-top">
                    <td className="px-4 py-4 font-medium text-zinc-950">
                      {client.name}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {formatNullable(client.companyName)}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {formatNullable(client.email)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={client.status} />
                    </td>
                    <td className="px-4 py-4 text-right text-zinc-700">
                      {siteCounts.get(client.id) ?? 0}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        className="font-medium text-cyan-800 hover:text-cyan-950"
                        href={`/clients/${client.id}`}
                      >
                        Ouvrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function countSitesByClient(sites: Awaited<ReturnType<typeof listSites>>) {
  const siteCounts = new Map<string, number>();

  for (const site of sites) {
    siteCounts.set(site.clientId, (siteCounts.get(site.clientId) ?? 0) + 1);
  }

  return siteCounts;
}
