import { interventionFormSchema } from "@/features/maintenance/schemas";
import { prisma } from "@/server/db/client";

export async function GET() {
  const interventions = await prisma.maintenanceIntervention.findMany({
    orderBy: { createdAt: "desc" },
    include: { site: true, items: true },
  });

  return Response.json({ data: interventions });
}

export async function POST(request: Request) {
  const data = interventionFormSchema.parse(await request.json());
  const intervention = await prisma.maintenanceIntervention.create({
    data: {
      siteId: data.siteId,
      title: data.title,
      type: data.type,
      status: data.status,
      description: data.description,
      technicalNotes: data.technicalNotes,
      clientSummary: data.clientSummary,
    },
  });

  return Response.json({ data: intervention }, { status: 201 });
}
