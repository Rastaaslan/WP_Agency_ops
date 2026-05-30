import "dotenv/config";
import { Prisma } from "../src/generated/prisma/client";
import { wpurPayloadSchema } from "../src/features/wpur/schemas";
import { prisma } from "../src/server/db/client";

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function summarizeDemoWpurPayload(payload: {
  period: { month: string };
  maintenanceDates: string[];
  sections: unknown[];
  alerts: unknown[];
  notes: unknown[];
}) {
  return {
    periodMonth: payload.period.month,
    maintenanceDateCount: payload.maintenanceDates.length,
    sectionCount: payload.sections.length,
    totalLineCount:
      payload.maintenanceDates.length +
      payload.sections.length +
      payload.alerts.length +
      payload.notes.length,
    alertCount: payload.alerts.length,
  };
}

async function main() {
  const atelierClient = await prisma.client.upsert({
    where: { id: "seed-client-agence-demo" },
    update: {
      name: "Atelier Nova",
      companyName: "Atelier Nova Studio",
      email: "contact@atelier-nova.test",
      phone: "04 00 00 00 00",
      notes:
        "Client principal de démonstration pour présenter le cockpit global WordPress.",
      status: "active",
    },
    create: {
      id: "seed-client-agence-demo",
      name: "Atelier Nova",
      companyName: "Atelier Nova Studio",
      email: "contact@atelier-nova.test",
      phone: "04 00 00 00 00",
      notes:
        "Client principal de démonstration pour présenter le cockpit global WordPress.",
      status: "active",
    },
  });

  const atelierSite = await prisma.site.upsert({
    where: { id: "seed-site-vitrine-demo" },
    update: {
      clientId: atelierClient.id,
      name: "Site vitrine Atelier Nova",
      url: "https://atelier-nova.test",
      environment: "production",
      status: "active",
      notes:
        "Site principal de démonstration avec suivis techniques, WPUR, sauvegardes, formulaires, sécurité et performance.",
    },
    create: {
      id: "seed-site-vitrine-demo",
      clientId: atelierClient.id,
      name: "Site vitrine Atelier Nova",
      url: "https://atelier-nova.test",
      environment: "production",
      status: "active",
      notes:
        "Site principal de démonstration avec suivis techniques, WPUR, sauvegardes, formulaires, sécurité et performance.",
    },
  });

  const maintenanceIntervention = await prisma.intervention.upsert({
    where: { id: "seed-intervention-maintenance-globale" },
    update: {
      siteId: atelierSite.id,
      title: "Maintenance générale mensuelle",
      type: "general_maintenance",
      status: "done",
      date: new Date("2026-05-21T09:00:00.000Z"),
      internalNotes:
        "Suivi de démonstration terminé, sans détail de maintenance plugin dans le cockpit.",
      clientSummary:
        "Maintenance mensuelle réalisée : état général contrôlé, sauvegardes vérifiées et synthèse WPUR consultée.",
    },
    create: {
      id: "seed-intervention-maintenance-globale",
      siteId: atelierSite.id,
      title: "Maintenance générale mensuelle",
      type: "general_maintenance",
      status: "done",
      date: new Date("2026-05-21T09:00:00.000Z"),
      internalNotes:
        "Suivi de démonstration terminé, sans détail de maintenance plugin dans le cockpit.",
      clientSummary:
        "Maintenance mensuelle réalisée : état général contrôlé, sauvegardes vérifiées et synthèse WPUR consultée.",
    },
  });

  const formIntervention = await prisma.intervention.upsert({
    where: { id: "seed-intervention-form-contact" },
    update: {
      siteId: atelierSite.id,
      title: "Suivi formulaire contact",
      type: "form",
      status: "in_progress",
      date: new Date("2026-05-29T10:00:00.000Z"),
      internalNotes:
        "Vérification manuelle en cours sur les formulaires critiques.",
      clientSummary:
        "Le formulaire de contact principal est OK, la demande de devis reste à confirmer.",
    },
    create: {
      id: "seed-intervention-form-contact",
      siteId: atelierSite.id,
      title: "Suivi formulaire contact",
      type: "form",
      status: "in_progress",
      date: new Date("2026-05-29T10:00:00.000Z"),
      internalNotes:
        "Vérification manuelle en cours sur les formulaires critiques.",
      clientSummary:
        "Le formulaire de contact principal est OK, la demande de devis reste à confirmer.",
    },
  });

  const technicalIntervention = await prisma.intervention.upsert({
    where: { id: "seed-intervention-controle-technique" },
    update: {
      siteId: atelierSite.id,
      title: "Vérification globale du site",
      type: "general_maintenance",
      status: "issue",
      date: new Date("2026-05-28T14:00:00.000Z"),
      internalNotes:
        "Suivi des points à vérifier sur le site : sécurité, performance, formulaires et sauvegardes.",
      clientSummary:
        "Des points à surveiller sont identifiés sur les contrôles simples sécurité et performance.",
    },
    create: {
      id: "seed-intervention-controle-technique",
      siteId: atelierSite.id,
      title: "Vérification globale du site",
      type: "general_maintenance",
      status: "issue",
      date: new Date("2026-05-28T14:00:00.000Z"),
      internalNotes:
        "Suivi des points à vérifier sur le site : sécurité, performance, formulaires et sauvegardes.",
      clientSummary:
        "Des points à surveiller sont identifiés sur les contrôles simples sécurité et performance.",
    },
  });

  const interventionItems = [
    {
      id: "seed-item-backup-check",
      interventionId: maintenanceIntervention.id,
      label: "Contrôler les sauvegardes",
      status: "done" as const,
      notes: "Sauvegardes récentes documentées dans le cockpit.",
    },
    {
      id: "seed-item-form-check",
      interventionId: maintenanceIntervention.id,
      label: "Vérifier l'état global du site",
      status: "done" as const,
      notes: "Contrôle général réalisé depuis la fiche site.",
    },
    {
      id: "seed-item-wpur-review",
      interventionId: maintenanceIntervention.id,
      label: "Consulter l'export WPUR",
      status: "done" as const,
      notes:
        "WPUR reste la source de vérité pour le détail maintenance plugins.",
    },
    {
      id: "seed-item-contact-form",
      interventionId: formIntervention.id,
      label: "Vérifier le formulaire de contact",
      status: "done" as const,
      notes: "Test manuel documenté, aucun envoi automatique par le toolkit.",
    },
    {
      id: "seed-item-confirm-recipients",
      interventionId: formIntervention.id,
      label: "Confirmer les destinataires",
      status: "planned" as const,
      notes: "À confirmer avec Atelier Nova Studio.",
    },
    {
      id: "seed-item-watch-points",
      interventionId: technicalIntervention.id,
      label: "Contrôler les points à surveiller",
      status: "warning" as const,
      notes: "Synthèse issue des sections sécurité, performance et formulaires.",
    },
    {
      id: "seed-item-rerun-checks",
      interventionId: technicalIntervention.id,
      label: "Relancer les contrôles sécurité/performance",
      status: "planned" as const,
      notes: "Contrôles simples et non intrusifs uniquement.",
    },
  ];

  for (const item of interventionItems) {
    await prisma.interventionItem.upsert({
      where: { id: item.id },
      update: {
        interventionId: item.interventionId,
        label: item.label,
        status: item.status,
        notes: item.notes,
      },
      create: item,
    });
  }

  const backups = [
    {
      id: "seed-backup-full-2026-05-27",
      siteId: atelierSite.id,
      interventionId: maintenanceIntervention.id,
      type: "full" as const,
      status: "done" as const,
      performedAt: new Date("2026-05-27T07:30:00.000Z"),
      provider: "Hébergement Nova",
      storageLocation: "Espace de sauvegarde hébergeur",
      notes: "Sauvegarde complète manuelle confirmée avant suivi technique.",
    },
    {
      id: "seed-backup-database-2026-05-28",
      siteId: atelierSite.id,
      interventionId: maintenanceIntervention.id,
      type: "database" as const,
      status: "done" as const,
      performedAt: new Date("2026-05-28T07:45:00.000Z"),
      provider: "Hébergement Nova",
      storageLocation: "Export base de données hébergeur",
      notes: "Sauvegarde base de données documentée pour la démo.",
    },
    {
      id: "seed-backup-full-unknown-2026-05-20",
      siteId: atelierSite.id,
      interventionId: technicalIntervention.id,
      type: "full" as const,
      status: "unknown" as const,
      performedAt: new Date("2026-05-20T08:10:00.000Z"),
      provider: "Sauvegarde externe",
      storageLocation: null,
      notes:
        "Statut à confirmer : alimente volontairement les points à surveiller.",
    },
  ];

  for (const backup of backups) {
    await prisma.backupRecord.upsert({
      where: { id: backup.id },
      update: backup,
      create: backup,
    });
  }

  const forms = [
    {
      id: "seed-form-contact-principal",
      siteId: atelierSite.id,
      name: "Formulaire de contact",
      pageUrl: "https://atelier-nova.test/contact",
      expectedRecipients: "contact@atelier-nova.test",
      status: "ok" as const,
      lastCheckedAt: new Date("2026-05-28T10:00:00.000Z"),
      notes: "Contrôle manuel OK, sans stockage de soumission.",
    },
    {
      id: "seed-form-demande-devis",
      siteId: atelierSite.id,
      name: "Demande de devis",
      pageUrl: "https://atelier-nova.test/devis",
      expectedRecipients: "studio@atelier-nova.test",
      status: "issue" as const,
      lastCheckedAt: new Date("2026-05-28T10:20:00.000Z"),
      notes:
        "Destinataires à vérifier : point volontaire pour la démo dashboard.",
    },
  ];

  for (const watchedForm of forms) {
    await prisma.watchedForm.upsert({
      where: { id: watchedForm.id },
      update: watchedForm,
      create: watchedForm,
    });
  }

  await prisma.securityCheck.upsert({
    where: { id: "seed-security-check-2026-05-28" },
    update: {
      siteId: atelierSite.id,
      checkedAt: new Date("2026-05-28T10:30:00.000Z"),
      status: "warning",
      httpStatus: 200,
      httpsEnabled: true,
      hstsHeader: true,
      cspHeader: false,
      xFrameOptionsHeader: true,
      xContentTypeOptionsHeader: true,
      xmlrpcAccessible: false,
      readmeAccessible: false,
      summary:
        "À surveiller : Content Security Policy mérite une revue.",
      notes:
        "Contrôle fictif non offensif limité aux en-têtes HTTP basiques.",
      rawJson: json({
        checkedUrl: atelierSite.url,
        policy: "non_offensive_limited_http_checks",
      }),
    },
    create: {
      id: "seed-security-check-2026-05-28",
      siteId: atelierSite.id,
      checkedAt: new Date("2026-05-28T10:30:00.000Z"),
      status: "warning",
      httpStatus: 200,
      httpsEnabled: true,
      hstsHeader: true,
      cspHeader: false,
      xFrameOptionsHeader: true,
      xContentTypeOptionsHeader: true,
      xmlrpcAccessible: false,
      readmeAccessible: false,
      summary:
        "À surveiller : Content Security Policy mérite une revue.",
      notes:
        "Contrôle fictif non offensif limité aux en-têtes HTTP basiques.",
      rawJson: json({
        checkedUrl: atelierSite.url,
        policy: "non_offensive_limited_http_checks",
      }),
    },
  });

  await prisma.performanceCheck.upsert({
    where: { id: "seed-performance-check-2026-05-28" },
    update: {
      siteId: atelierSite.id,
      checkedAt: new Date("2026-05-28T10:45:00.000Z"),
      status: "warning",
      httpStatus: 200,
      responseTimeMs: 1820,
      contentLengthBytes: 184320,
      summary:
        "Réponse lente : le site répond, mais le temps est à surveiller.",
      notes:
        "Contrôle fictif limité à une requête HTTP simple sur l'URL du site.",
      rawJson: json({
        checkedUrl: atelierSite.url,
        method: "HEAD",
        policy: "simple_single_url_performance_check",
      }),
    },
    create: {
      id: "seed-performance-check-2026-05-28",
      siteId: atelierSite.id,
      checkedAt: new Date("2026-05-28T10:45:00.000Z"),
      status: "warning",
      httpStatus: 200,
      responseTimeMs: 1820,
      contentLengthBytes: 184320,
      summary:
        "Réponse lente : le site répond, mais le temps est à surveiller.",
      notes:
        "Contrôle fictif limité à une requête HTTP simple sur l'URL du site.",
      rawJson: json({
        checkedUrl: atelierSite.url,
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
      name: atelierClient.name,
      companyName: atelierClient.companyName,
    },
    site: {
      name: atelierSite.name,
      url: atelierSite.url,
    },
    maintenanceDates: ["2026-05-07", "2026-05-21"],
    sections: [
      {
        title: "Synthèse de maintenance WPUR",
        summary:
          "WPUR a produit un rapport mensuel importé ici comme signal de cockpit.",
      },
      {
        title: "Points suivis dans WPUR",
        summary:
          "Les détails plugin par plugin restent consultables dans WPUR, pas dans WP Agency Ops.",
      },
      {
        title: "Restitution client",
        summary:
          "Aucune action détaillée plugin n'est générée par le toolkit dans ce seed.",
      },
    ],
    alerts: [
      {
        level: "warning",
        message:
          "WPUR signale des éléments à vérifier dans son rapport spécialisé.",
      },
      {
        level: "info",
        message:
          "Import utilisé ici uniquement pour alimenter la synthèse globale.",
      },
    ],
    notes: [
      "WP Agency Ops stocke cet export mais ne le génère pas.",
      "Le cockpit affiche une synthèse exploitable pour l'agence.",
      "La maintenance détaillée des extensions reste dans WPUR.",
    ],
  });
  const wpurSummary = summarizeDemoWpurPayload(wpurPayload);

  await prisma.wpurImport.upsert({
    where: { id: "seed-wpur-import-2026-05" },
    update: {
      siteId: atelierSite.id,
      periodMonth: wpurSummary.periodMonth,
      payloadJson: json(wpurPayload),
      summaryJson: json(wpurSummary),
    },
    create: {
      id: "seed-wpur-import-2026-05",
      siteId: atelierSite.id,
      periodMonth: wpurSummary.periodMonth,
      payloadJson: json(wpurPayload),
      summaryJson: json(wpurSummary),
    },
  });

  const brumeClient = await prisma.client.upsert({
    where: { id: "seed-client-maison-brume" },
    update: {
      name: "Maison Brume",
      companyName: "Maison Brume",
      email: "contact@maison-brume.test",
      phone: "04 00 00 00 01",
      notes: "Second client léger pour montrer une vue multi-clients.",
      status: "active",
    },
    create: {
      id: "seed-client-maison-brume",
      name: "Maison Brume",
      companyName: "Maison Brume",
      email: "contact@maison-brume.test",
      phone: "04 00 00 00 01",
      notes: "Second client léger pour montrer une vue multi-clients.",
      status: "active",
    },
  });

  const brumeSite = await prisma.site.upsert({
    where: { id: "seed-site-maison-brume" },
    update: {
      clientId: brumeClient.id,
      name: "Site Maison Brume",
      url: "https://maison-brume.test",
      environment: "staging",
      status: "active",
      notes:
        "Site secondaire avec données partielles pour illustrer un portefeuille multi-sites.",
    },
    create: {
      id: "seed-site-maison-brume",
      clientId: brumeClient.id,
      name: "Site Maison Brume",
      url: "https://maison-brume.test",
      environment: "staging",
      status: "active",
      notes:
        "Site secondaire avec données partielles pour illustrer un portefeuille multi-sites.",
    },
  });

  const brumeIntervention = await prisma.intervention.upsert({
    where: { id: "seed-intervention-maison-brume-revue" },
    update: {
      siteId: brumeSite.id,
      title: "Première revue de suivi",
      type: "general_maintenance",
      status: "planned",
      date: new Date("2026-06-03T09:30:00.000Z"),
      internalNotes: "Suivi léger pour montrer un second site.",
      clientSummary: "Première revue globale à planifier.",
    },
    create: {
      id: "seed-intervention-maison-brume-revue",
      siteId: brumeSite.id,
      title: "Première revue de suivi",
      type: "general_maintenance",
      status: "planned",
      date: new Date("2026-06-03T09:30:00.000Z"),
      internalNotes: "Suivi léger pour montrer un second site.",
      clientSummary: "Première revue globale à planifier.",
    },
  });

  await prisma.interventionItem.upsert({
    where: { id: "seed-item-maison-brume-first-review" },
    update: {
      interventionId: brumeIntervention.id,
      label: "Lister les contrôles à mettre en place",
      status: "planned",
      notes: "Point de départ pour un site encore peu renseigné.",
    },
    create: {
      id: "seed-item-maison-brume-first-review",
      interventionId: brumeIntervention.id,
      label: "Lister les contrôles à mettre en place",
      status: "planned",
      notes: "Point de départ pour un site encore peu renseigné.",
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
