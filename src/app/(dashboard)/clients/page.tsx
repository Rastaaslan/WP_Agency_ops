import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: { _count: { select: { sites: true, reports: true } } },
  });

  return (
    <>
      <PageHeader
        title="Clients"
        description="Gestion des clients de l'agence et de leurs sites WordPress."
        actions={
          <Link href="/clients/new" className={buttonClassName()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter un client
          </Link>
        }
      />
      {clients.length === 0 ? (
        <EmptyState title="Aucun client" description="Creez le premier client pour rattacher des sites WordPress." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Sites</th>
                  <th className="px-4 py-3">Rapports</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Cree</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${client.id}`} className="font-medium text-zinc-950 hover:text-blue-700">
                        {client.companyName || client.name}
                      </Link>
                      {client.companyName ? <p className="text-xs text-zinc-500">{client.name}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{client.email || client.phone || "Non renseigne"}</td>
                    <td className="px-4 py-3 text-zinc-600">{client._count.sites}</td>
                    <td className="px-4 py-3 text-zinc-600">{client._count.reports}</td>
                    <td className="px-4 py-3"><Badge value={client.status} /></td>
                    <td className="px-4 py-3 text-zinc-500">{formatDate(client.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
