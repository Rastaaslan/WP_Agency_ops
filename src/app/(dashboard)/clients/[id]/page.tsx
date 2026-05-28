import Link from "next/link";
import { Archive, Edit, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { archiveClient } from "@/features/clients/actions";
import { formatDate } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      sites: { orderBy: { name: "asc" } },
      reports: { orderBy: { createdAt: "desc" }, take: 5, include: { site: true } },
    },
  });

  if (!client) {
    notFound();
  }

  const archiveAction = archiveClient.bind(null, client.id);

  return (
    <>
      <PageHeader
        title={client.companyName || client.name}
        description={client.notes || "Fiche client et sites rattaches."}
        actions={
          <>
            <Link href={`/clients/${client.id}/edit`} className={buttonClassName({ variant: "secondary" })}>
              <Edit className="h-4 w-4" aria-hidden="true" />
              Modifier
            </Link>
            <Link href={`/sites/new?clientId=${client.id}`} className={buttonClassName()}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter un site
            </Link>
            <form action={archiveAction}>
              <Button type="submit" variant="danger">
                <Archive className="h-4 w-4" aria-hidden="true" />
                Archiver
              </Button>
            </form>
          </>
        }
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>Informations</CardTitle>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="text-zinc-500">Contact</dt><dd className="font-medium text-zinc-950">{client.name}</dd></div>
            <div><dt className="text-zinc-500">Email</dt><dd>{client.email || "Non renseigne"}</dd></div>
            <div><dt className="text-zinc-500">Telephone</dt><dd>{client.phone || "Non renseigne"}</dd></div>
            <div><dt className="text-zinc-500">Statut</dt><dd><Badge value={client.status} /></dd></div>
            <div><dt className="text-zinc-500">Cree le</dt><dd>{formatDate(client.createdAt)}</dd></div>
          </dl>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sites WordPress</CardTitle>
            <Link href={`/sites/new?clientId=${client.id}`} className="text-sm font-medium text-blue-700 hover:text-blue-900">Ajouter</Link>
          </CardHeader>
          <div className="divide-y divide-zinc-100">
            {client.sites.map((site) => (
              <Link key={site.id} href={`/sites/${site.id}`} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-950">{site.name}</p>
                  <p className="text-sm text-zinc-500">{site.url}</p>
                </div>
                <Badge value={site.connectionStatus} />
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <Card className="mt-6">
        <CardTitle>Derniers rapports</CardTitle>
        <div className="mt-4 divide-y divide-zinc-100">
          {client.reports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`} className="flex justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-zinc-950">{report.title}</p>
                <p className="text-sm text-zinc-500">{report.site.name}</p>
              </div>
              <Badge value={report.status} />
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
