import { parseLines } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client";
import { formEndpointSchema } from "@/features/forms/schemas";
import { prisma } from "@/server/db/client";

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

export async function GET() {
  const forms = await prisma.formEndpoint.findMany({
    orderBy: { updatedAt: "desc" },
    include: { site: true },
  });

  return Response.json({ data: forms });
}

export async function POST(request: Request) {
  const input = formEndpointSchema.parse(await request.json());
  const form = await prisma.formEndpoint.create({
    data: {
      siteId: input.siteId,
      name: input.name,
      pageUrl: input.pageUrl,
      endpointSlug: input.endpointSlug,
      expectedFieldsJson: json(parseLines(input.expectedFieldsText)),
      recipientsJson: json(parseLines(input.recipientsText)),
      status: input.status,
      spamProtectionEnabled: input.spamProtectionEnabled,
      notes: input.notes,
    },
  });

  return Response.json({ data: form }, { status: 201 });
}
