import { describe, expect, it } from "vitest";
import {
  createInterventionItemSchema,
  createInterventionSchema,
} from "./schemas";

describe("intervention schemas", () => {
  it("accepts the WPUR global maintenance intervention type", () => {
    const result = createInterventionSchema.safeParse({
      siteId: "site_123",
      title: "Maintenance plugins via WPUR",
      type: "wpur_plugin_maintenance",
      status: "planned",
      date: "2026-05-28",
    });

    expect(result.success).toBe(true);
  });

  it("rejects plugin-specific item fields", () => {
    const result = createInterventionItemSchema.safeParse({
      interventionId: "intervention_123",
      label: "Action globale",
      status: "planned",
      pluginSlug: "example-plugin",
    });

    expect(result.success).toBe(false);
  });
});
