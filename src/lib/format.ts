const displayDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
});

const displayDateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const enumLabels: Record<string, string> = {
  active: "Actif",
  archived: "Archivé",
  paused: "En pause",
  production: "Production",
  staging: "Préproduction",
  development: "Développement",
  general_maintenance: "Maintenance générale",
  security: "Sécurité",
  performance: "Performance",
  form: "Formulaire",
  backup: "Sauvegarde",
  deployment: "Déploiement",
  content: "Contenu",
  bugfix: "Correction",
  wpur_plugin_maintenance: "Maintenance plugins via WPUR",
  other: "Autre",
  planned: "Planifié",
  in_progress: "En cours",
  done: "Terminé",
  issue: "Point à vérifier",
  cancelled: "Annulé",
  skipped: "Ignoré",
  failed: "Échec",
  warning: "À surveiller",
  files: "Fichiers",
  database: "Base de données",
  full: "Complète",
  unknown: "Non renseigné",
  not_tested: "Non testé",
  ok: "OK",
  ignored: "Ignoré",
};

export type WpurSummaryView = {
  periodMonth: string;
  maintenanceDateCount: number;
  sectionCount: number;
  totalLineCount: number;
  alertCount: number;
};

export function formatNullable(
  value: string | null | undefined,
  fallback = "Non renseigné",
) {
  const trimmedValue = value?.trim();

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : fallback;
}

export function formatDate(value: Date | string | null | undefined) {
  const date = toValidDate(value);

  return date ? displayDateFormatter.format(date) : "Date non renseignée";
}

export function formatDateTime(value: Date | string | null | undefined) {
  const date = toValidDate(value);

  return date ? displayDateTimeFormatter.format(date) : "Date non renseignée";
}

export function formatEnumLabel(value: string) {
  return (
    enumLabels[value] ??
    value
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function readWpurSummary(
  summary: unknown,
  fallbackPeriodMonth?: string,
): WpurSummaryView {
  const summaryRecord = isRecord(summary) ? summary : {};

  return {
    periodMonth:
      readString(summaryRecord.periodMonth) ??
      fallbackPeriodMonth ??
      "Non renseignée",
    maintenanceDateCount: readNumber(summaryRecord.maintenanceDateCount),
    sectionCount: readNumber(summaryRecord.sectionCount),
    totalLineCount: readNumber(summaryRecord.totalLineCount),
    alertCount: readNumber(summaryRecord.alertCount),
  };
}

function toValidDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
