import { connection } from "next/server";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listSites } from "@/features/sites/services/site-service";
import { formatNullable } from "@/lib/format";

export default async function SitesPage() {
  await connection();

  const sites = await listSites();

  return (
    <div>
      <PageHeader
        description="Vue de lecture des sites WordPress suivis dans le cockpit."
        eyebrow="Lecture seule"
        title="Sites"
      />

      {sites.length === 0 ? (
        <EmptyState
          description="Aucun site n'est encore présent dans la base v2."
          title="Aucun site"
        />
      ) : (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Environnement</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {sites.map((site) => (
                  <tr key={site.id} className="align-top">
                    <td className="px-4 py-4 font-medium text-zinc-950">
                      {site.name}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      <a
                        className="hover:text-cyan-800"
                        href={site.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {site.url}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {site.client ? (
                        <Link
                          className="font-medium text-cyan-800 hover:text-cyan-950"
                          href={`/clients/${site.client.id}`}
                        >
                          {site.client.name}
                        </Link>
                      ) : (
                        formatNullable(null)
                      )}
                    </td>
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
        </div>
      )}
    </div>
  );
}
