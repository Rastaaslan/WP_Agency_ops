import { describe, expect, it } from "vitest";
import {
  interventionFormValuesFromFormData,
  interventionItemFormValuesFromFormData,
  interventionValuesFromRecord,
  looksLikeDetailedPluginItem,
  parseAddInterventionItemForm,
  parseCreateInterventionForm,
  parseUpdateInterventionForm,
} from "@/features/interventions/intervention-form-state";

describe("intervention form state", () => {
  it("maps form data to trimmed intervention values", () => {
    const formData = new FormData();
    formData.set("siteId", " site_1 ");
    formData.set("title", "  Maintenance globale  ");
    formData.set("type", " security ");
    formData.set("date", "2026-05-28T09:30");

    expect(interventionFormValuesFromFormData(formData)).toMatchObject({
      siteId: "site_1",
      title: "Maintenance globale",
      type: "security",
      date: "2026-05-28T09:30",
    });
  });

  it("validates required intervention fields", () => {
    const parsedForm = parseCreateInterventionForm(new FormData());

    expect(parsedForm.success).toBe(false);

    if (!parsedForm.success) {
      expect(parsedForm.state.fieldErrors.siteId).toEqual([
        "Le site est obligatoire.",
      ]);
      expect(parsedForm.state.fieldErrors.title).toEqual([
        "Le titre est obligatoire.",
      ]);
      expect(parsedForm.state.fieldErrors.date).toEqual([
        "La date est obligatoire.",
      ]);
    }
  });

  it("normalizes optional intervention fields before validation", () => {
    const formData = createInterventionFormData({
      siteId: "site_1",
      title: "Maintenance globale",
      type: "general_maintenance",
      date: "2026-05-28T09:30",
      internalNotes: "",
      clientSummary: "",
    });

    const parsedForm = parseCreateInterventionForm(formData);

    expect(parsedForm.success).toBe(true);

    if (parsedForm.success) {
      expect(parsedForm.input).toEqual({
        siteId: "site_1",
        title: "Maintenance globale",
        type: "general_maintenance",
        status: "planned",
        date: new Date("2026-05-28T09:30"),
        internalNotes: undefined,
        clientSummary: undefined,
      });
    }
  });

  it("does not inject status when parsing an update", () => {
    const formData = createInterventionFormData({
      siteId: "site_1",
      title: "Maintenance globale",
      type: "backup",
      date: "2026-05-28T09:30",
    });

    const parsedForm = parseUpdateInterventionForm(formData);

    expect(parsedForm.success).toBe(true);

    if (parsedForm.success) {
      expect(parsedForm.input).toEqual({
        siteId: "site_1",
        title: "Maintenance globale",
        type: "backup",
        date: new Date("2026-05-28T09:30"),
        internalNotes: undefined,
        clientSummary: undefined,
      });
    }
  });

  it("maps a record to editable intervention values", () => {
    expect(
      interventionValuesFromRecord({
        siteId: "site_1",
        title: "Maintenance globale",
        type: "security",
        date: new Date("2026-05-28T09:30:00.000"),
        internalNotes: null,
        clientSummary: "Résumé",
      }),
    ).toEqual({
      siteId: "site_1",
      title: "Maintenance globale",
      type: "security",
      date: "2026-05-28T09:30",
      internalNotes: "",
      clientSummary: "Résumé",
    });
  });

  it("maps item form values and rejects detailed plugin maintenance labels", () => {
    const formData = new FormData();
    formData.set("label", " Mettre à jour Yoast SEO ");
    formData.set("status", "planned");

    expect(interventionItemFormValuesFromFormData(formData)).toMatchObject({
      label: "Mettre à jour Yoast SEO",
      status: "planned",
    });
    expect(looksLikeDetailedPluginItem("Mettre à jour Yoast SEO")).toBe(true);

    const parsedForm = parseAddInterventionItemForm(formData);

    expect(parsedForm.success).toBe(false);

    if (!parsedForm.success) {
      expect(parsedForm.state.fieldErrors.label).toEqual([
        "L'item doit rester global. Le détail plugin par plugin appartient à WPUR.",
      ]);
    }
  });

  it("accepts a global WPUR follow-up item", () => {
    const formData = new FormData();
    formData.set("label", "Consulter le rapport WPUR pour les extensions");
    formData.set("status", "planned");

    const parsedForm = parseAddInterventionItemForm(formData);

    expect(parsedForm.success).toBe(true);

    if (parsedForm.success) {
      expect(parsedForm.input).toEqual({
        label: "Consulter le rapport WPUR pour les extensions",
        status: "planned",
        notes: undefined,
      });
    }
  });
});

function createInterventionFormData(values: {
  clientSummary?: string;
  date: string;
  internalNotes?: string;
  siteId: string;
  title: string;
  type: string;
}) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}
