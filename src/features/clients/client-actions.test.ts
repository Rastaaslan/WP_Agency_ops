import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInitialClientFormState,
  emptyClientFormValues,
} from "@/features/clients/client-form-state";
import {
  archiveClientAction,
  createClientAction,
  updateClientAction,
} from "@/features/clients/client-actions";

const { clientServiceMock, nextCacheMock, nextNavigationMock } = vi.hoisted(
  () => ({
    clientServiceMock: {
      archiveClient: vi.fn(),
      createClient: vi.fn(),
      updateClient: vi.fn(),
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

vi.mock("@/features/clients/services/client-service", () => clientServiceMock);

vi.mock("next/cache", () => ({
  revalidatePath: nextCacheMock.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: nextNavigationMock.redirect,
}));

describe("client actions", () => {
  beforeEach(() => {
    clientServiceMock.archiveClient.mockReset();
    clientServiceMock.createClient.mockReset();
    clientServiceMock.updateClient.mockReset();
    nextCacheMock.revalidatePath.mockReset();
    nextNavigationMock.redirect.mockClear();
  });

  it("returns validation errors when client creation input is invalid", async () => {
    const result = await createClientAction(
      createInitialClientFormState(),
      new FormData(),
    );

    expect(clientServiceMock.createClient).not.toHaveBeenCalled();
    expect(result.fieldErrors.name).toEqual(["Le nom est obligatoire."]);
  });

  it("creates a client and redirects to its detail page", async () => {
    clientServiceMock.createClient.mockResolvedValue({ id: "client_1" });

    const formData = createClientFormData({
      name: "Client Demo",
      email: "contact@example.com",
    });

    await expect(
      createClientAction(createInitialClientFormState(), formData),
    ).rejects.toThrow("NEXT_REDIRECT:/clients/client_1?notice=client-created");

    expect(clientServiceMock.createClient).toHaveBeenCalledWith({
      name: "Client Demo",
      companyName: undefined,
      email: "contact@example.com",
      phone: undefined,
      notes: undefined,
      status: "active",
    });
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/clients");
  });

  it("updates a client and redirects to its detail page", async () => {
    clientServiceMock.updateClient.mockResolvedValue({ id: "client_1" });

    const formData = createClientFormData({
      name: "Client Demo Updated",
      notes: "Nouvelle note",
    });

    await expect(
      updateClientAction("client_1", createInitialClientFormState(), formData),
    ).rejects.toThrow("NEXT_REDIRECT:/clients/client_1?notice=client-updated");

    expect(clientServiceMock.updateClient).toHaveBeenCalledWith("client_1", {
      name: "Client Demo Updated",
      companyName: undefined,
      email: undefined,
      phone: undefined,
      notes: "Nouvelle note",
    });
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/clients");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/clients/client_1",
    );
  });

  it("archives a client without deleting it", async () => {
    clientServiceMock.archiveClient.mockResolvedValue({
      id: "client_1",
      status: "archived",
    });

    await expect(
      archiveClientAction(
        "client_1",
        createInitialClientFormState(),
        new FormData(),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/clients/client_1?notice=client-archived");

    expect(clientServiceMock.archiveClient).toHaveBeenCalledWith("client_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/clients");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/clients/client_1",
    );
  });

  it("returns a readable archive error when the client is missing", async () => {
    clientServiceMock.archiveClient.mockRejectedValue({
      code: "P2025",
    });

    const result = await archiveClientAction(
      "missing_client",
      createInitialClientFormState(),
      new FormData(),
    );

    expect(result).toEqual({
      values: emptyClientFormValues,
      fieldErrors: {},
      formError:
        "Client introuvable dans ce cockpit. Actualisez la page puis réessayez.",
    });
  });
});

function createClientFormData(values: {
  companyName?: string;
  email?: string;
  name: string;
  notes?: string;
  phone?: string;
}) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}
