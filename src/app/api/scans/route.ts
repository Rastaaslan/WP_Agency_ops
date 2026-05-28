import { z } from "zod";
import { runWordPressScan } from "@/features/wordpress/services/scanner";
import { prisma } from "@/server/db/client";

const postSchema = z.object({
  siteId: z.string().min(1),
  manual: z
    .object({
      wpVersion: z.string().optional(),
      phpVersion: z.string().optional(),
      pluginsText: z.string().optional(),
      themesText: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

export async function GET() {
  const scans = await prisma.siteScan.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { site: true, plugins: true, themes: true },
  });

  return Response.json({ data: scans });
}

export async function POST(request: Request) {
  const input = postSchema.parse(await request.json());
  const scan = await runWordPressScan(input.siteId, input.manual);

  return Response.json({ data: scan }, { status: 201 });
}
