import {
  addInterventionItemSchema,
  type AddInterventionItemInput,
  createInterventionSchema,
  type CreateInterventionInput,
  interventionStatusSchema,
  type UpdateInterventionInput,
  type UpdateInterventionItemInput,
  updateInterventionItemSchema,
  updateInterventionSchema,
} from "@/features/interventions/schemas";
import { prisma } from "@/server/db/client";

export async function listInterventions() {
  return prisma.intervention.findMany({
    include: {
      site: {
        include: {
          client: true,
        },
      },
      items: true,
    },
    orderBy: {
      date: "desc",
    },
  });
}

export async function listInterventionsBySite(siteId: string) {
  return prisma.intervention.findMany({
    where: { siteId },
    include: {
      items: true,
    },
    orderBy: {
      date: "desc",
    },
  });
}

export async function getInterventionById(id: string) {
  return prisma.intervention.findUnique({
    where: { id },
    include: {
      site: {
        include: {
          client: true,
        },
      },
      items: true,
    },
  });
}

export async function createIntervention(input: CreateInterventionInput) {
  const data = createInterventionSchema.parse(input);

  return prisma.intervention.create({
    data,
  });
}

export async function updateIntervention(
  id: string,
  input: UpdateInterventionInput,
) {
  const data = updateInterventionSchema.parse(input);

  return prisma.intervention.update({
    where: { id },
    data,
  });
}

export async function updateInterventionStatus(
  id: string,
  status: unknown,
) {
  const parsedStatus = interventionStatusSchema.parse(status);

  return prisma.intervention.update({
    where: { id },
    data: {
      status: parsedStatus,
    },
  });
}

export async function addInterventionItem(
  interventionId: string,
  input: AddInterventionItemInput,
) {
  const data = addInterventionItemSchema.parse(input);

  return prisma.interventionItem.create({
    data: {
      ...data,
      interventionId,
    },
  });
}

export async function updateInterventionItem(
  id: string,
  input: UpdateInterventionItemInput,
) {
  const data = updateInterventionItemSchema.parse(input);

  return prisma.interventionItem.update({
    where: { id },
    data,
  });
}
