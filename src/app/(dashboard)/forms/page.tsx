import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createFormEndpoint,
  updateFormEndpointStatus,
} from "@/features/forms/actions";
import { formEndpointStatusValues } from "@/features/forms/schemas";
import { labelFromEnum } from "@/lib/utils";
import { prisma } from "@/server/db/client";

export default async function FormsPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const [{ siteId }, sites, forms] = await Promise.all([
    searchParams,
    prisma.wordPressSite.findMany({
      where: { status: { not: "archived" } },
      orderBy: { name: "asc" },
      include: { client: true },
    }),
    prisma.formEndpoint.findMany({
      orderBy: { updatedAt: "desc" },
      include: { site: { include: { client: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Forms Watch"
        description="Suivi manuel des formulaires critiques et preparation du futur backend formulaire statique."
      />
      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardTitle>Ajouter un formulaire</CardTitle>
          <form action={createFormEndpoint} className="mt-4 grid gap-4">
            <label>
              Site
              <select name="siteId" required defaultValue={siteId ?? ""}>
                <option value="" disabled>Selectionner un site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} - {site.client.companyName || site.client.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nom
              <input name="name" required placeholder="Contact principal" />
            </label>
            <label>
              URL de page
              <input name="pageUrl" placeholder="https://example.com/contact" />
            </label>
            <label>
              Slug endpoint
              <input name="endpointSlug" placeholder="contact" />
            </label>
            <label>
              Champs attendus
              <textarea name="expectedFieldsText" rows={3} placeholder="nom&#10;email&#10;message" />
            </label>
            <label>
              Destinataires attendus
              <textarea name="recipientsText" rows={3} placeholder="contact@example.com" />
            </label>
            <label>
              Statut manuel
              <select name="status" defaultValue="untested">
                {formEndpointStatusValues.map((value) => (
                  <option key={value} value={value}>{labelFromEnum(value)}</option>
                ))}
              </select>
            </label>
            <label className="flex grid-cols-none flex-row items-center gap-2 text-sm font-normal">
              <input className="h-4 w-4" type="checkbox" name="spamProtectionEnabled" />
              Protection anti-spam active
            </label>
            <label>
              Notes
              <textarea name="notes" rows={3} />
            </label>
            <Button type="submit">Ajouter</Button>
          </form>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Formulaires suivis</CardTitle>
            <Badge value={String(forms.length)} label={`${forms.length} total`} />
          </CardHeader>
          <div className="divide-y divide-zinc-100">
            {forms.map((form) => (
              <div key={form.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-medium text-zinc-950">{form.name}</p>
                  <p className="text-sm text-zinc-500">{form.site.name} - {form.pageUrl || "URL non renseignee"}</p>
                  <p className="mt-1 text-sm text-zinc-500">{form.notes}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge value={form.status} />
                  <form className="flex gap-1">
                    <button formAction={updateFormEndpointStatus.bind(null, form.id, "ok")} className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium">OK</button>
                    <button formAction={updateFormEndpointStatus.bind(null, form.id, "issue")} className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium">Probleme</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
