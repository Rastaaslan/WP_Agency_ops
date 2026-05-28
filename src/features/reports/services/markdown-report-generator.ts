import { marked } from "marked";
import { formatDate } from "@/lib/dates";
import { prisma } from "@/server/db/client";
import type {
  GeneratedReport,
  GenerateReportInput,
  ReportGenerator,
} from "../types";

function bullet(items: string[]) {
  if (items.length === 0) {
    return "- Aucun point particulier a signaler.";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function rawList(raw: unknown, key: "warnings" | "recommendations") {
  if (!isRecord(raw) || !Array.isArray(raw[key])) {
    return [];
  }

  return raw[key]
    .map((item) => (isRecord(item) ? asString(item.message) : undefined))
    .filter((item): item is string => Boolean(item));
}

function summaryValue(raw: unknown, key: string) {
  return isRecord(raw) ? raw[key] : undefined;
}

function readableStatus(status: string) {
  if (status === "done" || status === "ok" || status === "success") {
    return "OK";
  }

  if (status === "warning" || status === "planned" || status === "in_progress") {
    return "A surveiller";
  }

  if (status === "issue" || status === "failed") {
    return "Action recommandee";
  }

  return status;
}

export class MarkdownReportGenerator implements ReportGenerator {
  async generateSiteReport(input: GenerateReportInput): Promise<GeneratedReport> {
    const site = await prisma.wordPressSite.findUniqueOrThrow({
      where: { id: input.siteId },
      include: {
        client: true,
        scans: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plugins: true, themes: true },
        },
        interventions: {
          where: {
            createdAt: {
              gte: input.periodStart,
              lte: input.periodEnd,
            },
          },
          orderBy: { createdAt: "desc" },
          include: { items: true },
        },
        performanceChecks: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        securityChecks: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        forms: {
          where: { status: { not: "archived" } },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
    const latestScan = site.scans[0];
    const title =
      input.title ??
      `Rapport technique - ${site.name}`;
    const latestSummary = latestScan?.summaryJson;
    const latestRaw = latestScan?.rawJson;
    const scanWarnings = rawList(latestRaw, "warnings");
    const scanRecommendations = rawList(latestRaw, "recommendations");
    const doneInterventions = site.interventions
      .filter((intervention) => intervention.status === "done")
      .map((intervention) => {
        const summary = intervention.clientSummary || intervention.description || intervention.title;
        return `${intervention.title} : ${summary}`;
      });
    const plannedInterventions = site.interventions
      .filter((intervention) => intervention.status !== "done")
      .map((intervention) => `${intervention.title} (${readableStatus(intervention.status)})`);
    const interventionItems = site.interventions.flatMap((intervention) =>
      (intervention.items ?? [])
        .filter((item) => item.status === "done" || item.status === "warning")
        .map((item) => `${item.label} (${readableStatus(item.status)})`),
    );
    const updates = latestScan
      ? [
          ...latestScan.plugins
            .filter((plugin) => plugin.updateAvailable)
            .map((plugin) => `${plugin.name} ${plugin.version ?? ""} -> ${plugin.newVersion ?? "version disponible"}`),
          ...latestScan.themes
            .filter((theme) => theme.updateAvailable)
            .map((theme) => `${theme.name} ${theme.version ?? ""} -> ${theme.newVersion ?? "version disponible"}`),
        ]
      : [];
    const latestSecurity = site.securityChecks[0];
    const security = latestSecurity
      ? [
          `HTTPS : ${latestSecurity.httpsEnabled ? "actif" : "a verifier"}`,
          `Headers principaux : ${latestSecurity.hasSecurityHeaders ? "presents" : "a completer"}`,
          `XML-RPC : ${latestSecurity.xmlrpcExposed ? "expose, a verifier selon l'usage" : "non expose ou non detecte"}`,
          `Readme WordPress : ${latestSecurity.readmeExposed ? "expose" : "non expose ou non detecte"}`,
          latestSecurity.notes ?? "Controle securite simple effectue.",
        ]
      : [];
    const performance = site.performanceChecks.slice(0, 1).map(
      (check) =>
        `${check.responseTimeMs ?? "n/a"} ms observes sur ${check.url} (${readableStatus(check.status)}).`,
    );
    const forms = site.forms.map(
      (form) => `${form.name} : ${readableStatus(form.status)}${form.pageUrl ? ` (${form.pageUrl})` : ""}`,
    );
    const pointsToWatch = [
      ...plannedInterventions,
      ...scanWarnings,
      ...(latestScan?.errorMessage ? [latestScan.errorMessage] : []),
    ];
    const recommendationDefaults = [
      "Continuer les scans reguliers avant les interventions sensibles.",
      "Verifier les formulaires critiques apres chaque mise a jour importante.",
    ];
    const recommendations =
      scanRecommendations.length > 0
        ? scanRecommendations
        : recommendationDefaults;
    const updateCount =
      updates.length ||
      asNumber(summaryValue(latestSummary, "updateCount")) ||
      0;
    const generalStatus =
      latestScan?.status === "failed"
        ? "Action recommandee"
        : updateCount > 0 || scanWarnings.length > 0
          ? "Attention recommandee"
          : "Suivi technique stable";

    const markdownContent = `# Rapport technique - ${site.name}

## Resume

La maintenance technique du site a ete suivie et documentee. Le rapport ci-dessous presente les controles realises, les actions suivies et les points a surveiller sans alarme inutile.

## Periode

Du ${formatDate(input.periodStart)} au ${formatDate(input.periodEnd)}

## Site concerne

- Client : ${site.client.companyName || site.client.name}
- Site : ${site.name}
- URL : ${site.url}
- Environnement : ${site.environment}

## Etat general

- Statut : ${generalStatus}
- Dernier scan : ${latestScan ? `${readableStatus(latestScan.status)} le ${formatDate(latestScan.createdAt)}` : "Aucun scan disponible"}
- Version WordPress : ${asString(summaryValue(latestSummary, "wpVersion")) ?? "Non connue"}
- Version PHP : ${asString(summaryValue(latestSummary, "phpVersion")) ?? "Non connue"}
- Theme actif : ${asString(summaryValue(latestSummary, "activeTheme")) ?? "Non connu"}
- Mises a jour detectees : ${updateCount}

## Actions realisees

${bullet([...doneInterventions, ...interventionItems])}

## Mises a jour et maintenance

${bullet(updates)}

## Securite technique

${bullet(security)}

## Performance

${bullet(performance)}

## Formulaires

${bullet(forms)}

## Points a surveiller

${bullet(pointsToWatch)}

## Recommandations techniques

${bullet(recommendations)}

## Conclusion

Le site reste suivi avec une approche technique progressive. Les prochaines actions sont identifiees et peuvent etre traitees dans une intervention planifiee.`;

    const htmlContent = String(await marked.parse(markdownContent));

    return {
      title,
      markdownContent,
      htmlContent,
    };
  }
}
