import { z } from "zod";
import { normalizeUrl } from "@/lib/urls";
import { HttpPerformanceProvider } from "@/features/performance/services/http-performance-provider";
import { prisma } from "@/server/db/client";

const schema = z.object({
  siteId: z.string().min(1),
  url: z.string().optional(),
});

export async function POST(request: Request) {
  const input = schema.parse(await request.json());
  const site = await prisma.wordPressSite.findUniqueOrThrow({
    where: { id: input.siteId },
    select: { url: true },
  });
  const provider = new HttpPerformanceProvider();
  const result = await provider.runCheck(input.siteId, normalizeUrl(input.url || site.url));
  const check = await prisma.performanceCheck.create({ data: result });

  return Response.json({ data: check }, { status: 201 });
}
