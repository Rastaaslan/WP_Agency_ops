import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  importWpurPayload,
  summarizeWpurPayload,
} from "./wpur-import-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    wpurImport: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

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
    name: "Site Demo",
    url: "https://example.com",
  },
  maintenanceDates: ["2026-05-28"],
  sections: [
    {
      title: "Synthese",
      summary: "Payload minimal importe depuis WPUR.",
    },
    {
      title: "Suivi",
      summary: "Aucun traitement plugin n'est execute ici.",
    },
  ],
  alerts: [
    {
      level: "info",
      message: "Import de demonstration.",
    },
  ],
  notes: ["WP Agency Ops stocke le payload sans le generer."],
} as const;

describe("WPUR import service", () => {
  beforeEach(() => {
    prismaMock.wpurImport.create.mockReset();
  });

  it("summarizes a minimal WPUR payload", () => {
    expect(summarizeWpurPayload(minimalWpurPayload)).toEqual({
      periodMonth: "2026-05",
      maintenanceDateCount: 1,
      sectionCount: 2,
      totalLineCount: 5,
      alertCount: 1,
    });
  });

  it("stores the raw payload and a light summary", async () => {
    prismaMock.wpurImport.create.mockResolvedValue({ id: "wpur_import_1" });

    await importWpurPayload("site_1", minimalWpurPayload);

    expect(prismaMock.wpurImport.create).toHaveBeenCalledWith({
      data: {
        siteId: "site_1",
        periodMonth: "2026-05",
        payloadJson: minimalWpurPayload,
        summaryJson: {
          periodMonth: "2026-05",
          maintenanceDateCount: 1,
          sectionCount: 2,
          totalLineCount: 5,
          alertCount: 1,
        },
      },
    });
  });
});
