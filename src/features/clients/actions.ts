"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/client";
import { formDataValue } from "@/server/validators/helpers";
import { clientFormSchema } from "./schemas";

function parseClientForm(formData: FormData) {
  return clientFormSchema.parse({
    name: formDataValue(formData, "name"),
    companyName: formDataValue(formData, "companyName"),
    email: formDataValue(formData, "email"),
    phone: formDataValue(formData, "phone"),
    notes: formDataValue(formData, "notes"),
  });
}

export async function createClient(formData: FormData) {
  const data = parseClientForm(formData);
  const client = await prisma.client.create({ data });

  revalidatePath("/");
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(clientId: string, formData: FormData) {
  const data = parseClientForm(formData);

  await prisma.client.update({
    where: { id: clientId },
    data,
  });

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function archiveClient(clientId: string) {
  await prisma.client.update({
    where: { id: clientId },
    data: { status: "archived" },
  });

  revalidatePath("/");
  revalidatePath("/clients");
  redirect("/clients");
}
