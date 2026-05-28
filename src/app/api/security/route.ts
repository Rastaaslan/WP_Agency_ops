import { z } from "zod";
import { BasicSecurityProvider } from "@/features/security/services/basic-security-provider";
import { prisma } from "@/server/db/client";

const schema = z.object({
  siteId: z.string().min(1),
});

export async function POST(request: Request) {
  const input = schema.parse(await request.json());
  const provider = new BasicSecurityProvider();
  const result = await provider.runCheck(input.siteId);
  const check = await prisma.securityCheck.create({ data: result });

  return Response.json({ data: check }, { status: 201 });
}
