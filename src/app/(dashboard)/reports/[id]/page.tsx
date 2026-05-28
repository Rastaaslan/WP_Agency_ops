import Link from "next/link";
import { Download, FileCode } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { updateReport } from "@/features/reports/actions";
import { formatDate } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: { site: true, client: true },
  });

  if (!report) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={report.title}
        description={`${report.site.name} - ${formatDate(report.periodStart)} au ${formatDate(report.periodEnd)}`}
        actions={
          <>
            <Link href={`/api/reports/${report.id}/html`} className={buttonClassName({ variant: "secondary" })}>
              <FileCode className="h-4 w-4" aria-hidden="true" />
              Export HTML
            </Link>
            <Link href={`/api/reports/${report.id}/markdown`} className={buttonClassName({ variant: "secondary" })}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export Markdown
            </Link>
          </>
        }
      />
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edition Markdown</CardTitle>
            <Badge value={report.status} />
          </CardHeader>
          <form action={updateReport.bind(null, report.id)} className="grid gap-4">
            <label>
              Titre
              <input name="title" required defaultValue={report.title} />
            </label>
            <label>
              Statut
              <select name="status" defaultValue={report.status}>
                <option value="draft">Draft</option>
                <option value="generated">Generated</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              Markdown
              <textarea name="markdownContent" rows={24} required defaultValue={report.markdownContent} />
            </label>
            <Button type="submit">Enregistrer le rapport</Button>
          </form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Preview client</CardTitle>
            <Link href={`/sites/${report.siteId}`} className="text-sm font-medium text-blue-700 hover:text-blue-900">Voir le site</Link>
          </CardHeader>
          <article
            className="prose-report"
            dangerouslySetInnerHTML={{ __html: report.htmlContent ?? "" }}
          />
        </Card>
      </section>
    </>
  );
}
