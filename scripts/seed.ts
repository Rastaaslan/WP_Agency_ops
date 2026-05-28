import "dotenv/config";
import { Prisma } from "../src/generated/prisma/client";
import { wpurPayloadSchema } from "../src/features/wpur/schemas";
import { prisma } from "../src/server/db/client";

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function main() {
  const client = await prisma.client.upsert({
    where: { id: "seed-client-agence-demo" },
    update: {
      name: "Client Demo",
      companyName: "Agence Demo",
      email: "contact@example.com",
      phone: "+33 1 23 45 67 89",
      notes: "Client fictif pour valider le modele de donnees v2.",
      status: "active",
    },
    create: {
      id: "seed-client-agence-demo",
      name: "Client Demo",
      companyName: "Agence Demo",
      email: "contact@example.com",
      phone: "+33 1 23 45 67 89",
      notes: "Client fictif pour valider le modele de donnees v2.",
    },
  });

  const site = await prisma.site.upsert({
    where: { id: "seed-site-vitrine-demo" },
    update: {
      clientId: client.id,
      name: "Site vitrine demo",
      url: "https://example.com",
      environment: "production",
      status: "active",
      notes: "Site fictif rattache au client demo.",
    },
    create: {
      id: "seed-site-vitrine-demo",
      clientId: client.id,
      name: "Site vitrine demo",
      url: "https://example.com",
      environment: "production",
      notes: "Site fictif rattache au client demo.",
    },
  });

  const intervention = await prisma.intervention.upsert({
    where: { id: "seed-intervention-maintenance-globale" },
    update: {
      siteId: site.id,
      title: "Maintenance globale mensuelle",
      type: "general_maintenance",
      status: "planned",
      date: new Date("2026-05-28T09:00:00.000Z"),
      internalNotes: "Intervention fictive sans action plugin detaillee.",
      clientSummary: "Maintenance globale planifiee pour le site demo.",
    },
    create: {
      id: "seed-intervention-maintenance-globale",
      siteId: site.id,
      title: "Maintenance globale mensuelle",
      type: "general_maintenance",
      status: "planned",
      date: new Date("2026-05-28T09:00:00.000Z"),
      internalNotes: "Intervention fictive sans action plugin detaillee.",
      clientSummary: "Maintenance globale planifiee pour le site demo.",
    },
  });

  await prisma.interventionItem.upsert({
    where: { id: "seed-item-backup-check" },
    update: {
      interventionId: intervention.id,
      label: "Verifier la presence d'une sauvegarde recente",
      status: "planned",
      notes: "Controle global, sans execution de sauvegarde.",
    },
    create: {
      id: "seed-item-backup-check",
      interventionId: intervention.id,
      label: "Verifier la presence d'une sauvegarde recente",
      status: "planned",
      notes: "Controle global, sans execution de sauvegarde.",
    },
  });

  await prisma.interventionItem.upsert({
    where: { id: "seed-item-form-check" },
    update: {
      interventionId: intervention.id,
      label: "Controler le formulaire de contact principal",
      status: "planned",
      notes: "Verification fonctionnelle globale.",
    },
    create: {
      id: "seed-item-form-check",
      interventionId: intervention.id,
      label: "Controler le formulaire de contact principal",
      status: "planned",
      notes: "Verification fonctionnelle globale.",
    },
  });

  await prisma.backupRecord.upsert({
    where: { id: "seed-backup-full-2026-05-28" },
    update: {
      siteId: site.id,
      interventionId: intervention.id,
      type: "full",
      status: "done",
      performedAt: new Date("2026-05-28T08:30:00.000Z"),
      provider: "Hebergeur Demo",
      storageLocation: "Espace de sauvegarde hebergeur",
      notes:
        "Sauvegarde fictive documentee pour valider le suivi manuel v2.",
    },
    create: {
      id: "seed-backup-full-2026-05-28",
      siteId: site.id,
      interventionId: intervention.id,
      type: "full",
      status: "done",
      performedAt: new Date("2026-05-28T08:30:00.000Z"),
      provider: "Hebergeur Demo",
      storageLocation: "Espace de sauvegarde hebergeur",
      notes:
        "Sauvegarde fictive documentee pour valider le suivi manuel v2.",
    },
  });

  await prisma.watchedForm.upsert({
    where: { id: "seed-form-contact-principal" },
    update: {
      siteId: site.id,
      name: "Formulaire de contact principal",
      pageUrl: "https://example.com/contact",
      expectedRecipients: "contact@example.com",
      status: "ok",
      lastCheckedAt: new Date("2026-05-28T10:00:00.000Z"),
      notes:
        "Formulaire fictif documente pour valider le suivi manuel v2.",
    },
    create: {
      id: "seed-form-contact-principal",
      siteId: site.id,
      name: "Formulaire de contact principal",
      pageUrl: "https://example.com/contact",
      expectedRecipients: "contact@example.com",
      status: "ok",
      lastCheckedAt: new Date("2026-05-28T10:00:00.000Z"),
      notes:
        "Formulaire fictif documente pour valider le suivi manuel v2.",
    },
  });

  await prisma.securityCheck.upsert({
    where: { id: "seed-security-check-2026-05-28" },
    update: {
      siteId: site.id,
      checkedAt: new Date("2026-05-28T10:30:00.000Z"),
      status: "warning",
      httpStatus: 200,
      httpsEnabled: true,
      hstsHeader: false,
      cspHeader: false,
      xFrameOptionsHeader: true,
      xContentTypeOptionsHeader: true,
      xmlrpcAccessible: false,
      readmeAccessible: false,
      summary:
        "À surveiller : certains en-têtes ou fichiers publics méritent une revue.",
      notes:
        "Contrôle fictif non offensif limité aux en-têtes HTTP basiques.",
      rawJson: json({
        checkedUrl: site.url,
        policy: "non_offensive_limited_http_checks",
      }),
    },
    create: {
      id: "seed-security-check-2026-05-28",
      siteId: site.id,
      checkedAt: new Date("2026-05-28T10:30:00.000Z"),
      status: "warning",
      httpStatus: 200,
      httpsEnabled: true,
      hstsHeader: false,
      cspHeader: false,
      xFrameOptionsHeader: true,
      xContentTypeOptionsHeader: true,
      xmlrpcAccessible: false,
      readmeAccessible: false,
      summary:
        "À surveiller : certains en-têtes ou fichiers publics méritent une revue.",
      notes:
        "Contrôle fictif non offensif limité aux en-têtes HTTP basiques.",
      rawJson: json({
        checkedUrl: site.url,
        policy: "non_offensive_limited_http_checks",
      }),
    },
  });

  await prisma.performanceCheck.upsert({
    where: { id: "seed-performance-check-2026-05-28" },
    update: {
      siteId: site.id,
      checkedAt: new Date("2026-05-28T10:45:00.000Z"),
      status: "ok",
      httpStatus: 200,
      responseTimeMs: 420,
      contentLengthBytes: 1256,
      summary: "Réponse rapide : le site répond dans un délai raisonnable.",
      notes:
        "Contrôle fictif limité à une requête HTTP simple sur l'URL du site.",
      rawJson: json({
        checkedUrl: site.url,
        method: "HEAD",
        policy: "simple_single_url_performance_check",
      }),
    },
    create: {
      id: "seed-performance-check-2026-05-28",
      siteId: site.id,
      checkedAt: new Date("2026-05-28T10:45:00.000Z"),
      status: "ok",
      httpStatus: 200,
      responseTimeMs: 420,
      contentLengthBytes: 1256,
      summary: "Réponse rapide : le site répond dans un délai raisonnable.",
      notes:
        "Contrôle fictif limité à une requête HTTP simple sur l'URL du site.",
      rawJson: json({
        checkedUrl: site.url,
        method: "HEAD",
        policy: "simple_single_url_performance_check",
      }),
    },
  });

  const wpurPayload = wpurPayloadSchema.parse({
    schemaVersion: "1.0",
    reportType: "monthly_plugin_maintenance",
    period: {
      month: "2026-05",
    },
    client: {
      name: client.companyName ?? client.name,
    },
    site: {
      name: site.name,
      url: site.url,
    },
    maintenanceDates: ["2026-05-28"],
    sections: [
      {
        title: "Synthese WPUR",
        summary: "Import fictif minimal produit par WPUR.",
      },
    ],
    alerts: [
      {
        level: "info",
        message: "Payload minimal de demonstration, sans comparaison plugins.",
      },
    ],
    notes: ["WP Agency Ops stocke ce payload mais ne le genere pas."],
  });

  await prisma.wpurImport.upsert({
    where: { id: "seed-wpur-import-2026-05" },
    update: {
      siteId: site.id,
      periodMonth: "2026-05",
      payloadJson: json(wpurPayload),
      summaryJson: json({
        alertCount: wpurPayload.alerts.length,
        sectionCount: wpurPayload.sections.length,
      }),
    },
    create: {
      id: "seed-wpur-import-2026-05",
      siteId: site.id,
      periodMonth: "2026-05",
      payloadJson: json(wpurPayload),
      summaryJson: json({
        alertCount: wpurPayload.alerts.length,
        sectionCount: wpurPayload.sections.length,
      }),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
