import {
  backupStatusSchema,
  createBackupSchema,
  type CreateBackupInput,
  type UpdateBackupInput,
  updateBackupSchema,
} from "@/features/backups/schemas";
import { prisma } from "@/server/db/client";

export async function listBackupsBySite(siteId: string) {
  return prisma.backupRecord.findMany({
    where: { siteId },
    include: {
      intervention: true,
    },
    orderBy: {
      performedAt: "desc",
    },
  });
}

export async function getBackupById(id: string) {
  return prisma.backupRecord.findUnique({
    where: { id },
    include: {
      site: {
        include: {
          client: true,
        },
      },
      intervention: true,
    },
  });
}

export async function createBackup(input: CreateBackupInput) {
  const data = createBackupSchema.parse(input);

  return prisma.backupRecord.create({
    data,
  });
}

export async function updateBackup(id: string, input: UpdateBackupInput) {
  const data = updateBackupSchema.parse(input);

  return prisma.backupRecord.update({
    where: { id },
    data,
  });
}

export async function updateBackupStatus(id: string, status: unknown) {
  const parsedStatus = backupStatusSchema.parse(status);

  return prisma.backupRecord.update({
    where: { id },
    data: {
      status: parsedStatus,
    },
  });
}
