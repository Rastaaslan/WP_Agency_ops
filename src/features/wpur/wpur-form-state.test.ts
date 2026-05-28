import { describe, expect, it } from "vitest";
import {
  parseWpurImportForm,
  wpurImportFormValuesFromFormData,
} from "@/features/wpur/wpur-form-state";

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

describe("wpur import form state", () => {
  it("keeps the raw JSON value from FormData", () => {
    const formData = createWpurImportFormData("{\n  \"schemaVersion\": \"1.0\"\n}");

    expect(wpurImportFormValuesFromFormData(formData)).toEqual({
      payloadJson: "{\n  \"schemaVersion\": \"1.0\"\n}",
    });
  });

  it("returns a field error when the payload JSON is empty", () => {
    const result = parseWpurImportForm(createWpurImportFormData(" "));

    expect(result).toEqual({
      success: false,
      state: {
        values: {
          payloadJson: " ",
        },
        fieldErrors: {
          payloadJson: ["Le JSON WPUR est obligatoire."],
        },
      },
    });
  });

  it("returns a field error when the JSON is invalid", () => {
    const result = parseWpurImportForm(createWpurImportFormData("{bad json"));

    expect(result).toEqual({
      success: false,
      state: {
        values: {
          payloadJson: "{bad json",
        },
        fieldErrors: {
          payloadJson: ["Le JSON est invalide."],
        },
      },
    });
  });

  it("returns a field error when the WPUR payload is invalid", () => {
    const invalidPayload = {
      ...minimalWpurPayload,
      period: {
        month: "2026/05",
      },
    };

    const result = parseWpurImportForm(
      createWpurImportFormData(JSON.stringify(invalidPayload)),
    );

    expect(result).toEqual({
      success: false,
      state: {
        values: {
          payloadJson: JSON.stringify(invalidPayload),
        },
        fieldErrors: {
          payloadJson: [
            "Le payload WPUR ne respecte pas le schéma attendu.",
          ],
        },
      },
    });
  });

  it("returns the parsed payload when the WPUR payload is valid", () => {
    const result = parseWpurImportForm(
      createWpurImportFormData(JSON.stringify(minimalWpurPayload)),
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.payload).toEqual(minimalWpurPayload);
      expect(result.values.payloadJson).toBe(JSON.stringify(minimalWpurPayload));
    }
  });
});

function createWpurImportFormData(payloadJson: string) {
  const formData = new FormData();
  formData.set("payloadJson", payloadJson);

  return formData;
}
