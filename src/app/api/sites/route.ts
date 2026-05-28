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
  const { secretReference, ...siteData } = data;
  const site = await prisma.wordPressSite.create({
    data: {
      ...siteData,
      connection:
        siteData.connectionType === "none"
          ? undefined
          : {
              create: {
                type: siteData.connectionType,
                apiBaseUrl: siteData.url,
                secretReference,
              },
            },
    },
  });

  return Response.json({ data: site }, { status: 201 });
}
