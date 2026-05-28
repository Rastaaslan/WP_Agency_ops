import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { StatusBadge } from "@/components/status-badge";
import { listBackupsBySite } from "@/features/backups/services/backup-service";
import { listFormsBySite } from "@/features/forms/services/form-watch-service";
import { listInterventionsBySite } from "@/features/interventions/services/intervention-service";
import { SecurityCheckForm } from "@/features/security/components/security-check-form";
import { runSecurityCheckAction } from "@/features/security/security-actions";
import { listSecurityChecksBySite } from "@/features/security/services/security-check-service";
import { archiveSiteAction } from "@/features/sites/site-actions";
import { ArchiveSiteForm } from "@/features/sites/components/archive-site-form";
import { getSiteById } from "@/features/sites/services/site-service";
import { listWpurImportsBySite } from "@/features/wpur/services/wpur-import-service";
import {
  formatDate,
  formatDateTime,
  formatEnumLabel,
  formatNullable,
  readWpurSummary,
} from "@/lib/format";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const [
    site,
    interventions,
    securityChecks,
    backups,
    watchedForms,
    wpurImports,
  ] =
    await Promise.all([
      getSiteById(id),
      listInterventionsBySite(id),
      listSecurityChecksBySite(id),
      listBackupsBySite(id),
      listFormsBySite(id),
      listWpurImportsBySite(id),
    ]);

  if (!site) {
    notFound();
  }

  const latestSecurityCheck = securityChecks[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        description={site.url}
        eyebrow="Site WordPress"
        title={site.name}
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/sites"
        >
          Retour sites
        </Link>
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/sites/${site.id}/edit`}
        >
          Modifier
        </Link>
        <ArchiveSiteForm
          action={archiveSiteAction.bind(null, site.id)}
          disabled={site.status === "archived"}
        />
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-4">
        <InfoTile label="Statut">
          <StatusBadge value={site.status} />
        </InfoTile>
        <InfoTile label="Environnement">
          <StatusBadge value={site.environment} />
        </InfoTile>
        <InfoTile label="Client">
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
        </InfoTile>
        <InfoTile label="URL">
          <a
            className="font-medium text-cyan-800 hover:text-cyan-950"
            href={site.url}
            rel="noreferrer"
            target="_blank"
          >
            Ouvrir le site
          </a>
        </InfoTile>
      </section>

      <SectionPanel title="Résumé site">
        <dl className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="font-medium text-zinc-500">Nom</dt>
            <dd className="mt-1 text-zinc-900">{site.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Notes</dt>
            <dd className="mt-1 text-zinc-900">
              {formatNullable(site.notes, "Aucune note site renseignée.")}
            </dd>
          </div>
        </dl>
      </SectionPanel>

      <SectionPanel
        description="Dernières interventions globales enregistrées pour ce site."
        title="Interventions récentes"
      >
        <div className="mb-5">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
            href={`/interventions/new?siteId=${site.id}`}
          >
            Nouvelle intervention pour ce site
          </Link>
        </div>
        {interventions.length === 0 ? (
          <InlineEmpty message="Aucune intervention n'est encore liée à ce site. L'action ci-dessus permet d'en créer une déjà rattachée." />
        ) : (
          <div className="divide-y divide-zinc-200">
            {interventions.map((intervention) => (
              <article className="py-4 first:pt-0 last:pb-0" key={intervention.id}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="font-medium text-zinc-950">
                      <Link
                        className="text-cyan-800 hover:text-cyan-950"
                        href={`/interventions/${intervention.id}`}
                      >
                        {intervention.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatDate(intervention.date)} ·{" "}
                      {formatEnumLabel(intervention.type)}
                    </p>
                  </div>
                  <StatusBadge value={intervention.status} />
                </div>
                {intervention.clientSummary ? (
                  <p className="mt-3 text-sm leading-6 text-zinc-700">
                    {intervention.clientSummary}
                  </p>
                ) : null}
                {intervention.items.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                    {intervention.items.map((item) => (
                      <li
                        className="flex flex-col gap-2 border-l-2 border-zinc-200 pl-3 sm:flex-row sm:items-center sm:justify-between"
                        key={item.id}
                      >
                        <span>{item.label}</span>
                        <StatusBadge value={item.status} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </SectionPanel>

      <SectionPanel
        description="Contrôle non offensif limité à l'URL du site, quelques en-têtes HTTP et deux fichiers publics. Aucun scan massif, brute force ou test d'exploitation n'est lancé."
        title="Sécurité"
      >
        <div className="mb-5">
          <SecurityCheckForm
            action={runSecurityCheckAction.bind(null, site.id)}
          />
        </div>
        {latestSecurityCheck ? (
          <div className="space-y-5">
            <dl className="grid gap-4 text-sm md:grid-cols-3">
              <SecurityMetric label="Dernier statut">
                <SecurityStatusBadge value={latestSecurityCheck.status} />
              </SecurityMetric>
              <SecurityMetric label="Date du contrôle">
                {formatDateTime(latestSecurityCheck.checkedAt)}
              </SecurityMetric>
              <SecurityMetric label="HTTP">
                {formatNullable(
                  latestSecurityCheck.httpStatus?.toString(),
                  "Non joignable",
                )}
              </SecurityMetric>
              <SecurityMetric label="HTTPS">
                {formatSecurityBoolean(latestSecurityCheck.httpsEnabled)}
              </SecurityMetric>
              <SecurityMetric label="HSTS">
                {formatHeaderPresence(latestSecurityCheck.hstsHeader)}
              </SecurityMetric>
              <SecurityMetric label="Content Security Policy">
                {formatHeaderPresence(latestSecurityCheck.cspHeader)}
              </SecurityMetric>
              <SecurityMetric label="X-Frame-Options">
                {formatHeaderPresence(latestSecurityCheck.xFrameOptionsHeader)}
              </SecurityMetric>
              <SecurityMetric label="X-Content-Type-Options">
                {formatHeaderPresence(
                  latestSecurityCheck.xContentTypeOptionsHeader,
                )}
              </SecurityMetric>
              <SecurityMetric label="XML-RPC">
                {formatAccessibleFlag(latestSecurityCheck.xmlrpcAccessible)}
              </SecurityMetric>
              <SecurityMetric label="readme.html">
                {formatAccessibleFlag(latestSecurityCheck.readmeAccessible)}
              </SecurityMetric>
            </dl>
            <p className="text-sm leading-6 text-zinc-700">
              {formatNullable(
                latestSecurityCheck.summary,
                "Contrôle recommandé : ajoutez un premier résultat.",
              )}
            </p>
            {securityChecks.length > 1 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">HTTPS</th>
                      <th className="px-4 py-3">HTTP</th>
                      <th className="px-4 py-3">XML-RPC</th>
                      <th className="px-4 py-3">readme</th>
                      <th className="px-4 py-3">Résumé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {securityChecks.slice(0, 5).map((securityCheck) => (
                      <tr key={securityCheck.id}>
                        <td className="px-4 py-4 text-zinc-600">
                          {formatDateTime(securityCheck.checkedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <SecurityStatusBadge value={securityCheck.status} />
                        </td>
                        <td className="px-4 py-4 text-zinc-600">
                          {formatSecurityBoolean(securityCheck.httpsEnabled)}
                        </td>
                        <td className="px-4 py-4 text-zinc-600">
                          {formatNullable(
                            securityCheck.httpStatus?.toString(),
                            "Non joignable",
                          )}
                        </td>
                        <td className="px-4 py-4 text-zinc-600">
                          {formatAccessibleFlag(securityCheck.xmlrpcAccessible)}
                        </td>
                        <td className="px-4 py-4 text-zinc-600">
                          {formatAccessibleFlag(securityCheck.readmeAccessible)}
                        </td>
                        <td className="px-4 py-4 text-zinc-600">
                          {formatNullable(securityCheck.summary)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : (
          <InlineEmpty message="Aucun contrôle sécurité enregistré pour ce site. L'action ci-dessus lance un contrôle simple et non offensif." />
        )}
      </SectionPanel>

      <SectionPanel
        description="Suivi documentaire des sauvegardes déclarées pour ce site. WP Agency Ops ne lance aucune sauvegarde automatique."
        title="Sauvegardes"
      >
        <div className="mb-5">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
            href={`/sites/${site.id}/backups/new`}
          >
            Ajouter une sauvegarde manuelle
          </Link>
        </div>
        {backups.length === 0 ? (
          <InlineEmpty message="Aucune sauvegarde enregistrée pour ce site." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3">Intervention</th>
                  <th className="px-4 py-3 text-right">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {backups.slice(0, 5).map((backup) => (
                  <tr key={backup.id}>
                    <td className="px-4 py-4 text-zinc-600">
                      {formatDateTime(backup.performedAt)}
                    </td>
                    <td className="px-4 py-4 text-zinc-700">
                      {formatEnumLabel(backup.type)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={backup.status} />
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {formatNullable(backup.provider)}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {backup.intervention ? (
                        <Link
                          className="font-medium text-cyan-800 hover:text-cyan-950"
                          href={`/interventions/${backup.intervention.id}`}
                        >
                          {backup.intervention.title}
                        </Link>
                      ) : (
                        formatNullable(null)
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        className="font-medium text-cyan-800 hover:text-cyan-950"
                        href={`/backups/${backup.id}/edit`}
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      <SectionPanel
        description="Suivi documentaire des formulaires critiques. WP Agency Ops ne teste pas automatiquement les formulaires et ne stocke aucune soumission."
        title="Formulaires surveillés"
      >
        <div className="mb-5">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
            href={`/sites/${site.id}/forms/new`}
          >
            Ajouter un formulaire surveillé
          </Link>
        </div>
        {watchedForms.length === 0 ? (
          <InlineEmpty message="Aucun formulaire surveillé pour ce site." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Formulaire</th>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Dernière vérification</th>
                  <th className="px-4 py-3">Destinataires</th>
                  <th className="px-4 py-3 text-right">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {watchedForms.map((watchedForm) => (
                  <tr key={watchedForm.id}>
                    <td className="px-4 py-4 font-medium text-zinc-950">
                      {watchedForm.name}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      <a
                        className="font-medium text-cyan-800 hover:text-cyan-950"
                        href={watchedForm.pageUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Ouvrir
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={watchedForm.status} />
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {formatDateTime(watchedForm.lastCheckedAt)}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {formatNullable(watchedForm.expectedRecipients)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        className="font-medium text-cyan-800 hover:text-cyan-950"
                        href={`/forms/${watchedForm.id}/edit`}
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      <SectionPanel
        description="Synthèse des payloads importés depuis WPUR. WP Agency Ops ne génère pas ces données."
        title="Imports WPUR"
      >
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 text-sm leading-6">
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              WPUR reste la source de vérité pour les rapports détaillés plugins.
            </p>
            <p className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-cyan-950">
              WP Agency Ops importe uniquement une synthèse du payload WPUR.
            </p>
          </div>
          <Link
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
            href={`/sites/${site.id}/wpur-imports/new`}
          >
            Importer un payload WPUR
          </Link>
        </div>
        {wpurImports.length === 0 ? (
          <InlineEmpty message="Aucun import WPUR n'est encore enregistré pour ce site. Importez un payload produit par WPUR pour afficher une synthèse ici." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3 text-right">Dates</th>
                  <th className="px-4 py-3 text-right">Sections</th>
                  <th className="px-4 py-3 text-right">Lignes</th>
                  <th className="px-4 py-3 text-right">Alertes</th>
                  <th className="px-4 py-3">Importé le</th>
                  <th className="px-4 py-3 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {wpurImports.map((wpurImport) => {
                  const summary = readWpurSummary(
                    wpurImport.summaryJson,
                    wpurImport.periodMonth,
                  );

                  return (
                    <tr key={wpurImport.id}>
                      <td className="px-4 py-4 font-medium text-zinc-950">
                        {summary.periodMonth}
                      </td>
                      <td className="px-4 py-4 text-right text-zinc-700">
                        {summary.maintenanceDateCount}
                      </td>
                      <td className="px-4 py-4 text-right text-zinc-700">
                        {summary.sectionCount}
                      </td>
                      <td className="px-4 py-4 text-right text-zinc-700">
                        {summary.totalLineCount}
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
                          href={`/api/wpur-imports/${wpurImport.id}`}
                        >
                          Voir JSON
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

      <SectionPanel title="Export technique disponible">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-zinc-700">
            L&apos;export technique global expose le client, le site, les
            interventions, le dernier import WPUR dans un bloc séparé et les
            suivis globaux documentés.
          </p>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
            href={`/api/sites/${site.id}/technical-export`}
          >
            Voir l&apos;export JSON
          </Link>
        </div>
      </SectionPanel>
    </div>
  );
}

function InfoTile({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-5">
      <h2 className="text-xs font-semibold uppercase text-zinc-500">{label}</h2>
      <div className="mt-3 text-sm text-zinc-800">{children}</div>
    </section>
  );
}

function SecurityMetric({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div>
      <dt className="font-medium text-zinc-500">{label}</dt>
      <dd className="mt-1 text-zinc-900">{children}</dd>
    </div>
  );
}

function SecurityStatusBadge({ value }: { value: string }) {
  const labels: Record<string, string> = {
    failed: "Contrôle recommandé",
    issue: "Point à vérifier",
    ok: "Aucune anomalie bloquante",
    warning: "À surveiller",
  };

  const tones: Record<string, string> = {
    failed: "border-zinc-200 bg-zinc-100 text-zinc-700",
    issue: "border-amber-200 bg-amber-50 text-amber-800",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-cyan-200 bg-cyan-50 text-cyan-800",
  };

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2 text-xs font-medium ${
        tones[value] ?? "border-zinc-200 bg-zinc-50 text-zinc-700"
      }`}
    >
      {labels[value] ?? formatEnumLabel(value)}
    </span>
  );
}

function formatSecurityBoolean(value: boolean) {
  return value ? "Oui" : "Contrôle recommandé";
}

function formatHeaderPresence(value: boolean) {
  return value ? "Présent" : "Contrôle recommandé";
}

function formatAccessibleFlag(value: boolean) {
  return value ? "À surveiller" : "Non accessible";
}

function InlineEmpty({ message }: { message: string }) {
  return <p className="text-sm leading-6 text-zinc-600">{message}</p>;
}
