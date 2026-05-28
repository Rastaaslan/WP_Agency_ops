"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/client";
import { formDataValue } from "@/server/validators/helpers";
import { siteFormSchema } from "./schemas";

function parseSiteForm(formData: FormData) {
  return siteFormSchema.parse({
    clientId: formDataValue(formData, "clientId"),
    name: formDataValue(formData, "name"),
    url: formDataValue(formData, "url"),
    adminUrl: formDataValue(formData, "adminUrl"),
    environment: formDataValue(formData, "environment") || "production",
    connectionType: formDataValue(formData, "connectionType") || "public_rest",
    secretReference: formDataValue(formData, "secretReference"),
    notes: formDataValue(formData, "notes"),
  });
}

export async function createSite(formData: FormData) {
  const data = parseSiteForm(formData);
  const { secretReference, ...siteData } = data;

  const site = await prisma.wordPressSite.create({
    data: {
      ...siteData,
      connectionStatus: "unknown",
      connection:
        siteData.connectionType === "none"
          ? undefined
          : {
              create: {
                type: siteData.connectionType,
                apiBaseUrl: siteData.url,
                secretReference,
                lastConnectionStatus: "unknown",
              },
            },
    },
  });

  revalidatePath("/");
  revalidatePath("/sites");
  redirect(`/sites/${site.id}`);
}

export async function updateSite(siteId: string, formData: FormData) {
  const data = parseSiteForm(formData);
  const { secretReference, ...siteData } = data;

  await prisma.wordPressSite.update({
    where: { id: siteId },
    data: {
      ...siteData,
      connection: {
        upsert: {
          create: {
            type: siteData.connectionType,
            apiBaseUrl: siteData.url,
            secretReference,
            lastConnectionStatus: "unknown",
          },
          update: {
            type: siteData.connectionType,
            apiBaseUrl: siteData.url,
            secretReference,
          },
        },
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/sites");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}`);
}

export async function archiveSite(siteId: string) {
  await prisma.wordPressSite.update({
    where: { id: siteId },
    data: { status: "archived" },
  });

  revalidatePath("/");
  revalidatePath("/sites");
  redirect("/sites");
}
