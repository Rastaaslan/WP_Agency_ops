import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const report = await prisma.report.findUnique({ where: { id } });

  if (!report) {
    notFound();
  }

  return new Response(report.markdownContent, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${report.title.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.md"`,
    },
  });
}
