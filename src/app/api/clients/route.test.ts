import { createClientSchema } from "@/features/clients/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { clientServiceMock } = vi.hoisted(() => ({
  clientServiceMock: {
    createClient: vi.fn(),
    listClients: vi.fn(),
  },
}));

vi.mock("@/features/clients/services/client-service", () => clientServiceMock);

describe("POST /api/clients", () => {
  beforeEach(() => {
    clientServiceMock.createClient.mockReset();
    clientServiceMock.listClients.mockReset();
  });

  it("creates a client through the client service", async () => {
    clientServiceMock.createClient.mockResolvedValue({
      id: "client_1",
      name: "Client Demo",
      status: "active",
    });

    const response = await POST(
      new Request("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name: "Client Demo",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      data: {
        id: "client_1",
        name: "Client Demo",
        status: "active",
      },
    });
    expect(clientServiceMock.createClient).toHaveBeenCalledWith({
      name: "Client Demo",
    });
  });

  it("returns a readable validation error", async () => {
    clientServiceMock.createClient.mockRejectedValue(
      getValidationError(() => createClientSchema.parse({})),
    );

    const response = await POST(
      new Request("http://localhost/api/clients", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatchObject({
      message: "Validation failed.",
      code: "validation_error",
    });
    expect(body.error.details.issues[0].path).toEqual(["name"]);
  });
});

function getValidationError(action: () => void) {
  try {
    action();
  } catch (error) {
    return error;
  }

  throw new Error("Expected validation to fail.");
}
