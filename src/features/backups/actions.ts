"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/client";
import { formDataValue } from "@/server/validators/helpers";
import { backupRecordFormSchema } from "./schemas";

function checkedAtFromDateInput(value?: string) {
  if (!value) {
    return new Date();
  }

  return new Date(`${value}T12:00:00.000Z`);
}

export async function saveBackupRecord(siteId: string, formData: FormData) {
  const data = backupRecordFormSchema.parse({
    checkedAt: formDataValue(formData, "checkedAt"),
    status: formDataValue(formData, "status") || "unknown",
    filesBackedUp: formData.has("filesBackedUp"),
    databaseBackedUp: formData.has("databaseBackedUp"),
    interventionId: formDataValue(formData, "interventionId"),
    notes: formDataValue(formData, "notes"),
  });

  await prisma.backupRecord.create({
    data: {
      siteId,
      checkedAt: checkedAtFromDateInput(data.checkedAt),
      status: data.status,
      filesBackedUp: data.filesBackedUp,
      databaseBackedUp: data.databaseBackedUp,
      interventionId: data.interventionId,
      notes: data.notes,
    },
  });

  revalidatePath("/");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}#backups`);
}

