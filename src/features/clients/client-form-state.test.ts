import { describe, expect, it } from "vitest";
import {
  clientFormValuesFromFormData,
  clientValuesFromRecord,
  parseCreateClientForm,
} from "@/features/clients/client-form-state";

describe("client form state", () => {
  it("maps form data to trimmed client form values", () => {
    const formData = new FormData();
    formData.set("name", "  Client Demo  ");
    formData.set("companyName", "  Agence Demo  ");
    formData.set("email", " contact@example.com ");

    expect(clientFormValuesFromFormData(formData)).toMatchObject({
      name: "Client Demo",
      companyName: "Agence Demo",
      email: "contact@example.com",
    });
  });

  it("validates required client fields", () => {
    const parsedForm = parseCreateClientForm(new FormData());

    expect(parsedForm.success).toBe(false);

    if (!parsedForm.success) {
      expect(parsedForm.state.fieldErrors.name).toEqual([
        "Le nom est obligatoire.",
      ]);
    }
  });

  it("normalizes empty optional values before validation", () => {
    const formData = new FormData();
    formData.set("name", "Client Demo");
    formData.set("email", "");
    formData.set("phone", "");

    const parsedForm = parseCreateClientForm(formData);

    expect(parsedForm.success).toBe(true);

    if (parsedForm.success) {
      expect(parsedForm.input).toEqual({
        name: "Client Demo",
        companyName: undefined,
        email: undefined,
        phone: undefined,
        notes: undefined,
        status: "active",
      });
    }
  });

  it("maps a client record to editable form values", () => {
    expect(
      clientValuesFromRecord({
        name: "Client Demo",
        companyName: null,
        email: "contact@example.com",
        phone: null,
        notes: "Note",
      }),
    ).toEqual({
      name: "Client Demo",
      companyName: "",
      email: "contact@example.com",
      phone: "",
      notes: "Note",
    });
  });
});
