import { describe, expect, it } from "vitest";
import {
  parseCreateWatchedForm,
  parseUpdateWatchedForm,
  watchedFormValuesFromRecord,
} from "@/features/forms/form-watch-form-state";

describe("watched form state", () => {
  it("returns validation errors when required watched form fields are missing", () => {
    const result = parseCreateWatchedForm("site_1", new FormData());

    expect(result).toEqual({
      success: false,
      state: {
        values: {
          name: "",
          pageUrl: "",
          expectedRecipients: "",
          status: "not_tested",
          lastCheckedAt: "",
          notes: "",
        },
        fieldErrors: {
          name: ["Le nom du formulaire est obligatoire."],
          pageUrl: ["L'URL de page est obligatoire."],
        },
      },
    });
  });

  it("parses a valid watched form creation form", () => {
    const formData = createWatchedFormData({
      name: "Contact principal",
      pageUrl: "https://example.com/contact",
      expectedRecipients: "contact@example.com",
      status: "ok",
      lastCheckedAt: "2026-05-28T10:30",
      notes: "Verification manuelle OK.",
    });

    const result = parseCreateWatchedForm("site_1", formData);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.input).toEqual({
        siteId: "site_1",
        name: "Contact principal",
        pageUrl: "https://example.com/contact",
        expectedRecipients: "contact@example.com",
        status: "ok",
        lastCheckedAt: new Date("2026-05-28T10:30"),
        notes: "Verification manuelle OK.",
      });
    }
  });

  it("parses an update form with optional date cleared", () => {
    const formData = createWatchedFormData({
      name: "Contact principal",
      pageUrl: "https://example.com/contact",
      status: "not_tested",
      lastCheckedAt: "",
    });

    const result = parseUpdateWatchedForm(formData);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.input).toMatchObject({
        name: "Contact principal",
        pageUrl: "https://example.com/contact",
        status: "not_tested",
        lastCheckedAt: null,
      });
    }
  });

  it("maps a watched form record to form values", () => {
    expect(
      watchedFormValuesFromRecord({
        name: "Contact principal",
        pageUrl: "https://example.com/contact",
        expectedRecipients: null,
        status: "issue",
        lastCheckedAt: new Date("2026-05-28T10:30:00"),
        notes: "Erreur documentee.",
      }),
    ).toEqual({
      name: "Contact principal",
      pageUrl: "https://example.com/contact",
      expectedRecipients: "",
      status: "issue",
      lastCheckedAt: "2026-05-28T10:30",
      notes: "Erreur documentee.",
    });
  });
});

function createWatchedFormData(values: Partial<Record<string, string>>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}
