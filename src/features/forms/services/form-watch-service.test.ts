import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createForm,
  updateForm,
  updateFormStatus,
} from "@/features/forms/services/form-watch-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    watchedForm: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("form watch service", () => {
  beforeEach(() => {
    prismaMock.watchedForm.create.mockReset();
    prismaMock.watchedForm.update.mockReset();
  });

  it("creates a manual watched form through the validated schema", async () => {
    prismaMock.watchedForm.create.mockResolvedValue({ id: "form_1" });

    await createForm({
      siteId: "site_1",
      name: "Contact principal",
      pageUrl: "https://example.com/contact",
      expectedRecipients: "contact@example.com",
      status: "ok",
      lastCheckedAt: "2026-05-28T10:30",
      notes: "Verification manuelle OK.",
    });

    expect(prismaMock.watchedForm.create).toHaveBeenCalledWith({
      data: {
        siteId: "site_1",
        name: "Contact principal",
        pageUrl: "https://example.com/contact",
        expectedRecipients: "contact@example.com",
        status: "ok",
        lastCheckedAt: new Date("2026-05-28T10:30"),
        notes: "Verification manuelle OK.",
      },
    });
  });

  it("updates watched form status without submitting the form", async () => {
    prismaMock.watchedForm.update.mockResolvedValue({
      id: "form_1",
      status: "issue",
    });

    await updateFormStatus("form_1", "issue");

    expect(prismaMock.watchedForm.update).toHaveBeenCalledWith({
      where: { id: "form_1" },
      data: {
        status: "issue",
      },
    });
  });

  it("rejects unexpected plugin-specific fields", async () => {
    await expect(
      updateForm("form_1", {
        status: "ok",
        pluginSlug: "example-plugin",
      } as never),
    ).rejects.toThrow();

    expect(prismaMock.watchedForm.update).not.toHaveBeenCalled();
  });
});
