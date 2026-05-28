import { siteFormSchema } from "@/features/sites/schemas";
import { prisma } from "@/server/db/client";

export async function GET() {
  const sites = await prisma.wordPressSite.findMany({
    orderBy: { name: "asc" },
    include: { client: true },
  });

  return Response.json({ data: sites });
}

export async function POST(request: Request) {
  const data = siteFormSchema.parse(await request.json());
  const site = await prisma.wordPressSite.create({
    data: {
      ...data,
      connection:
        data.connectionType === "none"
          ? undefined
          : {
              create: {
                type: data.connectionType,
                apiBaseUrl: data.url,
              },
            },
    },
  });

  return Response.json({ data: site }, { status: 201 });
}
