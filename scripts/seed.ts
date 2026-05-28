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
      connectionType: "companion_plugin",
      connectionStatus: "connected",
      notes: "Site vitrine prioritaire. Donnees seed simulees comme si le plugin compagnon etait connecte.",
    },
    create: {
      id: "seed-site-atelier-prod",
      clientId: atelier.id,
      name: "Atelier Nova",
      url: "https://example.com",
      adminUrl: "https://example.com/wp-admin",
      environment: "production",
      connectionType: "companion_plugin",
      connectionStatus: "connected",
      notes: "Site vitrine prioritaire. Donnees seed simulees comme si le plugin compagnon etait connecte.",
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
      type: "companion_plugin",
      apiBaseUrl: siteOne.url,
      secretReference: "env:WP_AGENCY_OPS_COMPANION_API_KEY",
      lastConnectionStatus: "connected",
      lastConnectionCheckAt: new Date(),
    },
    create: {
      siteId: siteOne.id,
      type: "companion_plugin",
      apiBaseUrl: siteOne.url,
      secretReference: "env:WP_AGENCY_OPS_COMPANION_API_KEY",
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
        connectionType: "companion_plugin",
        wpVersion: "6.8.1",
        phpVersion: "8.2",
        activeTheme: "Atelier Theme",
        environment: "production",
        debugEnabled: false,
        multisite: false,
        pluginCount: 3,
        themeCount: 1,
        updateCount: 2,
        warningCount: 2,
        recommendationCount: 3,
      }),
      rawJson: json({
        seed: true,
        mode: "companion_fixture",
        connectionType: "companion_plugin",
        detected: true,
        siteUrl: siteOne.url,
        wpVersion: "6.8.1",
        phpVersion: "8.2",
        activeTheme: "Atelier Theme",
        environment: "production",
        debugEnabled: false,
        updates: [
          {
            kind: "plugin",
            slug: "contact-forms-pro",
            currentVersion: "2.9.1",
            newVersion: "2.10.0",
            label: "Plugin contact-forms-pro",
          },
          {
            kind: "theme",
            slug: "atelier-theme",
            currentVersion: "1.8.0",
            newVersion: "1.9.0",
            label: "Theme atelier-theme",
          },
        ],
        warnings: [
          {
            code: "plugin_updates_available",
            severity: "warning",
            message: "1 extension avec mise a jour disponible.",
          },
          {
            code: "theme_updates_available",
            severity: "warning",
            message: "1 theme avec mise a jour disponible.",
          },
        ],
        recommendations: [
          {
            code: "backup_before_maintenance",
            priority: "important",
            message: "Effectuer une sauvegarde avant intervention.",
          },
          {
            code: "plan_plugin_updates",
            priority: "warning",
            message: "Prevoir une mise a jour des extensions.",
          },
          {
            code: "rescan_after_maintenance",
            priority: "info",
            message: "Relancer un scan apres intervention.",
          },
        ],
      }),
    },
    create: {
      id: "seed-scan-atelier-may",
      siteId: siteOne.id,
      status: "success",
      startedAt: new Date("2026-05-20T09:00:00.000Z"),
      finishedAt: new Date("2026-05-20T09:00:05.000Z"),
      summaryJson: json({
        detected: true,
        connectionType: "companion_plugin",
        wpVersion: "6.8.1",
        phpVersion: "8.2",
        activeTheme: "Atelier Theme",
        environment: "production",
        debugEnabled: false,
        multisite: false,
        pluginCount: 3,
        themeCount: 1,
        updateCount: 2,
        warningCount: 2,
        recommendationCount: 3,
      }),
      rawJson: json({
        seed: true,
        mode: "companion_fixture",
        connectionType: "companion_plugin",
        detected: true,
        siteUrl: siteOne.url,
        wpVersion: "6.8.1",
        phpVersion: "8.2",
        activeTheme: "Atelier Theme",
        environment: "production",
        debugEnabled: false,
        updates: [
          {
            kind: "plugin",
            slug: "contact-forms-pro",
            currentVersion: "2.9.1",
            newVersion: "2.10.0",
            label: "Plugin contact-forms-pro",
          },
          {
            kind: "theme",
            slug: "atelier-theme",
            currentVersion: "1.8.0",
            newVersion: "1.9.0",
            label: "Theme atelier-theme",
          },
        ],
        warnings: [
          {
            code: "plugin_updates_available",
            severity: "warning",
            message: "1 extension avec mise a jour disponible.",
          },
          {
            code: "theme_updates_available",
            severity: "warning",
            message: "1 theme avec mise a jour disponible.",
          },
        ],
        recommendations: [
          {
            code: "backup_before_maintenance",
            priority: "important",
            message: "Effectuer une sauvegarde avant intervention.",
          },
          {
            code: "plan_plugin_updates",
            priority: "warning",
            message: "Prevoir une mise a jour des extensions.",
          },
          {
            code: "rescan_after_maintenance",
            priority: "info",
            message: "Relancer un scan apres intervention.",
          },
        ],
      }),
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

  await prisma.wordPressPlugin.upsert({
    where: { id: "seed-plugin-legacy-gallery" },
    update: {
      scanId: scan.id,
      name: "Legacy Gallery",
      slug: "legacy-gallery",
      version: "1.4.0",
      updateAvailable: false,
      active: false,
      status: "inactive",
    },
    create: {
      id: "seed-plugin-legacy-gallery",
      scanId: scan.id,
      name: "Legacy Gallery",
      slug: "legacy-gallery",
      version: "1.4.0",
      updateAvailable: false,
      active: false,
      status: "inactive",
    },
  });

  await prisma.wordPressTheme.upsert({
    where: { id: "seed-theme-atelier" },
    update: {
      scanId: scan.id,
      name: "Atelier Theme",
      slug: "atelier-theme",
      version: "1.8.0",
      updateAvailable: true,
      newVersion: "1.9.0",
      active: true,
      status: "update_available",
    },
    create: {
      id: "seed-theme-atelier",
      scanId: scan.id,
      name: "Atelier Theme",
      slug: "atelier-theme",
      version: "1.8.0",
      updateAvailable: true,
      newVersion: "1.9.0",
      active: true,
      status: "update_available",
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

  const generatedIntervention = await prisma.maintenanceIntervention.upsert({
    where: { id: "seed-intervention-generated-from-scan" },
    update: {
      siteId: siteOne.id,
      title: "Maintenance technique - mises a jour et verifications",
      type: "update",
      status: "planned",
      description:
        "Intervention generee a partir du dernier scan technique du site.",
      technicalNotes:
        "Scan source : seed-scan-atelier-may\nLot de demo : aucune mise a jour automatique n'est declenchee.",
      clientSummary:
        "Une maintenance technique est planifiee a partir des controles recents du site.",
      startedAt: null,
      finishedAt: null,
    },
    create: {
      id: "seed-intervention-generated-from-scan",
      siteId: siteOne.id,
      title: "Maintenance technique - mises a jour et verifications",
      type: "update",
      status: "planned",
      description:
        "Intervention generee a partir du dernier scan technique du site.",
      technicalNotes:
        "Scan source : seed-scan-atelier-may\nLot de demo : aucune mise a jour automatique n'est declenchee.",
      clientSummary:
        "Une maintenance technique est planifiee a partir des controles recents du site.",
    },
  });

  const generatedItems = [
    [
      "seed-generated-item-backup",
      "Effectuer une sauvegarde avant intervention.",
      "planned",
      "Categorie: backup\nNiveau: important\nSource: scan\nScan: seed-scan-atelier-may",
    ],
    [
      "seed-generated-item-plugin",
      "Mettre a jour le plugin Contact Forms Pro de 2.9.1 vers 2.10.0.",
      "planned",
      "Categorie: update\nNiveau: warning\nSource: scan\nScan: seed-scan-atelier-may",
    ],
    [
      "seed-generated-item-theme",
      "Mettre a jour le theme Atelier Theme de 1.8.0 vers 1.9.0.",
      "planned",
      "Categorie: update\nNiveau: warning\nSource: scan\nScan: seed-scan-atelier-may",
    ],
    [
      "seed-generated-item-inactive",
      "Verifier les plugins inactifs.",
      "planned",
      "Categorie: cleanup\nNiveau: info\nSource: scan\nScan: seed-scan-atelier-may",
    ],
    [
      "seed-generated-item-rescan",
      "Relancer un scan apres intervention.",
      "planned",
      "Categorie: scan\nNiveau: info\nSource: scan\nScan: seed-scan-atelier-may",
    ],
  ] as const;

  for (const [id, label, status, details] of generatedItems) {
    await prisma.interventionItem.upsert({
      where: { id },
      update: {
        interventionId: generatedIntervention.id,
        label,
        status,
        details,
      },
      create: {
        id,
        interventionId: generatedIntervention.id,
        label,
        status,
        details,
      },
    });
  }

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

## Resume

La maintenance technique du site a ete suivie et documentee. Aucun point bloquant n'est signale dans cette demo, mais quelques mises a jour restent a planifier.

## Periode

Du 01/05/2026 au 31/05/2026

## Site concerne

- Client : Atelier Nova
- Site : Atelier Nova
- URL : https://example.com
- Environnement : production

## Etat general

- Statut : Attention recommandee
- Dernier scan : OK le 20/05/2026
- Version WordPress : 6.8.1
- Version PHP : 8.2
- Theme actif : Atelier Theme
- Mises a jour detectees : 2

## Actions realisees

- Maintenance mensuelle plugins : maintenance mensuelle realisee sans anomalie bloquante.
- Formulaire de contact teste (A surveiller)

## Mises a jour et maintenance

- Contact Forms Pro 2.9.1 -> 2.10.0
- Atelier Theme 1.8.0 -> 1.9.0

## Securite technique

- HTTPS : actif
- Headers principaux : presents
- XML-RPC : expose, a verifier selon l'usage

## Performance

- 482 ms observes sur https://example.com (OK).

## Formulaires

- Contact principal : OK (https://example.com/contact)

## Points a surveiller

- Maintenance technique - mises a jour et verifications (A surveiller)
- 1 extension avec mise a jour disponible.
- 1 theme avec mise a jour disponible.

## Recommandations techniques

- Effectuer une sauvegarde avant intervention.
- Prevoir une mise a jour des extensions.
- Relancer un scan apres intervention.

## Conclusion

Le site reste suivi avec une approche technique progressive. Les prochaines actions sont identifiees et peuvent etre traitees dans une intervention planifiee.`;

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
