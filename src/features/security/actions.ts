"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/client";
import { BasicSecurityProvider } from "./services/basic-security-provider";

export async function runSecurityCheck(siteId: string) {
  const provider = new BasicSecurityProvider();
  const result = await provider.runCheck(siteId);

  await prisma.securityCheck.create({ data: result });

  revalidatePath("/");
  revalidatePath("/security");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}`);
}
