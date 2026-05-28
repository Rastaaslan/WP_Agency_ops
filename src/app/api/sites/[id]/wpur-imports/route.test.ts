import { wpurPayloadSchema } from "@/features/wpur/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { wpurImportServiceMock } = vi.hoisted(() => ({
  wpurImportServiceMock: {
    importWpurPayload: vi.fn(),
    listWpurImportsBySite: vi.fn(),
  },
}));

vi.mock(
  "@/features/wpur/services/wpur-import-service",
  () => wpurImportServiceMock,
);

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
      summary: "Import WPUR minimal.",
    },
  ],
  alerts: [],
  notes: ["Donnee importee depuis WPUR."],
};

describe("POST /api/sites/[id]/wpur-imports", () => {
  beforeEach(() => {
    wpurImportServiceMock.importWpurPayload.mockReset();
    wpurImportServiceMock.listWpurImportsBySite.mockReset();
  });

  it("imports a WPUR payload through the WPUR import service", async () => {
    const summary = {
      periodMonth: "2026-05",
      maintenanceDateCount: 1,
      sectionCount: 1,
      totalLineCount: 3,
      alertCount: 0,
    };

    wpurImportServiceMock.importWpurPayload.mockResolvedValue({
      id: "wpur_import_1",
      siteId: "site_1",
      summaryJson: summary,
    });

    const response = await POST(
      new Request("http://localhost/api/sites/site_1/wpur-imports", {
        method: "POST",
        body: JSON.stringify({
          payload: minimalWpurPayload,
        }),
      }),
      {
        params: Promise.resolve({ id: "site_1" }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      data: {
        import: {
          id: "wpur_import_1",
          siteId: "site_1",
          summaryJson: summary,
        },
        summary,
      },
    });
    expect(wpurImportServiceMock.importWpurPayload).toHaveBeenCalledWith(
      "site_1",
      minimalWpurPayload,
    );
  });

  it("rejects an invalid WPUR payload without running extra logic", async () => {
    wpurImportServiceMock.importWpurPayload.mockRejectedValue(
      getValidationError(() => wpurPayloadSchema.parse({})),
    );

    const response = await POST(
      new Request("http://localhost/api/sites/site_1/wpur-imports", {
        method: "POST",
        body: JSON.stringify({ payload: {} }),
      }),
      {
        params: Promise.resolve({ id: "site_1" }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatchObject({
      message: "Validation failed.",
      code: "validation_error",
    });
  });
});

function getValidationError(action: () => void) {
  try {
    action();
  } catch (error) {
    return error;
  }

  throw new Error("Expected validation to fail.");
}
