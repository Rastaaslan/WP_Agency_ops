import type { z } from "zod";
import type {
  WpurAlertSchema,
  WpurReportPayloadSchema,
  WpurReportRowSchema,
  WpurReportSectionSchema,
} from "./schemas";

export type WpurReportPayload = z.infer<typeof WpurReportPayloadSchema>;
export type WpurReportSection = z.infer<typeof WpurReportSectionSchema>;
export type WpurReportRow = z.infer<typeof WpurReportRowSchema>;
export type WpurAlert = z.infer<typeof WpurAlertSchema>;

export type WpurAlertPreview = {
  type: string;
  level: "info" | "warning" | "error";
  message: string;
  pluginSlug?: string;
  pluginName?: string;
};

export type WpurImportSummary = {
  schemaVersion: string;
  reportType: "monthly_maintenance_matrix";
  periodMonth: string;
  periodLabel: string;
  maintenanceDateCount: number;
  sectionCount: number;
  pluginCount: number;
  updateCheckCount: number;
  alertCount: number;
  alertsByLevel: {
    info: number;
    warning: number;
    error: number;
  };
  pluginsAdded: number;
  pluginsRemoved: number;
  pluginsChanged: number;
  notesCount: number;
  firstAlerts: WpurAlertPreview[];
};
