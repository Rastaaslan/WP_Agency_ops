"use server";

import { marked } from "marked";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/client";
import { formDataValue } from "@/server/validators/helpers";
import { generateReportSchema, updateReportSchema } from "./schemas";
import { MarkdownReportGenerator } from "./services/markdown-report-generator";

export async function generateReport(formData: FormData) {
  const input = generateReportSchema.parse({
    siteId: formDataValue(formData, "siteId"),
    periodStart: formDataValue(formData, "periodStart"),
    periodEnd: formDataValue(formData, "periodEnd"),
    title: formDataValue(formData, "title"),
  });
  const site = await prisma.wordPressSite.findUniqueOrThrow({
    where: { id: input.siteId },
    select: { clientId: true },
  });
  const generator = new MarkdownReportGenerator();
  const generated = await generator.generateSiteReport(input);
  const report = await prisma.report.create({
    data: {
      siteId: input.siteId,
      clientId: site.clientId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      title: generated.title,
      status: "generated",
      markdownContent: generated.markdownContent,
      htmlContent: generated.htmlContent,
    },
  });

  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath(`/sites/${input.siteId}`);
  redirect(`/reports/${report.id}`);
}

export async function updateReport(reportId: string, formData: FormData) {
  const data = updateReportSchema.parse({
    title: formDataValue(formData, "title"),
    markdownContent: formDataValue(formData, "markdownContent"),
    status: formDataValue(formData, "status") || "draft",
  });
  const htmlContent = String(await marked.parse(data.markdownContent));
  const report = await prisma.report.update({
    where: { id: reportId },
    data: { ...data, htmlContent },
    select: { siteId: true },
  });

  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath(`/reports/${reportId}`);
  revalidatePath(`/sites/${report.siteId}`);
  redirect(`/reports/${reportId}`);
}
