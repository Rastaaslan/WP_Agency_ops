import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { StatusBadge } from "@/components/status-badge";
import { UserNotice } from "@/components/user-notice";
import { InterventionItemForm } from "@/features/interventions/components/intervention-item-form";
import { InterventionStatusForm } from "@/features/interventions/components/intervention-status-form";
import {
  addInterventionItemAction,
  updateInterventionItemAction,
  updateInterventionStatusAction,
} from "@/features/interventions/intervention-actions";
import { interventionItemValuesFromRecord } from "@/features/interventions/intervention-form-state";
import { getInterventionById } from "@/features/interventions/services/intervention-service";
import { formatDateTime, formatEnumLabel, formatNullable } from "@/lib/format";
import { getUserNotice } from "@/lib/user-notice";

export default async function InterventionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  await connection();

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const intervention = await getInterventionById(id);

  if (!intervention) {
    notFound();
  }

  const notice = getUserNotice(query.notice);

  return (
    <div className="space-y-6">
      <PageHeader
        description={`Fiche de suivi technique pour comprendre le site concerné, l'avancement et les points à traiter. Date prévue ou réalisée : ${formatDateTime(intervention.date)}.`}
        eyebrow="Suivi technique"
        title={intervention.title}
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/interventions"
        >
          Retour suivis techniques
        </Link>
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/interventions/${intervention.id}/edit`}
        >
          Modifier
        </Link>
      </PageHeader>
      <UserNotice notice={notice} />

      <section className="grid gap-4 md:grid-cols-4">
        <InfoTile label="Site">
          {intervention.site ? (
            <Link
              className="font-medium text-cyan-800 hover:text-cyan-950"
              href={`/sites/${intervention.site.id}`}
            >
              {intervention.site.name}
            </Link>
          ) : (
            formatNullable(null)
          )}
        </InfoTile>
        <InfoTile label="Avancement">
          <StatusBadge value={intervention.status} />
        </InfoTile>
        <InfoTile label="Catégorie">
          {formatEnumLabel(intervention.type)}
        </InfoTile>
        <InfoTile label="Client">
          {intervention.site?.client ? (
            <Link
              className="font-medium text-cyan-800 hover:text-cyan-950"
              href={`/clients/${intervention.site.client.id}`}
            >
              {intervention.site.client.name}
            </Link>
          ) : (
            formatNullable(null)
          )}
        </InfoTile>
      </section>

      <section className="rounded-md border border-cyan-200 bg-cyan-50 p-5 text-sm leading-6 text-cyan-950">
        <h2 className="text-sm font-semibold text-cyan-950">
          Pourquoi cette fiche existe ?
        </h2>
        <p className="mt-2 max-w-3xl">
          Cette fiche sert à suivre une action technique ou une vérification
          globale sur un site. Elle regroupe les actions à faire, les points à
          surveiller et les notes utiles.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <SectionPanel title="Contexte du suivi">
            <dl className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="font-medium text-zinc-500">Notes internes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-zinc-900">
                  {formatNullable(
                    intervention.internalNotes,
                    "Aucune note interne renseignée.",
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-500">Résumé client</dt>
                <dd className="mt-1 whitespace-pre-wrap text-zinc-900">
                  {formatNullable(
                    intervention.clientSummary,
                    "Aucun résumé client renseigné.",
                  )}
                </dd>
              </div>
            </dl>
          </SectionPanel>

          <SectionPanel
            description="Liste de points à traiter, vérifier ou documenter pour ce suivi technique. Le détail maintenance plugins appartient à WPUR."
            title="À faire / à vérifier"
          >
            {intervention.type === "wpur_plugin_maintenance" ? (
              <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
                <p>
                  Pour un suivi WPUR, gardez des actions de suivi global :
                  consulter le rapport WPUR, vérifier les alertes, documenter la
                  maintenance dans WPUR.
                </p>
                {intervention.site ? (
                  <Link
                    className="mt-2 inline-flex font-medium text-amber-950 underline-offset-4 hover:underline"
                    href={`/sites/${intervention.site.id}`}
                  >
                    Ouvrir la fiche site pour consulter ou importer la synthèse WPUR.
                  </Link>
                ) : null}
              </div>
            ) : null}

            {intervention.items.length === 0 ? (
              <p className="text-sm leading-6 text-zinc-600">
                Aucune action n&apos;est encore liée à ce suivi technique.
              </p>
            ) : (
              <ul className="space-y-3">
                {intervention.items.map((item) => (
                  <li
                    className="rounded-md border border-zinc-200 bg-white p-4"
                    key={item.id}
                  >
                    <div className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-1 h-4 w-4 shrink-0 rounded border ${
                          item.status === "done"
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-zinc-300 bg-zinc-50"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="font-medium text-zinc-950">
                            {item.label}
                          </h3>
                          <StatusBadge value={item.status} />
                        </div>
                        {item.notes ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                            {item.notes}
                          </p>
                        ) : null}
                        <details className="mt-4 rounded-md border border-zinc-200 bg-zinc-50">
                          <summary className="flex min-h-10 cursor-pointer list-none items-center px-3 text-sm font-medium text-cyan-800 hover:text-cyan-950">
                            Modifier
                          </summary>
                          <div className="border-t border-zinc-200 p-4">
                            <InterventionItemForm
                              action={updateInterventionItemAction.bind(
                                null,
                                item.id,
                                intervention.id,
                              )}
                              formId={`intervention-item-${item.id}`}
                              initialValues={interventionItemValuesFromRecord(
                                item,
                              )}
                              submitLabel="Enregistrer l'action"
                            />
                          </div>
                        </details>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionPanel>
        </div>

        <aside className="space-y-6">
          <SectionPanel
            description="Mettez à jour l'avancement sans modifier les notes ni les actions."
            title="Mettre à jour l'avancement"
          >
            <InterventionStatusForm
              action={updateInterventionStatusAction.bind(null, intervention.id)}
              currentStatus={intervention.status}
            />
          </SectionPanel>
        </aside>
      </section>

      <SectionPanel
        description="Ajoutez une action seulement si un nouveau point doit être suivi."
        title="Ajouter une action"
      >
        <details className="rounded-md border border-zinc-200 bg-zinc-50">
          <summary className="flex min-h-10 cursor-pointer list-none items-center px-3 text-sm font-medium text-cyan-800 hover:text-cyan-950">
            Ouvrir le formulaire d&apos;ajout
          </summary>
          <div className="border-t border-zinc-200 bg-white p-4">
            <InterventionItemForm
              action={addInterventionItemAction.bind(null, intervention.id)}
              formId="intervention-item-new"
              submitLabel="Ajouter l'action"
            />
          </div>
        </details>
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
