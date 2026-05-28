import Link from "next/link";
import { Edit, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addInterventionItem,
  updateInterventionItem,
} from "@/features/maintenance/actions";
import { interventionItemStatusValues } from "@/features/maintenance/schemas";
import { formatDateTime } from "@/lib/dates";
import { labelFromEnum } from "@/lib/utils";
import { prisma } from "@/server/db/client";

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intervention = await prisma.maintenanceIntervention.findUnique({
    where: { id },
    include: {
      site: { include: { client: true } },
      items: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!intervention) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={intervention.title}
        description={`${intervention.site.name} - ${intervention.site.client.companyName || intervention.site.client.name}`}
        actions={
          <Link href={`/interventions/${intervention.id}/edit`} className={buttonClassName({ variant: "secondary" })}>
            <Edit className="h-4 w-4" aria-hidden="true" />
            Modifier
          </Link>
        }
      />
      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardTitle>Statut</CardTitle>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Type</span><Badge value={intervention.type} /></div>
            <div className="flex justify-between"><span className="text-zinc-500">Statut</span><Badge value={intervention.status} /></div>
            <div><span className="text-zinc-500">Cree</span><p>{formatDateTime(intervention.createdAt)}</p></div>
            <div><span className="text-zinc-500">Termine</span><p>{formatDateTime(intervention.finishedAt)}</p></div>
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <CardTitle>Notes</CardTitle>
          <div className="mt-4 grid gap-4 text-sm text-zinc-600">
            <p><strong className="text-zinc-950">Description :</strong> {intervention.description || "Non renseignee"}</p>
            <p><strong className="text-zinc-950">Notes techniques :</strong> {intervention.technicalNotes || "Non renseignees"}</p>
            <p><strong className="text-zinc-950">Resume client :</strong> {intervention.clientSummary || "Non renseigne"}</p>
          </div>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <Plus className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        </CardHeader>
        <div className="divide-y divide-zinc-100">
          {intervention.items.map((item) => (
            <form
              key={item.id}
              action={updateInterventionItem.bind(null, intervention.id, item.id)}
              className="grid gap-3 py-4 lg:grid-cols-[1fr_180px_auto]"
            >
              <div className="grid gap-2">
                <p className="font-medium text-zinc-950">{item.label}</p>
                <input type="hidden" name="label" value={item.label} />
                <textarea
                  name="details"
                  rows={3}
                  defaultValue={item.details ?? ""}
                  placeholder="Note technique ou decision"
                />
              </div>
              <select name="status" defaultValue={item.status}>
                {interventionItemStatusValues.map((value) => (
                  <option key={value} value={value}>{labelFromEnum(value)}</option>
                ))}
              </select>
              <Button type="submit" variant="secondary">Mettre a jour</Button>
            </form>
          ))}
        </div>
        <form action={addInterventionItem.bind(null, intervention.id)} className="mt-5 grid gap-3 border-t border-zinc-100 pt-5 md:grid-cols-[1fr_180px_auto]">
          <input name="label" required placeholder="Nouvel item" />
          <select name="status" defaultValue="planned">
            {interventionItemStatusValues.map((value) => (
              <option key={value} value={value}>{labelFromEnum(value)}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary">Ajouter</Button>
        </form>
      </Card>
    </>
  );
}
