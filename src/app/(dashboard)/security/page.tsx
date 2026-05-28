import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import { prisma } from "@/server/db/client";

export default async function SecurityPage() {
  const checks = await prisma.securityCheck.findMany({
    orderBy: { createdAt: "desc" },
    include: { site: { include: { client: true } } },
  });

  return (
    <>
      <PageHeader
        title="Security Checks"
        description="Controles non intrusifs : HTTPS, headers courants, readme.html et xmlrpc.php."
      />
      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">HTTPS</th>
              <th className="px-4 py-3">Headers</th>
              <th className="px-4 py-3">XML-RPC</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {checks.map((check) => (
              <tr key={check.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3"><Link className="font-medium text-zinc-950 hover:text-blue-700" href={`/sites/${check.siteId}`}>{check.site.name}</Link></td>
                <td className="px-4 py-3 text-zinc-600">{check.httpsEnabled ? "Oui" : "Non"}</td>
                <td className="px-4 py-3 text-zinc-600">{check.hasSecurityHeaders ? "Detectes" : "A completer"}</td>
                <td className="px-4 py-3 text-zinc-600">{check.xmlrpcExposed ? "Expose" : "Non detecte"}</td>
                <td className="px-4 py-3"><Badge value={check.status} /></td>
                <td className="px-4 py-3 text-zinc-500">{formatDateTime(check.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
