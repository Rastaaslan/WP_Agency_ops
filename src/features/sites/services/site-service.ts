import {
  createSiteSchema,
  type CreateSiteInput,
  type UpdateSiteInput,
  updateSiteSchema,
} from "@/features/sites/schemas";
import { prisma } from "@/server/db/client";

export async function listSites() {
  return prisma.site.findMany({
    include: {
      client: true,
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

export async function listSitesByClient(clientId: string) {
  return prisma.site.findMany({
    where: { clientId },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

export async function getSiteById(id: string) {
  return prisma.site.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });
}

export async function createSite(input: CreateSiteInput) {
  const data = createSiteSchema.parse(input);

  return prisma.site.create({
    data,
  });
}

export async function updateSite(id: string, input: UpdateSiteInput) {
  const data = updateSiteSchema.parse(input);

  return prisma.site.update({
    where: { id },
    data,
  });
}

export async function archiveSite(id: string) {
  return prisma.site.update({
    where: { id },
    data: {
      status: "archived",
    },
  });
}
