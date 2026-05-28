"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseLines } from "@/lib/utils";
import { prisma } from "@/server/db/client";
import { formDataValue } from "@/server/validators/helpers";
import {
  interventionFormSchema,
  interventionItemFormSchema,
} from "./schemas";
import { generateInterventionItemsFromScan } from "./services/intervention-from-scan";

function parseInterventionForm(formData: FormData) {
  return interventionFormSchema.parse({
    siteId: formDataValue(formData, "siteId"),
    title: formDataValue(formData, "title"),
    type: formDataValue(formData, "type") || "other",
    status: formDataValue(formData, "status") || "planned",
    description: formDataValue(formData, "description"),
    technicalNotes: formDataValue(formData, "technicalNotes"),
    clientSummary: formDataValue(formData, "clientSummary"),
    itemsText: formDataValue(formData, "itemsText"),
  });
}

function statusDates(status: string) {
  const now = new Date();
  return {
    startedAt: status === "in_progress" || status === "done" ? now : undefined,
    finishedAt: status === "done" ? now : undefined,
  };
}

export async function createIntervention(formData: FormData) {
  const data = parseInterventionForm(formData);
  const items = parseLines(data.itemsText).map((label) => ({
    label,
    status: "planned" as const,
  }));

  const intervention = await prisma.maintenanceIntervention.create({
    data: {
      siteId: data.siteId,
      title: data.title,
      type: data.type,
      status: data.status,
      description: data.description,
      technicalNotes: data.technicalNotes,
      clientSummary: data.clientSummary,
      ...statusDates(data.status),
      items: items.length > 0 ? { create: items } : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/interventions");
  revalidatePath(`/sites/${data.siteId}`);
  redirect(`/interventions/${intervention.id}`);
}

export async function updateIntervention(
  interventionId: string,
  formData: FormData,
) {
  const data = parseInterventionForm(formData);

  await prisma.maintenanceIntervention.update({
    where: { id: interventionId },
    data: {
      siteId: data.siteId,
      title: data.title,
      type: data.type,
      status: data.status,
      description: data.description,
      technicalNotes: data.technicalNotes,
      clientSummary: data.clientSummary,
      ...statusDates(data.status),
    },
  });

  revalidatePath("/");
  revalidatePath("/interventions");
  revalidatePath(`/interventions/${interventionId}`);
  revalidatePath(`/sites/${data.siteId}`);
  redirect(`/interventions/${interventionId}`);
}

export async function addInterventionItem(
  interventionId: string,
  formData: FormData,
) {
  const data = interventionItemFormSchema.parse({
    label: formDataValue(formData, "label"),
    status: formDataValue(formData, "status") || "done",
    details: formDataValue(formData, "details"),
  });
  const intervention = await prisma.maintenanceIntervention.findUniqueOrThrow({
    where: { id: interventionId },
    select: { siteId: true },
  });

  await prisma.interventionItem.create({
    data: { interventionId, ...data },
  });

  revalidatePath("/");
  revalidatePath(`/interventions/${interventionId}`);
  revalidatePath(`/sites/${intervention.siteId}`);
  redirect(`/interventions/${interventionId}`);
}

export async function updateInterventionItem(
  interventionId: string,
  itemId: string,
  formData: FormData,
) {
  const data = interventionItemFormSchema.parse({
    label: formDataValue(formData, "label"),
    status: formDataValue(formData, "status") || "planned",
    details: formDataValue(formData, "details"),
  });
  const intervention = await prisma.maintenanceIntervention.findUniqueOrThrow({
    where: { id: interventionId },
    select: { siteId: true },
  });

  await prisma.interventionItem.update({
    where: { id: itemId },
    data,
  });

  revalidatePath("/");
  revalidatePath(`/interventions/${interventionId}`);
  revalidatePath(`/sites/${intervention.siteId}`);
  redirect(`/interventions/${interventionId}`);
}

export async function createInterventionFromScan(scanId: string) {
  const scan = await prisma.siteScan.findUniqueOrThrow({
    where: { id: scanId },
    include: {
      site: true,
      plugins: true,
      themes: true,
    },
  });
  const items = generateInterventionItemsFromScan(scan);
  const intervention = await prisma.maintenanceIntervention.create({
    data: {
      siteId: scan.siteId,
      title: "Maintenance technique - mises a jour et verifications",
      type: "update",
      status: "planned",
      description:
        "Intervention generee a partir du dernier scan technique du site.",
      technicalNotes: [
        `Scan source : ${scan.id}`,
        scan.errorMessage ? `Erreur scan : ${scan.errorMessage}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      clientSummary:
        "Une maintenance technique est planifiee a partir des controles recents du site.",
      items: items.length > 0 ? { create: items } : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/interventions");
  revalidatePath(`/sites/${scan.siteId}`);
  redirect(`/interventions/${intervention.id}`);
}
