import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";

function filename(value: string) {
  return value.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const report = await prisma.report.findUnique({ where: { id } });

  if (!report) {
    notFound();
  }

  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(report.title)}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 40px auto; max-width: 860px; color: #18181b; line-height: 1.6; padding: 0 20px; }
    h1, h2 { line-height: 1.2; }
    h1 { font-size: 32px; margin-bottom: 24px; }
    h2 { font-size: 20px; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 20px; }
    li { margin: 6px 0; }
  </style>
</head>
<body>
${report.htmlContent ?? ""}
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": `attachment; filename="${filename(report.title)}.html"`,
    },
  });
}
