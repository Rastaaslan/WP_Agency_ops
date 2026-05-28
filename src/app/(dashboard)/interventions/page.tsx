import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function InterventionsPage() {
  const interventions = await prisma.maintenanceIntervention.findMany({
    orderBy: { createdAt: "desc" },
    include: { site: { include: { client: true } } },
  });

  return (
    <>
      <PageHeader
        title="Interventions"
        description="Historique et preparation des operations de maintenance."
        actions={
          <Link href="/interventions/new" className={buttonClassName()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouvelle intervention
          </Link>
        }
      />
      {interventions.length === 0 ? (
        <EmptyState title="Aucune intervention" description="Creez une intervention pour documenter le travail realise." />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Intervention</th>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {interventions.map((intervention) => (
                <tr key={intervention.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link href={`/interventions/${intervention.id}`} className="font-medium text-zinc-950 hover:text-blue-700">
                      {intervention.title}
                    </Link>
                    <p className="text-xs text-zinc-500">{intervention.clientSummary || intervention.description}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{intervention.site.name}</td>
                  <td className="px-4 py-3"><Badge value={intervention.type} /></td>
                  <td className="px-4 py-3"><Badge value={intervention.status} /></td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(intervention.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
