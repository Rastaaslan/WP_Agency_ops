import {
  createWatchedFormSchema,
  type CreateWatchedFormInput,
  type UpdateWatchedFormInput,
  updateWatchedFormSchema,
  watchedFormStatusSchema,
} from "@/features/forms/schemas";
import { prisma } from "@/server/db/client";

export async function listFormsBySite(siteId: string) {
  return prisma.watchedForm.findMany({
    where: { siteId },
    orderBy: [
      {
        status: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function getFormById(id: string) {
  return prisma.watchedForm.findUnique({
    where: { id },
    include: {
      site: {
        include: {
          client: true,
        },
      },
    },
  });
}

export async function createForm(input: CreateWatchedFormInput) {
  const data = createWatchedFormSchema.parse(input);

  return prisma.watchedForm.create({
    data,
  });
}

export async function updateForm(id: string, input: UpdateWatchedFormInput) {
  const data = updateWatchedFormSchema.parse(input);

  return prisma.watchedForm.update({
    where: { id },
    data,
  });
}

export async function updateFormStatus(id: string, status: unknown) {
  const parsedStatus = watchedFormStatusSchema.parse(status);

  return prisma.watchedForm.update({
    where: { id },
    data: {
      status: parsedStatus,
    },
  });
}
