import { describe, expect, it } from "vitest";
import {
  parseCreateSiteForm,
  parseUpdateSiteForm,
  siteFormValuesFromFormData,
  siteValuesFromRecord,
} from "@/features/sites/site-form-state";

describe("site form state", () => {
  it("maps form data to trimmed site form values", () => {
    const formData = new FormData();
    formData.set("clientId", " client_1 ");
    formData.set("name", "  Site Demo  ");
    formData.set("url", " https://example.com ");
    formData.set("environment", " staging ");

    expect(siteFormValuesFromFormData(formData)).toMatchObject({
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
      environment: "staging",
    });
  });

  it("validates required site fields", () => {
    const parsedForm = parseCreateSiteForm(new FormData());

    expect(parsedForm.success).toBe(false);

    if (!parsedForm.success) {
      expect(parsedForm.state.fieldErrors.clientId).toEqual([
        "Le client est obligatoire.",
      ]);
      expect(parsedForm.state.fieldErrors.name).toEqual([
        "Le nom du site est obligatoire.",
      ]);
      expect(parsedForm.state.fieldErrors.url).toEqual([
        "L'URL est obligatoire.",
      ]);
    }
  });

  it("normalizes empty optional values before validation", () => {
    const formData = createSiteFormData({
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
      environment: "production",
      notes: "",
    });

    const parsedForm = parseCreateSiteForm(formData);

    expect(parsedForm.success).toBe(true);

    if (parsedForm.success) {
      expect(parsedForm.input).toEqual({
        clientId: "client_1",
        name: "Site Demo",
        url: "https://example.com",
        environment: "production",
        notes: undefined,
        status: "active",
      });
    }
  });

  it("does not inject a status when parsing an update", () => {
    const formData = createSiteFormData({
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
      environment: "development",
    });

    const parsedForm = parseUpdateSiteForm(formData);

    expect(parsedForm.success).toBe(true);

    if (parsedForm.success) {
      expect(parsedForm.input).toEqual({
        clientId: "client_1",
        name: "Site Demo",
        url: "https://example.com",
        environment: "development",
        notes: undefined,
      });
    }
  });

  it("maps a site record to editable form values", () => {
    expect(
      siteValuesFromRecord({
        clientId: "client_1",
        name: "Site Demo",
        url: "https://example.com",
        environment: "staging",
        notes: null,
      }),
    ).toEqual({
      clientId: "client_1",
      name: "Site Demo",
      url: "https://example.com",
      environment: "staging",
      notes: "",
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
