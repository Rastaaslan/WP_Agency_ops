import { clientFormSchema } from "@/features/clients/schemas";
import { prisma } from "@/server/db/client";

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
  });

  return Response.json({ data: clients });
}

export async function POST(request: Request) {
  const data = clientFormSchema.parse(await request.json());
  const client = await prisma.client.create({ data });

  return Response.json({ data: client }, { status: 201 });
}
