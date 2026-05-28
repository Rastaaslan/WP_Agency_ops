import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { StatusBadge } from "@/components/status-badge";
import { listInterventionsBySite } from "@/features/interventions/services/intervention-service";
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
  const [site, interventions, wpurImports] = await Promise.all([
    getSiteById(id),
    listInterventionsBySite(id),
    listWpurImportsBySite(id),
  ]);

  if (!site) {
    notFound();
  }

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
            sections globales prévues.
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

function InlineEmpty({ message }: { message: string }) {
  return <p className="text-sm leading-6 text-zinc-600">{message}</p>;
}
