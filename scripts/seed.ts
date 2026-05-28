import "dotenv/config";
import { marked } from "marked";
import { Prisma } from "../src/generated/prisma/client";
import { prisma } from "../src/server/db/client";

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function main() {
  const atelier = await prisma.client.upsert({
    where: { id: "seed-client-atelier" },
    update: {
      name: "Marie Laurent",
      companyName: "Atelier Nova",
      email: "marie@example.com",
      phone: "+33 1 23 45 67 89",
      notes: "Client vitrine avec maintenance mensuelle.",
      status: "active",
    },
    create: {
      id: "seed-client-atelier",
      name: "Marie Laurent",
      companyName: "Atelier Nova",
      email: "marie@example.com",
      phone: "+33 1 23 45 67 89",
      notes: "Client vitrine avec maintenance mensuelle.",
    },
  });

  const habitat = await prisma.client.upsert({
    where: { id: "seed-client-habitat" },
    update: {
      name: "Thomas Bernard",
      companyName: "Habitat Conseil",
      email: "thomas@example.com",
      notes: "Plusieurs environnements WordPress a suivre.",
      status: "active",
    },
    create: {
      id: "seed-client-habitat",
      name: "Thomas Bernard",
      companyName: "Habitat Conseil",
      email: "thomas@example.com",
      notes: "Plusieurs environnements WordPress a suivre.",
    },
  });

  const siteOne = await prisma.wordPressSite.upsert({
    where: { id: "seed-site-atelier-prod" },
    update: {
      clientId: atelier.id,
      name: "Atelier Nova",
      url: "https://example.com",
      adminUrl: "https://example.com/wp-admin",
      environment: "production",
      status: "active",
      connectionType: "public_rest",
      connectionStatus: "connected",
      notes: "Site vitrine prioritaire.",
    },
    create: {
      id: "seed-site-atelier-prod",
      clientId: atelier.id,
      name: "Atelier Nova",
      url: "https://example.com",
      adminUrl: "https://example.com/wp-admin",
      environment: "production",
      connectionType: "public_rest",
      connectionStatus: "connected",
      notes: "Site vitrine prioritaire.",
    },
  });

  const siteTwo = await prisma.wordPressSite.upsert({
    where: { id: "seed-site-habitat-prod" },
    update: {
      clientId: habitat.id,
      name: "Habitat Conseil",
      url: "https://www.wordpress.org",
      environment: "production",
      status: "active",
      connectionType: "manual",
      connectionStatus: "unknown",
      notes: "Connexion manuelle en attente du plugin compagnon.",
    },
    create: {
      id: "seed-site-habitat-prod",
      clientId: habitat.id,
      name: "Habitat Conseil",
      url: "https://www.wordpress.org",
      environment: "production",
      connectionType: "manual",
      connectionStatus: "unknown",
      notes: "Connexion manuelle en attente du plugin compagnon.",
    },
  });

  await prisma.wordPressSite.upsert({
    where: { id: "seed-site-habitat-staging" },
    update: {
      clientId: habitat.id,
      name: "Habitat Conseil Staging",
      url: "https://staging.example.com",
      environment: "staging",
      status: "paused",
      connectionType: "none",
      connectionStatus: "unknown",
      notes: "Environnement de recette.",
    },
    create: {
      id: "seed-site-habitat-staging",
      clientId: habitat.id,
      name: "Habitat Conseil Staging",
      url: "https://staging.example.com",
      environment: "staging",
      status: "paused",
      connectionType: "none",
      connectionStatus: "unknown",
      notes: "Environnement de recette.",
    },
  });

  await prisma.wordPressConnection.upsert({
    where: { siteId: siteOne.id },
    update: {
      type: "public_rest",
      apiBaseUrl: siteOne.url,
      lastConnectionStatus: "connected",
      lastConnectionCheckAt: new Date(),
    },
    create: {
      siteId: siteOne.id,
      type: "public_rest",
      apiBaseUrl: siteOne.url,
      lastConnectionStatus: "connected",
      lastConnectionCheckAt: new Date(),
    },
  });

  const scan = await prisma.siteScan.upsert({
    where: { id: "seed-scan-atelier-may" },
    update: {
      siteId: siteOne.id,
      status: "success",
      startedAt: new Date("2026-05-20T09:00:00.000Z"),
      finishedAt: new Date("2026-05-20T09:00:05.000Z"),
      summaryJson: json({
        detected: true,
        wpVersion: "6.8.1",
        phpVersion: "8.2",
        pluginCount: 3,
        themeCount: 1,
        updateCount: 1,
        warningCount: 1,
      }),
      rawJson: json({ seed: true, mode: "manual_fixture" }),
    },
    create: {
      id: "seed-scan-atelier-may",
      siteId: siteOne.id,
      status: "success",
      startedAt: new Date("2026-05-20T09:00:00.000Z"),
      finishedAt: new Date("2026-05-20T09:00:05.000Z"),
      summaryJson: json({
        detected: true,
        wpVersion: "6.8.1",
        phpVersion: "8.2",
        pluginCount: 3,
        themeCount: 1,
        updateCount: 1,
        warningCount: 1,
      }),
      rawJson: json({ seed: true, mode: "manual_fixture" }),
    },
  });

  await prisma.wordPressPlugin.upsert({
    where: { id: "seed-plugin-seo" },
    update: {
      scanId: scan.id,
      name: "SEO Toolkit",
      slug: "seo-toolkit",
      version: "4.2.0",
      active: true,
      status: "healthy",
    },
    create: {
      id: "seed-plugin-seo",
      scanId: scan.id,
      name: "SEO Toolkit",
      slug: "seo-toolkit",
      version: "4.2.0",
      active: true,
      status: "healthy",
    },
  });

  await prisma.wordPressPlugin.upsert({
    where: { id: "seed-plugin-forms" },
    update: {
      scanId: scan.id,
      name: "Contact Forms Pro",
      slug: "contact-forms-pro",
      version: "2.9.1",
      updateAvailable: true,
      newVersion: "2.10.0",
      active: true,
      status: "update_available",
    },
    create: {
      id: "seed-plugin-forms",
      scanId: scan.id,
      name: "Contact Forms Pro",
      slug: "contact-forms-pro",
      version: "2.9.1",
      updateAvailable: true,
      newVersion: "2.10.0",
      active: true,
      status: "update_available",
    },
  });

  await prisma.wordPressTheme.upsert({
    where: { id: "seed-theme-atelier" },
    update: {
      scanId: scan.id,
      name: "Atelier Theme",
      slug: "atelier-theme",
      version: "1.8.0",
      active: true,
      status: "healthy",
    },
    create: {
      id: "seed-theme-atelier",
      scanId: scan.id,
      name: "Atelier Theme",
      slug: "atelier-theme",
      version: "1.8.0",
      active: true,
      status: "healthy",
    },
  });

  const intervention = await prisma.maintenanceIntervention.upsert({
    where: { id: "seed-intervention-updates" },
    update: {
      siteId: siteOne.id,
      title: "Maintenance mensuelle plugins",
      type: "update",
      status: "done",
      description: "Controle des extensions, mises a jour mineures et verification rapide.",
      technicalNotes: "Aucun conflit observe apres verification.",
      clientSummary: "Maintenance mensuelle realisee sans anomalie bloquante.",
      startedAt: new Date("2026-05-20T09:30:00.000Z"),
      finishedAt: new Date("2026-05-20T10:10:00.000Z"),
    },
    create: {
      id: "seed-intervention-updates",
      siteId: siteOne.id,
      title: "Maintenance mensuelle plugins",
      type: "update",
      status: "done",
      description: "Controle des extensions, mises a jour mineures et verification rapide.",
      technicalNotes: "Aucun conflit observe apres verification.",
      clientSummary: "Maintenance mensuelle realisee sans anomalie bloquante.",
      startedAt: new Date("2026-05-20T09:30:00.000Z"),
      finishedAt: new Date("2026-05-20T10:10:00.000Z"),
    },
  });

  await prisma.interventionItem.upsert({
    where: { id: "seed-item-backup" },
    update: {
      interventionId: intervention.id,
      label: "Backup verifie avant intervention",
      status: "done",
    },
    create: {
      id: "seed-item-backup",
      interventionId: intervention.id,
      label: "Backup verifie avant intervention",
      status: "done",
    },
  });

  await prisma.interventionItem.upsert({
    where: { id: "seed-item-forms" },
    update: {
      interventionId: intervention.id,
      label: "Formulaire de contact teste",
      status: "warning",
      details: "Reception OK, anti-spam a surveiller.",
    },
    create: {
      id: "seed-item-forms",
      interventionId: intervention.id,
      label: "Formulaire de contact teste",
      status: "warning",
      details: "Reception OK, anti-spam a surveiller.",
    },
  });

  await prisma.formEndpoint.upsert({
    where: { id: "seed-form-contact" },
    update: {
      siteId: siteOne.id,
      name: "Contact principal",
      pageUrl: "https://example.com/contact",
      endpointSlug: "contact",
      expectedFieldsJson: json(["nom", "email", "message"]),
      recipientsJson: json(["contact@example.com"]),
      status: "ok",
      spamProtectionEnabled: true,
      notes: "Test manuel OK en mai.",
    },
    create: {
      id: "seed-form-contact",
      siteId: siteOne.id,
      name: "Contact principal",
      pageUrl: "https://example.com/contact",
      endpointSlug: "contact",
      expectedFieldsJson: json(["nom", "email", "message"]),
      recipientsJson: json(["contact@example.com"]),
      status: "ok",
      spamProtectionEnabled: true,
      notes: "Test manuel OK en mai.",
    },
  });

  await prisma.performanceCheck.upsert({
    where: { id: "seed-performance-home" },
    update: {
      siteId: siteOne.id,
      url: siteOne.url,
      status: "ok",
      httpStatusCode: 200,
      responseTimeMs: 482,
      pageWeightKb: 420,
      notes: "Controle HTTP simple OK.",
    },
    create: {
      id: "seed-performance-home",
      siteId: siteOne.id,
      url: siteOne.url,
      status: "ok",
      httpStatusCode: 200,
      responseTimeMs: 482,
      pageWeightKb: 420,
      notes: "Controle HTTP simple OK.",
    },
  });

  await prisma.securityCheck.upsert({
    where: { id: "seed-security-home" },
    update: {
      siteId: siteOne.id,
      status: "warning",
      httpsEnabled: true,
      hasSecurityHeaders: true,
      hstsEnabled: false,
      contentSecurityPolicy: false,
      xFrameOptions: true,
      xContentTypeOptions: true,
      xmlrpcExposed: true,
      readmeExposed: false,
      directoryListingDetected: false,
      notes: "Action conseillee : verifier XML-RPC et completer les headers.",
    },
    create: {
      id: "seed-security-home",
      siteId: siteOne.id,
      status: "warning",
      httpsEnabled: true,
      hasSecurityHeaders: true,
      hstsEnabled: false,
      contentSecurityPolicy: false,
      xFrameOptions: true,
      xContentTypeOptions: true,
      xmlrpcExposed: true,
      readmeExposed: false,
      directoryListingDetected: false,
      notes: "Action conseillee : verifier XML-RPC et completer les headers.",
    },
  });

  await prisma.staticCompatibilityReview.upsert({
    where: { id: "seed-static-review" },
    update: {
      siteId: siteOne.id,
      status: "promising",
      score: 85,
      isBrochureSite: true,
      noDynamicCommerce: true,
      noMemberArea: true,
      formsIdentified: true,
      searchIdentified: false,
      commentsIdentified: false,
      recommendations: "Bon candidat a une analyse statique plus detaillee.",
    },
    create: {
      id: "seed-static-review",
      siteId: siteOne.id,
      status: "promising",
      score: 85,
      isBrochureSite: true,
      noDynamicCommerce: true,
      noMemberArea: true,
      formsIdentified: true,
      searchIdentified: false,
      commentsIdentified: false,
      recommendations: "Bon candidat a une analyse statique plus detaillee.",
    },
  });

  const reportMarkdown = `# Rapport technique - Atelier Nova

## Resume clair

Maintenance mensuelle realisee, controle securite simple effectue et formulaire principal verifie.

## Actions realisees

- Mise a jour mineure et controle des extensions.
- Verification du formulaire de contact.
- Controle HTTP performance et headers.

## Prochaines actions

- Verifier XML-RPC.
- Completer les headers de securite.
- Refaire un scan apres la prochaine maintenance.`;

  await prisma.report.upsert({
    where: { id: "seed-report-atelier-may" },
    update: {
      siteId: siteOne.id,
      clientId: atelier.id,
      periodStart: new Date("2026-05-01T00:00:00.000Z"),
      periodEnd: new Date("2026-05-31T23:59:59.000Z"),
      title: "Rapport technique - Atelier Nova - Mai 2026",
      status: "generated",
      markdownContent: reportMarkdown,
      htmlContent: String(await marked.parse(reportMarkdown)),
    },
    create: {
      id: "seed-report-atelier-may",
      siteId: siteOne.id,
      clientId: atelier.id,
      periodStart: new Date("2026-05-01T00:00:00.000Z"),
      periodEnd: new Date("2026-05-31T23:59:59.000Z"),
      title: "Rapport technique - Atelier Nova - Mai 2026",
      status: "generated",
      markdownContent: reportMarkdown,
      htmlContent: String(await marked.parse(reportMarkdown)),
    },
  });

  await prisma.wordPressSite.update({
    where: { id: siteOne.id },
    data: { lastScanAt: scan.finishedAt },
  });

  await prisma.wordPressSite.update({
    where: { id: siteTwo.id },
    data: { lastScanAt: null },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
