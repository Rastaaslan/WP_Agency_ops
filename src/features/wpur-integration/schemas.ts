import { z } from "zod";

export const wpurAlertLevelValues = ["info", "warning", "error"] as const;

export const WpurReportRowSchema = z.object({
  label: z.string().trim().min(1),
  targetType: z.string().trim().min(1),
  targetSlug: z.string().trim().min(1).optional(),
  checks: z.record(z.string(), z.boolean()),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

export const WpurReportSectionSchema = z.object({
  title: z.string().trim().min(1),
  rows: z.array(WpurReportRowSchema),
}).passthrough();

export const WpurAlertSchema = z.object({
  type: z.string().trim().min(1),
  level: z.enum(wpurAlertLevelValues).optional(),
  message: z.string().trim().min(1),
  plugin: z.object({
    slug: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
  }).optional(),
}).passthrough();

export const WpurReportPayloadSchema = z.object({
  schemaVersion: z.string().trim().min(1),
  reportType: z.literal("monthly_maintenance_matrix"),
  period: z.object({
    month: z.string().trim().min(1),
    label: z.string().trim().min(1),
  }).passthrough(),
  report: z.object({
    number: z.string().optional(),
    total: z.string().optional(),
    title: z.string().optional(),
  }).passthrough().optional(),
  client: z.object({
    name: z.string().optional(),
  }).passthrough(),
  site: z.object({
    url: z.string().optional(),
  }).passthrough(),
  offer: z.object({
    name: z.string().optional(),
  }).passthrough().optional(),
  maintenanceDates: z.array(z.string()),
  sections: z.array(WpurReportSectionSchema),
  alerts: z.array(WpurAlertSchema).default([]),
  notes: z.array(z.string()).default([]),
}).passthrough();

