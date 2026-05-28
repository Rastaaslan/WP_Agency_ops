import { describe, expect, it } from "vitest";
import { wpurPayloadSchema } from "./schemas";

const minimalWpurPayload = {
  schemaVersion: "1.0",
  reportType: "monthly_plugin_maintenance",
  period: {
    month: "2026-05",
  },
  client: {
    name: "Client Demo",
  },
  site: {
    name: "Site vitrine demo",
    url: "https://example.com",
  },
  maintenanceDates: ["2026-05-28"],
  sections: [
    {
      title: "Synthese",
      summary: "Payload minimal importe depuis WPUR.",
    },
  ],
  alerts: [
    {
      level: "info",
      message: "Import de demonstration.",
    },
  ],
  notes: ["WP Agency Ops stocke le payload sans le generer."],
};

describe("wpurPayloadSchema", () => {
  it("validates the minimal WPUR import payload", () => {
    const result = wpurPayloadSchema.safeParse(minimalWpurPayload);

    expect(result.success).toBe(true);
  });

  it("rejects invalid period months", () => {
    const result = wpurPayloadSchema.safeParse({
      ...minimalWpurPayload,
      period: {
        month: "May 2026",
      },
    });

    expect(result.success).toBe(false);
  });
});
