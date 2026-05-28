import Link from "next/link";
import {
  Archive,
  ClipboardCheck,
  Edit,
  FileText,
  Gauge,
  Radar,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createInterventionFromScan } from "@/features/maintenance/actions";
import { runPerformanceCheck } from "@/features/performance/actions";
import { generateReport } from "@/features/reports/actions";
import { runSecurityCheck } from "@/features/security/actions";
import { archiveSite } from "@/features/sites/actions";
import { saveStaticCompatibilityReview } from "@/features/static-publish/actions";
import {
  checkSiteWordPressConnection,
  runManualWordPressScan,
  runPublicWordPressScan,
} from "@/features/wordpress/actions";
import { dateInputValue, formatDateTime, startOfCurrentMonth, endOfToday } from "@/lib/dates";
import { formatDate } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await prisma.wordPressSite.findUnique({
    where: { id },
    include: {
      client: true,
      scans: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { plugins: true, themes: true },
      },
      interventions: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true },
      },
      reports: { orderBy: { createdAt: "desc" }, take: 6 },
      forms: { orderBy: { updatedAt: "desc" } },
      performanceChecks: { orderBy: { createdAt: "desc" }, take: 6 },
      securityChecks: { orderBy: { createdAt: "desc" }, take: 6 },
      staticReviews: { orderBy: { createdAt: "desc" }, take: 1 },
      connection: true,
    },
  });

  if (!site) {
    notFound();
  }

  const latestScan = site.scans[0];
  const latestStaticReview = site.staticReviews[0];
  const publicScanAction = runPublicWordPressScan.bind(null, site.id);
  const connectionCheckAction = checkSiteWordPressConnection.bind(null, site.id);
  const manualScanAction = runManualWordPressScan.bind(null, site.id);
  const performanceAction = runPerformanceCheck.bind(null, site.id);
  const securityAction = runSecurityCheck.bind(null, site.id);
  const archiveAction = archiveSite.bind(null, site.id);
  const staticReviewAction = saveStaticCompatibilityReview.bind(null, site.id);

  return (
    <>
      <PageHeader
        title={site.name}
        description={`${site.client.companyName || site.client.name} - ${site.url}`}
        actions={
          <>
            <Link href={`/sites/${site.id}/edit`} className={buttonClassName({ variant: "secondary" })}>
              <Edit className="h-4 w-4" aria-hidden="true" />
              Modifier
            </Link>
            <Link href={`/interventions/new?siteId=${site.id}`} className={buttonClassName({ variant: "secondary" })}>
              <Wrench className="h-4 w-4" aria-hidden="true" />
              Intervention
            </Link>
            <Link href={`/reports/new?siteId=${site.id}`} className={buttonClassName({ variant: "secondary" })}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Rapport
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

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardTitle>Vue generale</CardTitle>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="text-zinc-500">Client</dt><dd><Link className="font-medium text-blue-700" href={`/clients/${site.clientId}`}>{site.client.companyName || site.client.name}</Link></dd></div>
            <div><dt className="text-zinc-500">Connexion</dt><dd><Badge value={site.connectionStatus} /></dd></div>
            <div><dt className="text-zinc-500">Mode</dt><dd><Badge value={site.connectionType} /></dd></div>
            <div><dt className="text-zinc-500">Environnement</dt><dd><Badge value={site.environment} /></dd></div>
            <div><dt className="text-zinc-500">Dernier test connexion</dt><dd>{site.connection?.lastConnectionCheckAt ? formatDateTime(site.connection.lastConnectionCheckAt) : "Aucun"}</dd></div>
            <div><dt className="text-zinc-500">Dernier scan</dt><dd>{site.lastScanAt ? formatDateTime(site.lastScanAt) : "Aucun"}</dd></div>
          </dl>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Actions techniques</CardTitle>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <form action={connectionCheckAction}>
              <Button type="submit" variant="secondary" className="w-full">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Tester la connexion
              </Button>
            </form>
            <form action={publicScanAction}>
              <Button type="submit" className="w-full">
                <Radar className="h-4 w-4" aria-hidden="true" />
                Scan REST public
              </Button>
            </form>
            <form action={securityAction}>
              <Button type="submit" variant="secondary" className="w-full">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Check securite
              </Button>
            </form>
            <form action={performanceAction} className="grid gap-2 md:col-span-2 md:grid-cols-[1fr_auto]">
              <input name="url" placeholder={site.url} />
              <Button type="submit" variant="secondary">
                <Gauge className="h-4 w-4" aria-hidden="true" />
                Check performance
              </Button>
            </form>
          </div>
          <form action={manualScanAction} className="mt-5 grid gap-3 border-t border-zinc-100 pt-5">
            <p className="text-sm font-semibold text-zinc-950">Snapshot manuel</p>
            <div className="grid gap-3 md:grid-cols-2">
              <input name="wpVersion" placeholder="Version WordPress, ex. 6.8.1" />
              <input name="phpVersion" placeholder="Version PHP, ex. 8.2" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <textarea name="pluginsText" rows={4} placeholder="Plugins, un par ligne. Exemple: SEO Toolkit@4.2.0" />
              <textarea name="themesText" rows={4} placeholder="Themes, un par ligne. Exemple: Theme Client@1.0.0" />
            </div>
            <textarea name="notes" rows={3} placeholder="Notes du snapshot manuel" />
            <Button type="submit" variant="secondary" className="w-fit">
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
              Enregistrer le snapshot
            </Button>
          </form>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scans</CardTitle>
            <Badge value={latestScan?.status ?? "unknown"} />
          </CardHeader>
          <div className="divide-y divide-zinc-100">
            {site.scans.map((scan) => (
              <div key={scan.id} className="grid gap-3 py-3 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-medium text-zinc-950">{formatDateTime(scan.createdAt)}</p>
                  <p className="text-sm text-zinc-500">{scan.errorMessage || "Snapshot stocke en base."}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge value={scan.status} />
                  {scan.status === "success" ? (
                    <form action={createInterventionFromScan.bind(null, scan.id)}>
                      <Button type="submit" variant="secondary" className="h-8 px-2 text-xs">
                        Creer intervention
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Plugins & themes</CardTitle>
          {latestScan ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-zinc-950">Plugins</p>
                <div className="mt-2 divide-y divide-zinc-100">
                  {latestScan.plugins.length === 0 ? <p className="py-3 text-sm text-zinc-500">Aucun plugin detecte en mode REST public.</p> : latestScan.plugins.map((plugin) => (
                    <div key={plugin.id} className="flex justify-between gap-3 py-2 text-sm">
                      <span>{plugin.name}</span>
                      <Badge value={plugin.status} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-950">Themes</p>
                <div className="mt-2 divide-y divide-zinc-100">
                  {latestScan.themes.length === 0 ? <p className="py-3 text-sm text-zinc-500">Aucun theme detecte en mode REST public.</p> : latestScan.themes.map((theme) => (
                    <div key={theme.id} className="flex justify-between gap-3 py-2 text-sm">
                      <span>{theme.name}</span>
                      <Badge value={theme.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Lancez un scan ou creez un snapshot manuel.</p>
          )}
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Interventions</CardTitle>
            <Link href={`/interventions/new?siteId=${site.id}`} className="text-sm font-medium text-blue-700">Nouvelle</Link>
          </CardHeader>
          <div className="divide-y divide-zinc-100">
            {site.interventions.map((intervention) => (
              <Link key={intervention.id} href={`/interventions/${intervention.id}`} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-950">{intervention.title}</p>
                  <p className="text-sm text-zinc-500">{formatDate(intervention.createdAt)}</p>
                </div>
                <Badge value={intervention.status} />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapports</CardTitle>
            <Link href={`/reports/new?siteId=${site.id}`} className="text-sm font-medium text-blue-700">Generer</Link>
          </CardHeader>
          <div className="divide-y divide-zinc-100">
            {site.reports.map((report) => (
              <Link key={report.id} href={`/reports/${report.id}`} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-950">{report.title}</p>
                  <p className="text-sm text-zinc-500">{formatDate(report.createdAt)}</p>
                </div>
                <Badge value={report.status} />
              </Link>
            ))}
          </div>
          <form action={generateReport} className="mt-4 hidden">
            <input type="hidden" name="siteId" value={site.id} />
            <input type="hidden" name="periodStart" value={dateInputValue(startOfCurrentMonth())} />
            <input type="hidden" name="periodEnd" value={dateInputValue(endOfToday())} />
          </form>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle>Formulaires</CardTitle>
          <div className="mt-4 divide-y divide-zinc-100">
            {site.forms.map((form) => (
              <div key={form.id} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-950">{form.name}</p>
                  <p className="text-sm text-zinc-500">{form.pageUrl || "URL non renseignee"}</p>
                </div>
                <Badge value={form.status} />
              </div>
            ))}
          </div>
          <Link href={`/forms?siteId=${site.id}`} className={buttonClassName({ variant: "secondary", className: "mt-4" })}>
            Ajouter un formulaire
          </Link>
        </Card>

        <Card>
          <CardTitle>Performance</CardTitle>
          <div className="mt-4 divide-y divide-zinc-100">
            {site.performanceChecks.map((check) => (
              <div key={check.id} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-950">{check.responseTimeMs ?? "n/a"} ms</p>
                  <p className="text-sm text-zinc-500">{check.url}</p>
                </div>
                <Badge value={check.status} />
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle>Securite</CardTitle>
          <div className="mt-4 divide-y divide-zinc-100">
            {site.securityChecks.map((check) => (
              <div key={check.id} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-950">{formatDate(check.createdAt)}</p>
                  <p className="text-sm text-zinc-500">{check.notes}</p>
                </div>
                <Badge value={check.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Static Publish</CardTitle>
            <Badge value={latestStaticReview?.status ?? "unknown"} />
          </CardHeader>
          <p className="text-sm text-zinc-500">
            Score actuel : {latestStaticReview?.score ?? "non evalue"}. Module prepare pour analyser les sites vitrines avant une publication statique future.
          </p>
          <form action={staticReviewAction} className="mt-4 grid gap-3">
            {[
              ["isBrochureSite", "Site vitrine"],
              ["noDynamicCommerce", "Pas de WooCommerce dynamique"],
              ["noMemberArea", "Pas d'espace membre"],
              ["formsIdentified", "Formulaires identifies"],
              ["searchIdentified", "Recherche interne identifiee"],
              ["commentsIdentified", "Commentaires identifies"],
            ].map(([name, label]) => (
              <label key={name} className="flex grid-cols-none flex-row items-center gap-2 text-sm font-normal">
                <input className="h-4 w-4" type="checkbox" name={name} defaultChecked={Boolean(latestStaticReview?.[name as keyof typeof latestStaticReview])} />
                {label}
              </label>
            ))}
            <textarea name="recommendations" rows={3} placeholder="Recommandations techniques" defaultValue={latestStaticReview?.recommendations ?? ""} />
            <Button type="submit" variant="secondary" className="w-fit">Enregistrer l&apos;analyse</Button>
          </form>
        </Card>
      </section>
    </>
  );
}
