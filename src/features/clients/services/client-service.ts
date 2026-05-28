import {
  createClientSchema,
  type CreateClientInput,
  type UpdateClientInput,
  updateClientSchema,
} from "@/features/clients/schemas";
import { prisma } from "@/server/db/client";

export async function listClients() {
  return prisma.client.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
  });
}

export async function createClient(input: CreateClientInput) {
  const data = createClientSchema.parse(input);

  return prisma.client.create({
    data,
  });
}

export async function updateClient(id: string, input: UpdateClientInput) {
  const data = updateClientSchema.parse(input);

  return prisma.client.update({
    where: { id },
    data,
  });
}

export async function archiveClient(id: string) {
  return prisma.client.update({
    where: { id },
    data: {
      status: "archived",
    },
  });
}
