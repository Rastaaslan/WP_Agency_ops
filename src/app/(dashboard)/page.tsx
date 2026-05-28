import Link from "next/link";
import { Activity, FilePlus2, Plus, Radar, Wrench } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatDateTime } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function DashboardPage() {
  const [
    activeClients,
    activeSites,
    connectedSites,
    latestScans,
    latestInterventions,
    latestReports,
    issueSites,
  ] = await Promise.all([
    prisma.client.count({ where: { status: "active" } }),
    prisma.wordPressSite.count({ where: { status: "active" } }),
    prisma.wordPressSite.count({
      where: { status: "active", connectionStatus: "connected" },
    }),
    prisma.siteScan.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { site: true },
    }),
    prisma.maintenanceIntervention.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { site: true },
    }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { site: true },
    }),
    prisma.wordPressSite.findMany({
      where: {
        status: { not: "archived" },
        OR: [{ connectionStatus: "failed" }, { status: "paused" }],
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { client: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vue technique rapide de votre portefeuille WordPress : connexions, scans, interventions et rapports."
        actions={
          <>
            <Link href="/clients/new" className={buttonClassName({ variant: "secondary" })}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter un client
            </Link>
            <Link href="/sites/new" className={buttonClassName({ variant: "secondary" })}>
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
              Ajouter un site
            </Link>
            <Link href="/sites" className={buttonClassName()}>
              <Radar className="h-4 w-4" aria-hidden="true" />
              Lancer un scan
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Clients actifs" value={activeClients} />
        <StatCard label="Sites actifs" value={activeSites} />
        <StatCard label="Sites connectes" value={connectedSites} helper="Via REST public ou snapshot valide" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Derniers scans</CardTitle>
            <Link href="/sites" className="text-sm font-medium text-blue-700 hover:text-blue-900">
              Voir les sites
            </Link>
          </CardHeader>
          {latestScans.length === 0 ? (
            <EmptyState title="Aucun scan" description="Ajoutez un site puis lancez un scan WordPress." />
          ) : (
            <div className="divide-y divide-zinc-100">
              {latestScans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/sites/${scan.siteId}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-950">{scan.site.name}</p>
                    <p className="text-sm text-zinc-500">{formatDateTime(scan.createdAt)}</p>
                  </div>
                  <Badge value={scan.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sites a surveiller</CardTitle>
            <Activity className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          </CardHeader>
          {issueSites.length === 0 ? (
            <EmptyState title="Aucune alerte simple" description="Les sites actifs ne remontent pas d'anomalie de connexion." />
          ) : (
            <div className="divide-y divide-zinc-100">
              {issueSites.map((site) => (
                <Link key={site.id} href={`/sites/${site.id}`} className="flex justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-950">{site.name}</p>
                    <p className="text-sm text-zinc-500">{site.client.companyName || site.client.name}</p>
                  </div>
                  <Badge value={site.connectionStatus === "failed" ? "failed" : site.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dernieres interventions</CardTitle>
            <Wrench className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          </CardHeader>
          <div className="divide-y divide-zinc-100">
            {latestInterventions.map((intervention) => (
              <Link key={intervention.id} href={`/interventions/${intervention.id}`} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-950">{intervention.title}</p>
                  <p className="text-sm text-zinc-500">{intervention.site.name}</p>
                </div>
                <Badge value={intervention.status} />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Derniers rapports</CardTitle>
            <Link href="/reports/new" className="text-sm font-medium text-blue-700 hover:text-blue-900">
              Generer
            </Link>
          </CardHeader>
          <div className="divide-y divide-zinc-100">
            {latestReports.map((report) => (
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
      </section>
    </>
  );
}
