import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const wpurImport = await prisma.wpurImport.findUnique({
    where: { id },
    include: { site: true },
  });

  if (!wpurImport) {
    notFound();
  }

  const filename = `wpur-${wpurImport.site.name}-${wpurImport.periodMonth}`
    .replace(/[^a-z0-9-]+/gi, "-")
    .toLowerCase();

  return Response.json(wpurImport.payloadJson, {
    headers: {
      "content-disposition": `attachment; filename="${filename}.json"`,
    },
  });
}
