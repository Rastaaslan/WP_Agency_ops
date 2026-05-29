import { connection } from "next/server";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardSummary } from "@/features/dashboard/services/dashboard-service";
import {
  formatDate,
  formatDateTime,
  formatEnumLabel,
  formatNullable,
  readWpurSummary,
} from "@/lib/format";

export default async function Home() {
  await connection();

  const dashboard = await getDashboardSummary();
  const hasWatchPoints =
    dashboard.watchPoints.forms.length > 0 ||
    dashboard.watchPoints.backups.length > 0 ||
    dashboard.watchPoints.securityChecks.length > 0 ||
    dashboard.watchPoints.performanceChecks.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Vue synthétique du portefeuille WordPress : activité récente, interventions ouvertes et points à surveiller."
        eyebrow="Cockpit global WordPress"
        title="Tableau de bord"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/api/health"
        >
          État application
        </Link>
      </PageHeader>

      <section
        aria-label="Vue d'ensemble"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          href="/clients"
          label="Clients actifs"
          value={dashboard.overview.activeClientCount}
        />
        <KpiCard
          href="/sites"
          label="Sites actifs"
          value={dashboard.overview.activeSiteCount}
        />
        <KpiCard
          href="/interventions"
          label="Interventions ouvertes"
          value={dashboard.overview.openInterventionCount}
        />
        <KpiCard
          href="/sites"
          label="Sites suivis récemment"
          value={dashboard.overview.recentlyTrackedSiteCount}
        />
      </section>

      <SectionPanel
        description="Indicateurs légers des trente derniers jours."
        title="Signaux opérationnels"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SignalItem
            label="Sites avec import WPUR récent"
            value={dashboard.signals.sitesWithRecentWpurImportCount}
          />
          <SignalItem
            label="Sauvegardes récentes"
            value={dashboard.signals.recentBackupCount}
          />
          <SignalItem
            label="Formulaires à vérifier"
            value={dashboard.signals.formsToWatchCount}
          />
          <SignalItem
            label="Contrôles sécurité"
            value={dashboard.signals.recentSecurityCheckCount}
          />
          <SignalItem
            label="Contrôles performance"
            value={dashboard.signals.recentPerformanceCheckCount}
          />
        </div>
      </SectionPanel>

      <SectionPanel title="Actions rapides">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ActionLink href="/clients/new" label="Nouveau client" />
          <ActionLink href="/sites/new" label="Nouveau site" />
          <ActionLink href="/interventions/new" label="Nouvelle intervention" />
          <ActionLink
            href="/sites"
            label="Importer un export WPUR"
            note="Depuis une fiche site"
          />
          <ActionLink
            href="/sites"
            label="Ajouter une sauvegarde"
            note="Depuis une fiche site"
          />
          <ActionLink
            href="/sites"
            label="Ajouter un formulaire surveillé"
            note="Depuis une fiche site"
          />
        </div>
      </SectionPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionPanel title="Interventions à suivre">
          {dashboard.interventionsToFollow.length === 0 ? (
            <InlineEmpty message="Aucune intervention planifiée, en cours ou en incident." />
          ) : (
            <div className="divide-y divide-zinc-200">
              {dashboard.interventionsToFollow.map((intervention) => (
                <article className="py-4 first:pt-0 last:pb-0" key={intervention.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-medium text-zinc-950">
                        <Link
                          className="text-cyan-800 hover:text-cyan-950"
                          href={`/interventions/${intervention.id}`}
                        >
                          {intervention.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">
                        {intervention.site.name} ·{" "}
                        {formatNullable(intervention.site.client?.name)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {formatDate(intervention.date)} ·{" "}
                        {formatEnumLabel(intervention.type)}
                      </p>
                    </div>
                    <StatusBadge value={intervention.status} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionPanel>

        <SectionPanel title="Derniers sites">
          {dashboard.latestSites.length === 0 ? (
            <InlineEmpty message="Aucun site actif ou en pause n'est encore suivi." />
          ) : (
            <div className="divide-y divide-zinc-200">
              {dashboard.latestSites.map((site) => (
                <article className="py-4 first:pt-0 last:pb-0" key={site.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-medium text-zinc-950">
                        <Link
                          className="text-cyan-800 hover:text-cyan-950"
                          href={`/sites/${site.id}`}
                        >
                          {site.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">
                        {formatNullable(site.client?.name)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge value={site.environment} />
                      <StatusBadge value={site.status} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionPanel>
      </div>

      <SectionPanel
        description="Synthèse des imports existants. Les rapports détaillés plugins restent dans WPUR."
        title="Derniers imports WPUR"
      >
        {dashboard.latestWpurImports.length === 0 ? (
          <InlineEmpty message="Aucun import WPUR n'est encore enregistré." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3 text-right">Alertes</th>
                  <th className="px-4 py-3">Importé le</th>
                  <th className="px-4 py-3 text-right">Fiche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {dashboard.latestWpurImports.map((wpurImport) => {
                  const summary = readWpurSummary(
                    wpurImport.summaryJson,
                    wpurImport.periodMonth,
                  );

                  return (
                    <tr key={wpurImport.id}>
                      <td className="px-4 py-4">
                        <Link
                          className="font-medium text-cyan-800 hover:text-cyan-950"
                          href={`/sites/${wpurImport.site.id}`}
                        >
                          {wpurImport.site.name}
                        </Link>
                        <span className="mt-1 block text-zinc-500">
                          {formatNullable(wpurImport.site.client?.name)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-700">
                        {summary.periodMonth}
                      </td>
                      <td className="px-4 py-4 text-right text-zinc-700">
                        {summary.alertCount}
                      </td>
                      <td className="px-4 py-4 text-zinc-600">
                        {formatDateTime(wpurImport.importedAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          className="font-medium text-cyan-800 hover:text-cyan-950"
                          href={`/sites/${wpurImport.site.id}`}
                        >
                          Voir site
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      <SectionPanel
        description="Synthèse non alarmiste des éléments qui méritent une revue."
        title="Points à surveiller"
      >
        {hasWatchPoints ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <WatchGroup title="Formulaires à vérifier">
              {dashboard.watchPoints.forms.length === 0 ? (
                <InlineEmpty message="Aucun formulaire à vérifier." />
              ) : (
                dashboard.watchPoints.forms.map((watchedForm) => (
                  <WatchItem
                    href={`/sites/${watchedForm.site.id}`}
                    key={watchedForm.id}
                    meta={`${watchedForm.site.name} · ${formatDateTime(
                      watchedForm.lastCheckedAt,
                    )}`}
                    status={watchedForm.status}
                    title={watchedForm.name}
                  />
                ))
              )}
            </WatchGroup>

            <WatchGroup title="Sauvegardes récentes">
              {dashboard.watchPoints.backups.length === 0 ? (
                <InlineEmpty message="Aucune sauvegarde à vérifier." />
              ) : (
                dashboard.watchPoints.backups.map((backup) => (
                  <WatchItem
                    href={`/sites/${backup.site.id}`}
                    key={backup.id}
                    meta={`${backup.site.name} · ${formatDateTime(
                      backup.performedAt,
                    )}`}
                    status={backup.status}
                    title={formatEnumLabel(backup.type)}
                  />
                ))
              )}
            </WatchGroup>

            <WatchGroup title="Contrôles sécurité">
              {dashboard.watchPoints.securityChecks.length === 0 ? (
                <InlineEmpty message="Aucun contrôle sécurité à vérifier." />
              ) : (
                dashboard.watchPoints.securityChecks.map((securityCheck) => (
                  <WatchItem
                    href={`/sites/${securityCheck.site.id}`}
                    key={securityCheck.id}
                    meta={`${securityCheck.site.name} · ${formatDateTime(
                      securityCheck.checkedAt,
                    )}`}
                    status={securityCheck.status}
                    title={formatNullable(
                      securityCheck.summary,
                      "Contrôle à vérifier",
                    )}
                  />
                ))
              )}
            </WatchGroup>

            <WatchGroup title="Contrôles performance">
              {dashboard.watchPoints.performanceChecks.length === 0 ? (
                <InlineEmpty message="Aucun contrôle performance à vérifier." />
              ) : (
                dashboard.watchPoints.performanceChecks.map(
                  (performanceCheck) => (
                    <WatchItem
                      href={`/sites/${performanceCheck.site.id}`}
                      key={performanceCheck.id}
                      meta={`${performanceCheck.site.name} · ${formatDateTime(
                        performanceCheck.checkedAt,
                      )}`}
                      status={performanceCheck.status}
                      title={formatNullable(
                        performanceCheck.summary,
                        "Contrôle à vérifier",
                      )}
                    />
                  ),
                )
              )}
            </WatchGroup>
          </div>
        ) : (
          <InlineEmpty message="Aucun point à surveiller dans les données actuelles." />
        )}
      </SectionPanel>
    </div>
  );
}

function KpiCard({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: number;
}) {
  return (
    <Link
      className="rounded-md border border-zinc-200 bg-white p-5 transition hover:border-cyan-300 hover:shadow-sm"
      href={href}
    >
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      <span className="mt-3 block text-3xl font-semibold tracking-normal text-zinc-950">
        {value}
      </span>
    </Link>
  );
}

function SignalItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l-2 border-zinc-200 pl-3">
      <p className="text-sm text-zinc-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function ActionLink({
  href,
  label,
  note,
}: {
  href: string;
  label: string;
  note?: string;
}) {
  return (
    <Link
      className="min-h-16 rounded-md border border-zinc-200 px-4 py-3 text-sm font-medium text-cyan-800 transition hover:border-cyan-300"
      href={href}
    >
      <span className="block">{label}</span>
      {note ? (
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          {note}
        </span>
      ) : null}
    </Link>
  );
}

function WatchGroup({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function WatchItem({
  href,
  meta,
  status,
  title,
}: {
  href: string;
  meta: string;
  status: string;
  title: string;
}) {
  return (
    <article className="border-l-2 border-amber-200 pl-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            className="font-medium text-cyan-800 hover:text-cyan-950"
            href={href}
          >
            {title}
          </Link>
          <p className="mt-1 text-sm text-zinc-600">{meta}</p>
        </div>
        <StatusBadge value={status} />
      </div>
    </article>
  );
}

function InlineEmpty({ message }: { message: string }) {
  return <p className="text-sm leading-6 text-zinc-600">{message}</p>;
}
