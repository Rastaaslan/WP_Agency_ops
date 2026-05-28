import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { StatusBadge } from "@/components/status-badge";
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

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const intervention = await getInterventionById(id);

  if (!intervention) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={formatDateTime(intervention.date)}
        eyebrow="Intervention"
        title={intervention.title}
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/interventions"
        >
          Retour interventions
        </Link>
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/interventions/${intervention.id}/edit`}
        >
          Modifier
        </Link>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-4">
        <InfoTile label="Statut">
          <StatusBadge value={intervention.status} />
        </InfoTile>
        <InfoTile label="Type">
          {formatEnumLabel(intervention.type)}
        </InfoTile>
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

      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <SectionPanel title="Résumé intervention">
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
            description="Les items restent globaux. Le détail maintenance plugins appartient à WPUR."
            title="Items d'intervention"
          >
            {intervention.type === "wpur_plugin_maintenance" ? (
              <p className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
                Pour une intervention WPUR, gardez des items de suivi global :
                consulter le rapport WPUR, vérifier les alertes, documenter la
                maintenance dans WPUR.
              </p>
            ) : null}

            {intervention.items.length === 0 ? (
              <p className="text-sm leading-6 text-zinc-600">
                Aucun item n&apos;est encore lié à cette intervention.
              </p>
            ) : (
              <div className="space-y-4">
                {intervention.items.map((item) => (
                  <article
                    className="rounded-md border border-zinc-200 bg-zinc-50 p-4"
                    key={item.id}
                  >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-medium text-zinc-950">
                          {item.label}
                        </h3>
                        {item.notes ? (
                          <p className="mt-1 text-sm leading-6 text-zinc-600">
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                      <StatusBadge value={item.status} />
                    </div>
                    <InterventionItemForm
                      action={updateInterventionItemAction.bind(
                        null,
                        item.id,
                        intervention.id,
                      )}
                      formId={`intervention-item-${item.id}`}
                      initialValues={interventionItemValuesFromRecord(item)}
                      submitLabel="Enregistrer l'item"
                    />
                  </article>
                ))}
              </div>
            )}
          </SectionPanel>
        </div>

        <aside className="space-y-6">
          <SectionPanel
            description="Utilisez le statut annulé pour annuler une intervention."
            title="Changer le statut"
          >
            <InterventionStatusForm
              action={updateInterventionStatusAction.bind(null, intervention.id)}
              currentStatus={intervention.status}
            />
          </SectionPanel>

          <SectionPanel title="Ajouter un item">
            <InterventionItemForm
              action={addInterventionItemAction.bind(null, intervention.id)}
              formId="intervention-item-new"
              submitLabel="Ajouter l'item"
            />
          </SectionPanel>
        </aside>
      </section>
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
