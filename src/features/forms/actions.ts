"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseLines } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";
import { checkboxValue, formDataValue } from "@/server/validators/helpers";
import { formEndpointSchema } from "./schemas";

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

function parseFormEndpoint(formData: FormData) {
  return formEndpointSchema.parse({
    siteId: formDataValue(formData, "siteId"),
    name: formDataValue(formData, "name"),
    pageUrl: formDataValue(formData, "pageUrl"),
    endpointSlug: formDataValue(formData, "endpointSlug"),
    expectedFieldsText: formDataValue(formData, "expectedFieldsText"),
    recipientsText: formDataValue(formData, "recipientsText"),
    status: formDataValue(formData, "status") || "untested",
    spamProtectionEnabled: checkboxValue(formData, "spamProtectionEnabled"),
    notes: formDataValue(formData, "notes"),
  });
}

export async function createFormEndpoint(formData: FormData) {
  const data = parseFormEndpoint(formData);

  await prisma.formEndpoint.create({
    data: {
      siteId: data.siteId,
      name: data.name,
      pageUrl: data.pageUrl,
      endpointSlug: data.endpointSlug,
      expectedFieldsJson: toJson(parseLines(data.expectedFieldsText)),
      recipientsJson: toJson(parseLines(data.recipientsText)),
      status: data.status,
      spamProtectionEnabled: data.spamProtectionEnabled,
      notes: data.notes,
    },
  });

  revalidatePath("/forms");
  revalidatePath(`/sites/${data.siteId}`);
  redirect(`/sites/${data.siteId}`);
}

export async function updateFormEndpointStatus(
  formEndpointId: string,
  status: "untested" | "ok" | "issue" | "archived",
) {
  const formEndpoint = await prisma.formEndpoint.update({
    where: { id: formEndpointId },
    data: { status },
    select: { siteId: true },
  });

  revalidatePath("/forms");
  revalidatePath(`/sites/${formEndpoint.siteId}`);
  redirect(`/sites/${formEndpoint.siteId}`);
}
