import Link from "next/link";
import {
  Archive,
  ClipboardCheck,
  Download,
  Edit,
  FileText,
  Gauge,
  HardDrive,
  Radar,
  RefreshCw,
  ShieldCheck,
  Upload,
  Wrench,
} from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { saveBackupRecord } from "@/features/backups/actions";
import { backupStatusValues } from "@/features/backups/schemas";
import { createInterventionFromScan } from "@/features/maintenance/actions";
import { runPerformanceCheck } from "@/features/performance/actions";
import { generateReport } from "@/features/reports/actions";
import { runSecurityCheck } from "@/features/security/actions";
import { archiveSite } from "@/features/sites/actions";
import { saveStaticCompatibilityReview } from "@/features/static-publish/actions";
import { importWpurPayloadAction } from "@/features/wpur-integration/actions";
import type { WpurImportSummary } from "@/features/wpur-integration/types";
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
      backupRecords: {
        orderBy: { checkedAt: "desc" },
        take: 6,
        include: { intervention: { select: { id: true, title: true } } },
      },
      wpurImports: { orderBy: { importedAt: "desc" }, take: 5 },
      connection: true,
    },
  });

  if (!site) {
    notFound();
  }

  const latestScan = site.scans[0];
  const latestSecurityCheck = site.securityChecks[0];
  const latestPerformanceCheck = site.performanceChecks[0];
  const latestStaticReview = site.staticReviews[0];
  const latestBackupRecord = site.backupRecords[0];
  const latestWpurImport = site.wpurImports[0];
  const latestWpurSummary = latestWpurImport?.summaryJson as WpurImportSummary | undefined;
  const formsToCheck = site.forms.filter((form) => form.status === "untested" || form.status === "issue").length;
  const globalStatus =
    site.connectionStatus === "failed" ||
    latestSecurityCheck?.status === "issue" ||
    latestSecurityCheck?.status === "failed" ||
    latestPerformanceCheck?.status === "issue" ||
    latestPerformanceCheck?.status === "failed" ||
    formsToCheck > 0
      ? "action_conseillee"
      : latestSecurityCheck?.status === "warning" ||
          latestPerformanceCheck?.status === "warning" ||
          latestBackupRecord?.status === "warning"
        ? "a_surveiller"
        : "ok";
  const publicScanAction = runPublicWordPressScan.bind(null, site.id);
  const connectionCheckAction = checkSiteWordPressConnection.bind(null, site.id);
  const manualScanAction = runManualWordPressScan.bind(null, site.id);
  const performanceAction = runPerformanceCheck.bind(null, site.id);
  const securityAction = runSecurityCheck.bind(null, site.id);
  const archiveAction = archiveSite.bind(null, site.id);
  const staticReviewAction = saveStaticCompatibilityReview.bind(null, site.id);
  const backupRecordAction = saveBackupRecord.bind(null, site.id);
  const wpurImportAction = importWpurPayloadAction.bind(null, site.id);
  const sectionLinks = [
    ["#overview", "Vue generale"],
    ["#interventions", "Interventions"],
    ["#security", "Securite"],
    ["#performance", "Performance"],
    ["#forms", "Formulaires"],
    ["#backups", "Sauvegardes"],
    ["#wpur", "WPUR / Plugins"],
    ["#static-publish", "Static Publish"],
    ["#notes", "Notes"],
  ];

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

      <nav aria-label="Sections du site" className="mb-6 flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-white p-2">
        {sectionLinks.map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="overview" className="scroll-mt-24 grid gap-6 xl:grid-cols-3">
        <Card>
          <CardTitle>Vue generale</CardTitle>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="text-zinc-500">Client</dt><dd><Link className="font-medium text-blue-700" href={`/clients/${site.clientId}`}>{site.client.companyName || site.client.name}</Link></dd></div>
            <div><dt className="text-zinc-500">Statut global</dt><dd><Badge value={globalStatus} label={globalStatus === "ok" ? "OK" : globalStatus === "a_surveiller" ? "A surveiller" : "Action conseillee"} /></dd></div>
            <div><dt className="text-zinc-500">Connexion</dt><dd><Badge value={site.connectionStatus} /></dd></div>
            <div><dt className="text-zinc-500">Mode</dt><dd><Badge value={site.connectionType} /></dd></div>
            <div><dt className="text-zinc-500">Environnement</dt><dd><Badge value={site.environment} /></dd></div>
            <div><dt className="text-zinc-500">Dernier test connexion</dt><dd>{site.connection?.lastConnectionCheckAt ? formatDateTime(site.connection.lastConnectionCheckAt) : "Aucun"}</dd></div>
            <div><dt className="text-zinc-500">Dernier scan</dt><dd>{site.lastScanAt ? formatDateTime(site.lastScanAt) : "Aucun"}</dd></div>
            <div><dt className="text-zinc-500">Derniere sauvegarde</dt><dd>{latestBackupRecord ? formatDate(latestBackupRecord.checkedAt) : "Aucune"}</dd></div>
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
            <Link href={`/api/sites/${site.id}/technical-export`} className={buttonClassName({ variant: "secondary", className: "md:col-span-2" })}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export technique JSON
            </Link>
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

      <section id="interventions" className="scroll-mt-24 mt-6 grid gap-6 xl:grid-cols-2">
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
          <CardTitle>Snapshot WordPress leger</CardTitle>
          <p className="mt-2 text-sm text-zinc-500">
            Inventaire issu du REST public, du plugin compagnon ou d&apos;un snapshot manuel. Les rapports plugins detailles restent du cote WPUR.
          </p>
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
        <Card id="forms" className="scroll-mt-24">
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

        <Card id="performance" className="scroll-mt-24">
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
        <Card id="backups" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>Sauvegardes</CardTitle>
            <Badge value={latestBackupRecord?.status ?? "unknown"} />
          </CardHeader>
          <form action={backupRecordAction} className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <label>
                Date
                <input type="date" name="checkedAt" defaultValue={dateInputValue(new Date())} />
              </label>
              <label>
                Statut
                <select name="status" defaultValue="ok">
                  {backupStatusValues.map((status) => (
                    <option key={status} value={status}>
                      {status === "ok" ? "OK" : status === "warning" ? "A surveiller" : status === "issue" ? "Probleme" : "Inconnu"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="flex grid-cols-none flex-row items-center gap-2 text-sm font-normal">
                <input className="h-4 w-4" type="checkbox" name="filesBackedUp" defaultChecked />
                Sauvegarde fichiers verifiee
              </label>
              <label className="flex grid-cols-none flex-row items-center gap-2 text-sm font-normal">
                <input className="h-4 w-4" type="checkbox" name="databaseBackedUp" defaultChecked />
                Sauvegarde base verifiee
              </label>
            </div>
            <label>
              Intervention liee
              <select name="interventionId" defaultValue="">
                <option value="">Aucune intervention liee</option>
                {site.interventions.map((intervention) => (
                  <option key={intervention.id} value={intervention.id}>
                    {intervention.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Note
              <textarea name="notes" rows={3} placeholder="Emplacement, outil utilise, verification effectuee" />
            </label>
            <Button type="submit" variant="secondary" className="w-fit">
              <HardDrive className="h-4 w-4" aria-hidden="true" />
              Enregistrer la sauvegarde
            </Button>
          </form>
          <div className="mt-4 divide-y divide-zinc-100">
            {site.backupRecords.map((record) => (
              <div key={record.id} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-950">{formatDate(record.checkedAt)}</p>
                  <p className="text-sm text-zinc-500">
                    Fichiers : {record.filesBackedUp ? "oui" : "non"} - Base : {record.databaseBackedUp ? "oui" : "non"}
                    {record.intervention ? ` - ${record.intervention.title}` : ""}
                  </p>
                </div>
                <Badge value={record.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card id="wpur" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>WPUR / Plugins</CardTitle>
            <Badge value={latestWpurImport ? "ok" : "unknown"} label={latestWpurImport ? "Import disponible" : "Aucun import"} />
          </CardHeader>
          <p className="text-sm text-zinc-500">
            WPUR reste le module specialise pour la maintenance plugins. Ici, le cockpit importe son payload JSON et affiche seulement une synthese.
          </p>
          <form action={wpurImportAction} className="mt-4 grid gap-3">
            <label>
              Payload WPUR JSON
              <textarea name="payloadJson" rows={7} placeholder='{"schemaVersion":"1.0","reportType":"monthly_maintenance_matrix",...}' />
            </label>
            <Button type="submit" variant="secondary" className="w-fit">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Importer payload WPUR JSON
            </Button>
          </form>
          {latestWpurImport ? (
            <div className="mt-5 border-t border-zinc-100 pt-4">
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div><p className="text-zinc-500">Periode</p><p className="font-medium text-zinc-950">{latestWpurSummary?.periodLabel ?? latestWpurImport.periodMonth}</p></div>
                <div><p className="text-zinc-500">Importe le</p><p className="font-medium text-zinc-950">{formatDateTime(latestWpurImport.importedAt)}</p></div>
                <div><p className="text-zinc-500">Dates maintenance</p><p className="font-medium text-zinc-950">{latestWpurSummary?.maintenanceDateCount ?? 0}</p></div>
                <div><p className="text-zinc-500">Sections</p><p className="font-medium text-zinc-950">{latestWpurSummary?.sectionCount ?? 0}</p></div>
                <div><p className="text-zinc-500">Plugins listes</p><p className="font-medium text-zinc-950">{latestWpurSummary?.pluginCount ?? 0}</p></div>
                <div><p className="text-zinc-500">Mises a jour cochees</p><p className="font-medium text-zinc-950">{latestWpurSummary?.updateCheckCount ?? 0}</p></div>
                <div><p className="text-zinc-500">Alertes</p><p className="font-medium text-zinc-950">{latestWpurSummary?.alertCount ?? 0}</p></div>
                <div><p className="text-zinc-500">Ajoutes / supprimes / changes</p><p className="font-medium text-zinc-950">{latestWpurSummary?.pluginsAdded ?? 0} / {latestWpurSummary?.pluginsRemoved ?? 0} / {latestWpurSummary?.pluginsChanged ?? 0}</p></div>
              </div>
              {(latestWpurSummary?.firstAlerts?.length ?? 0) > 0 ? (
                <div className="mt-4 divide-y divide-zinc-100">
                  {latestWpurSummary?.firstAlerts.map((alert) => (
                    <div key={`${alert.type}-${alert.message}`} className="py-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-zinc-950">{alert.pluginName || alert.type}</p>
                        <Badge value={alert.level} />
                      </div>
                      <p className="text-zinc-500">{alert.message}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              <Link href={`/api/wpur-imports/${latestWpurImport.id}/payload`} className={buttonClassName({ variant: "secondary", className: "mt-4" })}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Payload complet
              </Link>
            </div>
          ) : null}
          {site.wpurImports.length > 1 ? (
            <div className="mt-5 border-t border-zinc-100 pt-4">
              <p className="text-sm font-semibold text-zinc-950">Imports precedents</p>
              <div className="mt-2 divide-y divide-zinc-100">
                {site.wpurImports.slice(1).map((wpurImport) => (
                  <Link key={wpurImport.id} href={`/api/wpur-imports/${wpurImport.id}/payload`} className="flex justify-between gap-4 py-2 text-sm">
                    <span>{wpurImport.periodMonth}</span>
                    <span className="text-zinc-500">{formatDate(wpurImport.importedAt)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card id="security" className="scroll-mt-24">
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

        <Card id="static-publish" className="scroll-mt-24">
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

      <section id="notes" className="scroll-mt-24 mt-6">
        <Card>
          <CardTitle>Notes</CardTitle>
          <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-600">
            {site.notes || "Aucune note interne pour ce site."}
          </p>
        </Card>
      </section>
    </>
  );
}
