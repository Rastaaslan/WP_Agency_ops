import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialWatchedFormState } from "@/features/forms/form-watch-form-state";
import {
  createWatchedFormAction,
  updateWatchedFormAction,
} from "@/features/forms/form-watch-actions";

const { formWatchServiceMock, nextCacheMock, nextNavigationMock } = vi.hoisted(
  () => ({
    formWatchServiceMock: {
      createForm: vi.fn(),
      updateForm: vi.fn(),
    },
    nextCacheMock: {
      revalidatePath: vi.fn(),
    },
    nextNavigationMock: {
      redirect: vi.fn((path: string) => {
        throw new Error(`NEXT_REDIRECT:${path}`);
      }),
    },
  }),
);

vi.mock("@/features/forms/services/form-watch-service", () => formWatchServiceMock);

vi.mock("next/cache", () => ({
  revalidatePath: nextCacheMock.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: nextNavigationMock.redirect,
}));

describe("watched form actions", () => {
  beforeEach(() => {
    formWatchServiceMock.createForm.mockReset();
    formWatchServiceMock.updateForm.mockReset();
    nextCacheMock.revalidatePath.mockReset();
    nextNavigationMock.redirect.mockClear();
  });

  it("returns validation errors without calling the service", async () => {
    const result = await createWatchedFormAction(
      "site_1",
      createInitialWatchedFormState(),
      new FormData(),
    );

    expect(formWatchServiceMock.createForm).not.toHaveBeenCalled();
    expect(result.fieldErrors.name).toEqual([
      "Le nom du formulaire est obligatoire.",
    ]);
    expect(result.fieldErrors.pageUrl).toEqual([
      "L'URL de page est obligatoire.",
    ]);
  });

  it("creates a watched form and redirects to the site page", async () => {
    formWatchServiceMock.createForm.mockResolvedValue({ id: "form_1" });

    await expect(
      createWatchedFormAction(
        "site_1",
        createInitialWatchedFormState(),
        createWatchedFormData({
          name: "Contact principal",
          pageUrl: "https://example.com/contact",
          expectedRecipients: "contact@example.com",
          status: "ok",
          lastCheckedAt: "2026-05-28T10:30",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/sites/site_1?notice=watched-form-saved");

    expect(formWatchServiceMock.createForm).toHaveBeenCalledWith({
      siteId: "site_1",
      name: "Contact principal",
      pageUrl: "https://example.com/contact",
      expectedRecipients: "contact@example.com",
      status: "ok",
      lastCheckedAt: new Date("2026-05-28T10:30"),
      notes: undefined,
    });
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites/site_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/api/sites/site_1/technical-export",
    );
  });

  it("updates a watched form and redirects to the site page", async () => {
    formWatchServiceMock.updateForm.mockResolvedValue({ id: "form_1" });

    await expect(
      updateWatchedFormAction(
        "form_1",
        "site_1",
        createInitialWatchedFormState(),
        createWatchedFormData({
          name: "Contact principal",
          pageUrl: "https://example.com/contact",
          status: "issue",
          lastCheckedAt: "",
          notes: "Erreur documentee.",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/sites/site_1?notice=watched-form-saved");

    expect(formWatchServiceMock.updateForm).toHaveBeenCalledWith("form_1", {
      name: "Contact principal",
      pageUrl: "https://example.com/contact",
      expectedRecipients: undefined,
      status: "issue",
      lastCheckedAt: null,
      notes: "Erreur documentee.",
    });
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/forms/form_1/edit",
    );
  });

  it("returns a readable error when the site is missing", async () => {
    formWatchServiceMock.createForm.mockRejectedValue({
      code: "P2003",
    });

    const result = await createWatchedFormAction(
      "site_missing",
      createInitialWatchedFormState(),
      createWatchedFormData({
        name: "Contact principal",
        pageUrl: "https://example.com/contact",
        status: "not_tested",
      }),
    );

    expect(result.formError).toBe(
      "Site introuvable. Choisissez un site existant puis réessayez.",
    );
  });
});

function createWatchedFormData(values: Partial<Record<string, string>>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}
