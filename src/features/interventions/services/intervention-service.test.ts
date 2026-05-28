import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addInterventionItem,
  createIntervention,
  updateInterventionStatus,
} from "./intervention-service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    intervention: {
      create: vi.fn(),
      update: vi.fn(),
    },
    interventionItem: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("intervention service", () => {
  beforeEach(() => {
    prismaMock.intervention.create.mockReset();
    prismaMock.intervention.update.mockReset();
    prismaMock.interventionItem.create.mockReset();
  });

  it("creates a global WPUR maintenance intervention without plugin details", async () => {
    prismaMock.intervention.create.mockResolvedValue({ id: "intervention_1" });

    await createIntervention({
      siteId: "site_1",
      title: "Maintenance plugins via WPUR",
      type: "wpur_plugin_maintenance",
      status: "planned",
      date: "2026-05-28",
    });

    expect(prismaMock.intervention.create).toHaveBeenCalledWith({
      data: {
        siteId: "site_1",
        title: "Maintenance plugins via WPUR",
        type: "wpur_plugin_maintenance",
        status: "planned",
        date: new Date("2026-05-28"),
      },
    });
  });

  it("updates only the intervention status when requested", async () => {
    prismaMock.intervention.update.mockResolvedValue({
      id: "intervention_1",
      status: "done",
    });

    await updateInterventionStatus("intervention_1", "done");

    expect(prismaMock.intervention.update).toHaveBeenCalledWith({
      where: { id: "intervention_1" },
      data: {
        status: "done",
      },
    });
  });

  it("rejects plugin-specific item fields", async () => {
    await expect(
      addInterventionItem("intervention_1", {
        label: "Action globale",
        status: "planned",
        pluginSlug: "example-plugin",
      } as never),
    ).rejects.toThrow();

    expect(prismaMock.interventionItem.create).not.toHaveBeenCalled();
  });
});
