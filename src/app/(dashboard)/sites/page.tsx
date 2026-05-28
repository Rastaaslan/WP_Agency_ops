import Link from "next/link";
import { Plus, Radar } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function SitesPage() {
  const sites = await prisma.wordPressSite.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: {
      client: true,
      scans: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <>
      <PageHeader
        title="Sites WordPress"
        description="Inventaire technique des sites suivis, statuts de connexion et derniers scans."
        actions={
          <Link href="/sites/new" className={buttonClassName()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ajouter un site
          </Link>
        }
      />
      {sites.length === 0 ? (
        <EmptyState title="Aucun site" description="Ajoutez un site WordPress pour lancer un scan REST public." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Environnement</th>
                  <th className="px-4 py-3">Connexion</th>
                  <th className="px-4 py-3">Dernier scan</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <Link href={`/sites/${site.id}`} className="font-medium text-zinc-950 hover:text-blue-700">
                        {site.name}
                      </Link>
                      <p className="text-xs text-zinc-500">{site.url}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{site.client.companyName || site.client.name}</td>
                    <td className="px-4 py-3"><Badge value={site.environment} /></td>
                    <td className="px-4 py-3"><Badge value={site.connectionStatus} /></td>
                    <td className="px-4 py-3 text-zinc-600">
                      {site.scans[0] ? formatDateTime(site.scans[0].createdAt) : "Aucun scan"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/sites/${site.id}`} className={buttonClassName({ variant: "secondary", className: "h-9" })}>
                        <Radar className="h-4 w-4" aria-hidden="true" />
                        Ouvrir
                      </Link>
                    </td>
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
