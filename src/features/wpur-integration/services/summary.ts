import type {
  WpurImportSummary,
  WpurReportPayload,
  WpurReportRow,
} from "../types";

const updateCheckPattern = /update|updated|up_to_date|mise|maj/i;
const pluginTargetPattern = /plugin|extension/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function allRows(payload: WpurReportPayload) {
  return payload.sections.flatMap((section) => section.rows);
}

function isPluginRow(row: WpurReportRow) {
  return pluginTargetPattern.test(row.targetType);
}

function pluginKey(row: WpurReportRow) {
  if (row.targetSlug) {
    return row.targetSlug;
  }

  if (isRecord(row.metadata)) {
    return (
      asString(row.metadata.slug) ??
      asString(row.metadata.pluginSlug) ??
      asString(row.metadata.plugin_slug) ??
      asString(row.metadata.name)
    );
  }

  return row.label;
}

function rowHasChange(row: WpurReportRow, changeType: "added" | "removed" | "changed") {
  if (row.checks[changeType] === true) {
    return true;
  }

  if (!isRecord(row.metadata)) {
    return false;
  }

  const metadataValues = [
    row.metadata.status,
    row.metadata.change,
    row.metadata.diff,
    row.metadata.lifecycle,
  ]
    .map(asString)
    .filter((value): value is string => Boolean(value));

  return metadataValues.some((value) => value.toLowerCase() === changeType);
}

export function summarizeWpurPayload(payload: WpurReportPayload): WpurImportSummary {
  const rows = allRows(payload);
  const pluginRows = rows.filter(isPluginRow);
  const pluginKeys = new Set(pluginRows.map(pluginKey).filter(Boolean));
  const updateCheckCount = rows.reduce((count, row) => {
    return count + Object.entries(row.checks).filter(([key, value]) => value && updateCheckPattern.test(key)).length;
  }, 0);

  const alertsByLevel = payload.alerts.reduce(
    (levels, alert) => {
      const level = alert.level ?? "info";
      levels[level] += 1;
      return levels;
    },
    { info: 0, warning: 0, error: 0 },
  );

  return {
    schemaVersion: payload.schemaVersion,
    reportType: payload.reportType,
    periodMonth: payload.period.month,
    periodLabel: payload.period.label,
    maintenanceDateCount: payload.maintenanceDates.length,
    sectionCount: payload.sections.length,
    pluginCount: pluginKeys.size,
    updateCheckCount,
    alertCount: payload.alerts.length,
    alertsByLevel,
    pluginsAdded: pluginRows.filter((row) => rowHasChange(row, "added")).length,
    pluginsRemoved: pluginRows.filter((row) => rowHasChange(row, "removed")).length,
    pluginsChanged: pluginRows.filter((row) => rowHasChange(row, "changed")).length,
    notesCount: payload.notes.length,
    firstAlerts: payload.alerts.slice(0, 5).map((alert) => ({
      type: alert.type,
      level: alert.level ?? "info",
      message: alert.message,
      pluginSlug: alert.plugin?.slug,
      pluginName: alert.plugin?.name,
    })),
  };
}
