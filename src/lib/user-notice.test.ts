import { describe, expect, it } from "vitest";
import { getUserNotice } from "@/lib/user-notice";

describe("user notice helper", () => {
  it("returns a clear success message for a known notice key", () => {
    expect(getUserNotice("client-created")).toEqual({
      title: "Client créé",
      message: "La fiche client est prête dans le cockpit.",
    });
  });

  it("reads the first query value when multiple notice values are present", () => {
    expect(getUserNotice(["site-archived", "site-updated"])).toEqual({
      title: "Site archivé",
      message: "Cette action ne supprime pas les données du site.",
    });
  });

  it("uses user-facing wording for technical follow-up notices", () => {
    expect(getUserNotice("intervention-created")).toEqual({
      title: "Suivi technique créé",
      message: "La fiche est enregistrée dans le suivi global du site.",
    });
  });

  it("ignores missing or unknown notice keys", () => {
    expect(getUserNotice(undefined)).toBeNull();
    expect(getUserNotice("unknown-notice")).toBeNull();
  });
});
