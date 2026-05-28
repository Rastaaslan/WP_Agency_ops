import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { siteTechnicalExportServiceMock } = vi.hoisted(() => ({
  siteTechnicalExportServiceMock: {
    exportSiteTechnicalState: vi.fn(),
  },
}));

vi.mock(
  "@/features/site-exports/services/site-technical-export-service",
  () => siteTechnicalExportServiceMock,
);

describe("GET /api/sites/[id]/technical-export", () => {
  beforeEach(() => {
    siteTechnicalExportServiceMock.exportSiteTechnicalState.mockReset();
  });

  it("returns the global technical export with WPUR separated", async () => {
    siteTechnicalExportServiceMock.exportSiteTechnicalState.mockResolvedValue({
      client: {
        id: "client_1",
      },
      site: {
        id: "site_1",
      },
      interventions: [],
      wpur: {
        import: {
          id: "wpur_import_1",
        },
        summary: {
          periodMonth: "2026-05",
        },
      },
      security: [],
      performance: [],
      forms: [],
      backups: [],
    });

    const response = await GET(
      new Request("http://localhost/api/sites/site_1/technical-export"),
      {
        params: Promise.resolve({ id: "site_1" }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      site: {
        id: "site_1",
      },
      wpur: {
        import: {
          id: "wpur_import_1",
        },
      },
    });
    expect(siteTechnicalExportServiceMock.exportSiteTechnicalState).toHaveBeenCalledWith(
      "site_1",
    );
  });
});
