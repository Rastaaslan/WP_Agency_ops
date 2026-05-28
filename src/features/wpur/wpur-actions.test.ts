import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialWpurImportFormState } from "@/features/wpur/wpur-form-state";
import { importWpurPayloadAction } from "@/features/wpur/wpur-actions";

const minimalWpurPayload = {
  schemaVersion: "1.0",
  reportType: "monthly-plugin-maintenance",
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
  maintenanceDates: ["2026-05-10"],
  sections: [
    {
      title: "Maintenance extensions",
      summary: "Maintenance documentée dans WPUR.",
    },
  ],
  alerts: [
    {
      level: "warning",
      message: "Une alerte à vérifier dans WPUR.",
    },
  ],
  notes: ["Rapport détaillé conservé dans WPUR."],
};

const { nextCacheMock, nextNavigationMock, siteServiceMock, wpurServiceMock } =
  vi.hoisted(() => ({
    nextCacheMock: {
      revalidatePath: vi.fn(),
    },
    nextNavigationMock: {
      redirect: vi.fn((path: string) => {
        throw new Error(`NEXT_REDIRECT:${path}`);
      }),
    },
    siteServiceMock: {
      getSiteById: vi.fn(),
    },
    wpurServiceMock: {
      importWpurPayload: vi.fn(),
    },
  }));

vi.mock("@/features/sites/services/site-service", () => siteServiceMock);

vi.mock("@/features/wpur/services/wpur-import-service", () => wpurServiceMock);

vi.mock("next/cache", () => ({
  revalidatePath: nextCacheMock.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: nextNavigationMock.redirect,
}));

describe("wpur actions", () => {
  beforeEach(() => {
    siteServiceMock.getSiteById.mockReset();
    wpurServiceMock.importWpurPayload.mockReset();
    nextCacheMock.revalidatePath.mockReset();
    nextNavigationMock.redirect.mockClear();
  });

  it("returns a readable error when the pasted JSON is invalid", async () => {
    const result = await importWpurPayloadAction(
      "site_1",
      createInitialWpurImportFormState(),
      createWpurImportFormData("{bad json"),
    );

    expect(siteServiceMock.getSiteById).not.toHaveBeenCalled();
    expect(wpurServiceMock.importWpurPayload).not.toHaveBeenCalled();
    expect(result.fieldErrors.payloadJson).toEqual(["Le JSON est invalide."]);
  });

  it("returns a readable error when the WPUR payload is invalid", async () => {
    const invalidPayload = {
      ...minimalWpurPayload,
      site: {
        name: "Site Demo",
        url: "not-a-url",
      },
    };

    const result = await importWpurPayloadAction(
      "site_1",
      createInitialWpurImportFormState(),
      createWpurImportFormData(JSON.stringify(invalidPayload)),
    );

    expect(siteServiceMock.getSiteById).not.toHaveBeenCalled();
    expect(wpurServiceMock.importWpurPayload).not.toHaveBeenCalled();
    expect(result.fieldErrors.payloadJson).toEqual([
      "L'export WPUR ne respecte pas le schéma attendu.",
    ]);
  });

  it("returns a readable error when the site is missing", async () => {
    siteServiceMock.getSiteById.mockResolvedValue(null);

    const result = await importWpurPayloadAction(
      "missing_site",
      createInitialWpurImportFormState(),
      createWpurImportFormData(JSON.stringify(minimalWpurPayload)),
    );

    expect(wpurServiceMock.importWpurPayload).not.toHaveBeenCalled();
    expect(result.formError).toBe(
      "Site introuvable. Choisissez un site existant puis réessayez.",
    );
  });

  it("imports a valid WPUR payload and redirects to the site page", async () => {
    siteServiceMock.getSiteById.mockResolvedValue({
      id: "site_1",
      name: "Site Demo",
    });
    wpurServiceMock.importWpurPayload.mockResolvedValue({
      id: "wpur_import_1",
    });

    await expect(
      importWpurPayloadAction(
        "site_1",
        createInitialWpurImportFormState(),
        createWpurImportFormData(JSON.stringify(minimalWpurPayload)),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/sites/site_1");

    expect(wpurServiceMock.importWpurPayload).toHaveBeenCalledWith(
      "site_1",
      minimalWpurPayload,
    );
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites/site_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/api/sites/site_1/technical-export",
    );
  });
});

function createWpurImportFormData(payloadJson: string) {
  const formData = new FormData();
  formData.set("payloadJson", payloadJson);

  return formData;
}
