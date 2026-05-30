import { connection } from "next/server";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listInterventions } from "@/features/interventions/services/intervention-service";
import { formatDateTime, formatEnumLabel, formatNullable } from "@/lib/format";

export default async function InterventionsPage() {
  await connection();

  const interventions = await listInterventions();

  return (
    <div>
      <PageHeader
        description="Fiches de suivi des actions techniques et vérifications globales menées sur les sites WordPress."
        eyebrow="Suivis techniques"
        title="Suivis techniques"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          href="/interventions/new"
        >
          Nouveau suivi technique
        </Link>
      </PageHeader>

      {interventions.length === 0 ? (
        <EmptyState
          description="Aucune fiche de suivi n'est encore présente dans la base v2."
          href="/interventions/new"
          linkLabel="Créer un suivi technique"
          title="Aucun suivi technique"
        />
      ) : (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Suivi technique</th>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {interventions.map((intervention) => (
                  <tr key={intervention.id} className="align-top">
                    <td className="px-4 py-4 font-medium text-zinc-950">
                      {intervention.title}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {intervention.site ? (
                        <Link
                          className="font-medium text-cyan-800 hover:text-cyan-950"
                          href={`/sites/${intervention.site.id}`}
                        >
                          {intervention.site.name}
                        </Link>
                      ) : (
                        formatNullable(null)
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {intervention.site?.client ? (
                        <Link
                          className="font-medium text-cyan-800 hover:text-cyan-950"
                          href={`/clients/${intervention.site.client.id}`}
                        >
                          {intervention.site.client.name}
                        </Link>
                      ) : (
                        formatNullable(null)
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-700">
                      {formatEnumLabel(intervention.type)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={intervention.status} />
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {formatDateTime(intervention.date)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        className="font-medium text-cyan-800 hover:text-cyan-950"
                        href={`/interventions/${intervention.id}`}
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
