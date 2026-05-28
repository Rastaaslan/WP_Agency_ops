export const clientStatuses = ["active", "archived"] as const;

export const siteEnvironments = [
  "production",
  "staging",
  "development",
] as const;

export const siteStatuses = ["active", "paused", "archived"] as const;

export const interventionTypes = [
  "general_maintenance",
  "security",
  "performance",
  "form",
  "backup",
  "deployment",
  "content",
  "bugfix",
  "wpur_plugin_maintenance",
  "other",
] as const;

export const interventionStatuses = [
  "planned",
  "in_progress",
  "done",
  "issue",
  "cancelled",
] as const;

export const interventionItemStatuses = [
  "planned",
  "done",
  "skipped",
  "failed",
  "warning",
] as const;

export type ClientStatus = (typeof clientStatuses)[number];
export type SiteEnvironment = (typeof siteEnvironments)[number];
export type SiteStatus = (typeof siteStatuses)[number];
export type InterventionType = (typeof interventionTypes)[number];
export type InterventionStatus = (typeof interventionStatuses)[number];
export type InterventionItemStatus = (typeof interventionItemStatuses)[number];
