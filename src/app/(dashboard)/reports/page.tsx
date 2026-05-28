import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { site: true, client: true },
  });

  return (
    <>
      <PageHeader
        title="Rapports"
        description="Rapports techniques Markdown, modifiables avant export."
        actions={
          <Link href="/reports/new" className={buttonClassName()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Generer un rapport
          </Link>
        }
      />
      {reports.length === 0 ? (
        <EmptyState title="Aucun rapport" description="Generez un rapport depuis un site et une periode." />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Rapport</th>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link href={`/reports/${report.id}`} className="font-medium text-zinc-950 hover:text-blue-700">
                      {report.title}
                    </Link>
                    <p className="text-xs text-zinc-500">{report.client.companyName || report.client.name}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{report.site.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatDate(report.periodStart)} - {formatDate(report.periodEnd)}</td>
                  <td className="px-4 py-3"><Badge value={report.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
