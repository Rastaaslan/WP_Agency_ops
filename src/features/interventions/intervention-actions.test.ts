import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInitialInterventionFormState,
  createInitialInterventionItemFormState,
  createInitialInterventionStatusFormState,
} from "@/features/interventions/intervention-form-state";
import {
  addInterventionItemAction,
  createInterventionAction,
  updateInterventionAction,
  updateInterventionItemAction,
  updateInterventionStatusAction,
} from "@/features/interventions/intervention-actions";

const { interventionServiceMock, nextCacheMock, nextNavigationMock } =
  vi.hoisted(() => ({
    interventionServiceMock: {
      addInterventionItem: vi.fn(),
      createIntervention: vi.fn(),
      getInterventionById: vi.fn(),
      updateIntervention: vi.fn(),
      updateInterventionItem: vi.fn(),
      updateInterventionStatus: vi.fn(),
    },
    nextCacheMock: {
      revalidatePath: vi.fn(),
    },
    nextNavigationMock: {
      redirect: vi.fn((path: string) => {
        throw new Error(`NEXT_REDIRECT:${path}`);
      }),
    },
  }));

vi.mock("@/features/interventions/services/intervention-service", () =>
  interventionServiceMock,
);

vi.mock("next/cache", () => ({
  revalidatePath: nextCacheMock.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: nextNavigationMock.redirect,
}));

describe("intervention actions", () => {
  beforeEach(() => {
    interventionServiceMock.addInterventionItem.mockReset();
    interventionServiceMock.createIntervention.mockReset();
    interventionServiceMock.getInterventionById.mockReset();
    interventionServiceMock.updateIntervention.mockReset();
    interventionServiceMock.updateInterventionItem.mockReset();
    interventionServiceMock.updateInterventionStatus.mockReset();
    nextCacheMock.revalidatePath.mockReset();
    nextNavigationMock.redirect.mockClear();
  });

  it("returns validation errors when intervention creation input is invalid", async () => {
    const result = await createInterventionAction(
      createInitialInterventionFormState(),
      new FormData(),
    );

    expect(interventionServiceMock.createIntervention).not.toHaveBeenCalled();
    expect(result.fieldErrors.siteId).toEqual(["Le site est obligatoire."]);
  });

  it("creates an intervention and redirects to its detail page", async () => {
    interventionServiceMock.createIntervention.mockResolvedValue({
      id: "intervention_1",
    });

    await expect(
      createInterventionAction(
        createInitialInterventionFormState(),
        createInterventionFormData({
          siteId: "site_1",
          title: "Maintenance globale",
          type: "general_maintenance",
          date: "2026-05-28T09:30",
        }),
      ),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/interventions/intervention_1?notice=intervention-created",
    );

    expect(interventionServiceMock.createIntervention).toHaveBeenCalledWith({
      siteId: "site_1",
      title: "Maintenance globale",
      type: "general_maintenance",
      status: "planned",
      date: new Date("2026-05-28T09:30"),
      internalNotes: undefined,
      clientSummary: undefined,
    });
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/interventions",
    );
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites/site_1");
  });

  it("updates an intervention and revalidates old and new site pages", async () => {
    interventionServiceMock.getInterventionById.mockResolvedValue({
      siteId: "site_old",
    });
    interventionServiceMock.updateIntervention.mockResolvedValue({
      id: "intervention_1",
    });

    await expect(
      updateInterventionAction(
        "intervention_1",
        createInitialInterventionFormState(),
        createInterventionFormData({
          siteId: "site_new",
          title: "Maintenance modifiée",
          type: "security",
          date: "2026-05-28T10:00",
        }),
      ),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/interventions/intervention_1?notice=intervention-updated",
    );

    expect(interventionServiceMock.updateIntervention).toHaveBeenCalledWith(
      "intervention_1",
      {
        siteId: "site_new",
        title: "Maintenance modifiée",
        type: "security",
        date: new Date("2026-05-28T10:00"),
        internalNotes: undefined,
        clientSummary: undefined,
      },
    );
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/sites/site_old",
    );
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/sites/site_new",
    );
  });

  it("updates only the intervention status", async () => {
    interventionServiceMock.getInterventionById.mockResolvedValue({
      siteId: "site_1",
    });
    interventionServiceMock.updateInterventionStatus.mockResolvedValue({
      id: "intervention_1",
      status: "cancelled",
    });

    const formData = new FormData();
    formData.set("status", "cancelled");

    await expect(
      updateInterventionStatusAction(
        "intervention_1",
        createInitialInterventionStatusFormState(),
        formData,
      ),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/interventions/intervention_1?notice=intervention-cancelled",
    );

    expect(interventionServiceMock.updateInterventionStatus).toHaveBeenCalledWith(
      "intervention_1",
      "cancelled",
    );
  });

  it("adds a generic intervention item", async () => {
    interventionServiceMock.getInterventionById.mockResolvedValue({
      siteId: "site_1",
    });
    interventionServiceMock.addInterventionItem.mockResolvedValue({
      id: "item_1",
    });

    const formData = new FormData();
    formData.set("label", "Vérifier le formulaire de contact");
    formData.set("status", "planned");

    await expect(
      addInterventionItemAction(
        "intervention_1",
        createInitialInterventionItemFormState(),
        formData,
      ),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/interventions/intervention_1?notice=intervention-item-added",
    );

    expect(interventionServiceMock.addInterventionItem).toHaveBeenCalledWith(
      "intervention_1",
      {
        label: "Vérifier le formulaire de contact",
        status: "planned",
        notes: undefined,
      },
    );
  });

  it("rejects a detailed plugin item before calling the service", async () => {
    const formData = new FormData();
    formData.set("label", "Mettre à jour Elementor de 3.21.0 à 3.22.1");
    formData.set("status", "planned");

    const result = await addInterventionItemAction(
      "intervention_1",
      createInitialInterventionItemFormState(),
      formData,
    );

    expect(interventionServiceMock.addInterventionItem).not.toHaveBeenCalled();
    expect(result.fieldErrors.label).toEqual([
      "L'item doit rester global. Le détail plugin par plugin appartient à WPUR.",
    ]);
  });

  it("updates an intervention item", async () => {
    interventionServiceMock.getInterventionById.mockResolvedValue({
      siteId: "site_1",
    });
    interventionServiceMock.updateInterventionItem.mockResolvedValue({
      id: "item_1",
    });

    const formData = new FormData();
    formData.set("label", "Contrôler le certificat HTTPS");
    formData.set("status", "done");
    formData.set("notes", "OK");

    await expect(
      updateInterventionItemAction(
        "item_1",
        "intervention_1",
        createInitialInterventionItemFormState(),
        formData,
      ),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/interventions/intervention_1?notice=intervention-item-updated",
    );

    expect(interventionServiceMock.updateInterventionItem).toHaveBeenCalledWith(
      "item_1",
      {
        label: "Contrôler le certificat HTTPS",
        status: "done",
        notes: "OK",
      },
    );
  });
});

function createInterventionFormData(values: {
  date: string;
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
