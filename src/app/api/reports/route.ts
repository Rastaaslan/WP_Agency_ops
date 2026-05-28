import { generateReportSchema } from "@/features/reports/schemas";
import { MarkdownReportGenerator } from "@/features/reports/services/markdown-report-generator";
import { prisma } from "@/server/db/client";

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { site: true, client: true },
  });

  return Response.json({ data: reports });
}

export async function POST(request: Request) {
  const input = generateReportSchema.parse(await request.json());
  const site = await prisma.wordPressSite.findUniqueOrThrow({
    where: { id: input.siteId },
    select: { clientId: true },
  });
  const generator = new MarkdownReportGenerator();
  const generated = await generator.generateSiteReport(input);
  const report = await prisma.report.create({
    data: {
      siteId: input.siteId,
      clientId: site.clientId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      title: generated.title,
      status: "generated",
      markdownContent: generated.markdownContent,
      htmlContent: generated.htmlContent,
    },
  });

  return Response.json({ data: report }, { status: 201 });
}
