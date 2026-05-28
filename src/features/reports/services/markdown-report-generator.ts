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
    return "- Aucun element a signaler.";
  }

  return items.map((item) => `- ${item}`).join("\n");
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
      `Rapport technique - ${site.name} - ${formatDate(input.periodStart)} au ${formatDate(input.periodEnd)}`;
    const interventions = site.interventions.map((intervention) => {
      const summary = intervention.clientSummary || intervention.description || intervention.title;
      return `${intervention.title} (${intervention.status}) : ${summary}`;
    });
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
    const security = site.securityChecks.map(
      (check) => `${formatDate(check.createdAt)} : ${check.status} - ${check.notes ?? "controle effectue"}`,
    );
    const performance = site.performanceChecks.map(
      (check) =>
        `${formatDate(check.createdAt)} : ${check.responseTimeMs ?? "n/a"} ms sur ${check.url} (${check.status})`,
    );
    const forms = site.forms.map(
      (form) => `${form.name} : ${form.status}${form.pageUrl ? ` (${form.pageUrl})` : ""}`,
    );
    const warnings =
      latestScan && latestScan.errorMessage
        ? [latestScan.errorMessage]
        : latestScan
          ? [`Dernier scan ${latestScan.status} le ${formatDate(latestScan.createdAt)}.`]
          : ["Aucun scan disponible sur la periode."];

    const markdownContent = `# ${title}

## Client et site

- Client : ${site.client.companyName || site.client.name}
- Site : ${site.name}
- URL : ${site.url}
- Periode : ${formatDate(input.periodStart)} au ${formatDate(input.periodEnd)}

## Resume clair

Le suivi technique du site a ete consolide dans WP Agency Ops Toolkit. Les points ci-dessous reprennent les actions realisees, les controles simples et les prochaines actions conseillees.

## Actions realisees

${bullet(interventions)}

## Mises a jour

${bullet(updates)}

## Securite

${bullet(security)}

## Performance

${bullet(performance)}

## Formulaires

${bullet(forms)}

## Incidents ou problemes

${bullet(warnings)}

## Recommandations techniques

- Continuer les scans reguliers avant les interventions sensibles.
- Verifier les formulaires critiques apres chaque mise a jour importante.
- Completer les controles de securite avec le futur plugin compagnon pour obtenir plus de details WordPress.

## Prochaines actions

- Planifier la prochaine maintenance.
- Mettre a jour le rapport apres les corrections realisees.
- Evaluer la compatibilite statique si le site est une vitrine simple.

## Conclusion

Le site reste suivi avec une approche technique progressive. Les actions recommandees sont priorisees sans alarme inutile.`;

    const htmlContent = String(await marked.parse(markdownContent));

    return {
      title,
      markdownContent,
      htmlContent,
    };
  }
}
