import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInitialSiteFormState,
  emptySiteFormValues,
} from "@/features/sites/site-form-state";
import {
  archiveSiteAction,
  createSiteAction,
  updateSiteAction,
} from "@/features/sites/site-actions";

const { nextCacheMock, nextNavigationMock, siteServiceMock } = vi.hoisted(
  () => ({
    nextCacheMock: {
      revalidatePath: vi.fn(),
    },
    nextNavigationMock: {
      redirect: vi.fn((path: string) => {
        throw new Error(`NEXT_REDIRECT:${path}`);
      }),
    },
    siteServiceMock: {
      archiveSite: vi.fn(),
      createSite: vi.fn(),
      getSiteById: vi.fn(),
      updateSite: vi.fn(),
    },
  }),
);

vi.mock("@/features/sites/services/site-service", () => siteServiceMock);

vi.mock("next/cache", () => ({
  revalidatePath: nextCacheMock.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: nextNavigationMock.redirect,
}));

describe("site actions", () => {
  beforeEach(() => {
    siteServiceMock.archiveSite.mockReset();
    siteServiceMock.createSite.mockReset();
    siteServiceMock.getSiteById.mockReset();
    siteServiceMock.updateSite.mockReset();
    nextCacheMock.revalidatePath.mockReset();
    nextNavigationMock.redirect.mockClear();
  });

  it("returns validation errors when site creation input is invalid", async () => {
    const result = await createSiteAction(
      createInitialSiteFormState(),
      new FormData(),
    );

    expect(siteServiceMock.createSite).not.toHaveBeenCalled();
    expect(result.fieldErrors.clientId).toEqual([
      "Le client est obligatoire.",
    ]);
  });

  it("creates a site and redirects to its detail page", async () => {
    siteServiceMock.createSite.mockResolvedValue({ id: "site_1" });

    const formData = createSiteFormData({
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
      environment: "production",
    });

    await expect(
      createSiteAction(createInitialSiteFormState(), formData),
    ).rejects.toThrow("NEXT_REDIRECT:/sites/site_1");

    expect(siteServiceMock.createSite).toHaveBeenCalledWith({
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
      environment: "production",
      notes: undefined,
      status: "active",
    });
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/clients");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/clients/client_1",
    );
  });

  it("updates a site and redirects to its detail page", async () => {
    siteServiceMock.getSiteById.mockResolvedValue({ clientId: "client_old" });
    siteServiceMock.updateSite.mockResolvedValue({ id: "site_1" });

    const formData = createSiteFormData({
      clientId: "client_new",
      name: "Site Demo Updated",
      url: "https://updated.example.com",
      environment: "staging",
      notes: "Nouvelle note",
    });

    await expect(
      updateSiteAction("site_1", createInitialSiteFormState(), formData),
    ).rejects.toThrow("NEXT_REDIRECT:/sites/site_1");

    expect(siteServiceMock.updateSite).toHaveBeenCalledWith("site_1", {
      clientId: "client_new",
      name: "Site Demo Updated",
      url: "https://updated.example.com",
      environment: "staging",
      notes: "Nouvelle note",
    });
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites/site_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/clients/client_new",
    );
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/clients/client_old",
    );
  });

  it("archives a site without deleting it", async () => {
    siteServiceMock.getSiteById.mockResolvedValue({ clientId: "client_1" });
    siteServiceMock.archiveSite.mockResolvedValue({
      id: "site_1",
      status: "archived",
    });

    await expect(
      archiveSiteAction("site_1", createInitialSiteFormState(), new FormData()),
    ).rejects.toThrow("NEXT_REDIRECT:/sites/site_1");

    expect(siteServiceMock.archiveSite).toHaveBeenCalledWith("site_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites/site_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/clients/client_1",
    );
  });

  it("returns a readable error when the selected client is missing", async () => {
    siteServiceMock.createSite.mockRejectedValue({
      code: "P2003",
    });

    const result = await createSiteAction(
      createInitialSiteFormState(),
      createSiteFormData({
        clientId: "missing_client",
        name: "Site Demo",
        url: "https://example.com",
        environment: "production",
      }),
    );

    expect(result.formError).toBe(
      "Client introuvable. Choisissez un client existant puis réessayez.",
    );
  });

  it("returns a readable archive error when the site is missing", async () => {
    siteServiceMock.getSiteById.mockResolvedValue(null);
    siteServiceMock.archiveSite.mockRejectedValue({
      code: "P2025",
    });

    const result = await archiveSiteAction(
      "missing_site",
      createInitialSiteFormState(),
      new FormData(),
    );

    expect(result).toEqual({
      values: emptySiteFormValues,
      fieldErrors: {},
      formError: "Site introuvable ou déjà supprimé de la base.",
    });
  });
});

function createSiteFormData(values: {
  clientId: string;
  environment: string;
  name: string;
  notes?: string;
  url: string;
}) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}
