import { describe, expect, it } from "vitest";
import { WpurReportPayloadSchema } from "../schemas";
import { summarizeWpurPayload } from "./summary";

const payload = {
  schemaVersion: "1.0",
  reportType: "monthly_maintenance_matrix",
  period: { month: "2026-05", label: "Mai 2026" },
  client: { name: "Client Demo" },
  site: { url: "https://example.com" },
  maintenanceDates: ["2026-05-06", "2026-05-20"],
  sections: [
    {
      title: "Plugins",
      rows: [
        {
          label: "SEO Toolkit",
          targetType: "plugin",
          targetSlug: "seo-toolkit",
          checks: { updated: true, tested: true },
          metadata: { change: "changed" },
        },
        {
          label: "Forms Pro",
          targetType: "wordpress_plugin",
          targetSlug: "forms-pro",
          checks: { updated: false, added: true },
          metadata: { status: "added" },
        },
      ],
    },
  ],
  alerts: [
    {
      type: "update_available",
      level: "warning",
      message: "Une mise a jour reste disponible.",
      plugin: { slug: "forms-pro", name: "Forms Pro" },
    },
  ],
  notes: ["Controle mensuel importe."],
};

describe("WpurReportPayloadSchema", () => {
  it("validates the WPUR payload shape", () => {
    const parsed = WpurReportPayloadSchema.parse(payload);

    expect(parsed.reportType).toBe("monthly_maintenance_matrix");
    expect(parsed.sections[0].rows).toHaveLength(2);
  });
});

describe("summarizeWpurPayload", () => {
  it("builds the cockpit summary without generating a WPUR report", () => {
    const summary = summarizeWpurPayload(WpurReportPayloadSchema.parse(payload));

    expect(summary.periodMonth).toBe("2026-05");
    expect(summary.pluginCount).toBe(2);
    expect(summary.updateCheckCount).toBe(1);
    expect(summary.pluginsAdded).toBe(1);
    expect(summary.pluginsChanged).toBe(1);
    expect(summary.alertsByLevel.warning).toBe(1);
  });
});

