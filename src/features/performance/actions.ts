"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeUrl } from "@/lib/urls";
import { prisma } from "@/server/db/client";
import { formDataValue } from "@/server/validators/helpers";
import { HttpPerformanceProvider } from "./services/http-performance-provider";

export async function runPerformanceCheck(siteId: string, formData?: FormData) {
  const site = await prisma.wordPressSite.findUniqueOrThrow({
    where: { id: siteId },
    select: { url: true },
  });
  const requestedUrl = formData ? formDataValue(formData, "url") : "";
  const url = normalizeUrl(requestedUrl || site.url);
  const provider = new HttpPerformanceProvider();
  const result = await provider.runCheck(siteId, url);

  await prisma.performanceCheck.create({ data: result });

  revalidatePath("/");
  revalidatePath("/performance");
  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}`);
}
