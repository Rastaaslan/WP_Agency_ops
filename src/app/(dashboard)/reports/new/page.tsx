import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateReport } from "@/features/reports/actions";
import { dateInputValue, endOfToday, startOfCurrentMonth } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const [{ siteId }, sites] = await Promise.all([
    searchParams,
    prisma.wordPressSite.findMany({
      where: { status: { not: "archived" } },
      orderBy: { name: "asc" },
      include: { client: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="Generer un rapport" description="Creez un rapport technique a partir des interventions, scans et controles." />
      <Card className="max-w-3xl">
        <form action={generateReport} className="grid gap-4">
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
            Titre optionnel
            <input name="title" placeholder="Rapport technique mensuel" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              Debut de periode
              <input name="periodStart" type="date" required defaultValue={dateInputValue(startOfCurrentMonth())} />
            </label>
            <label>
              Fin de periode
              <input name="periodEnd" type="date" required defaultValue={dateInputValue(endOfToday())} />
            </label>
          </div>
          <div>
            <Button type="submit">Generer le rapport</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
