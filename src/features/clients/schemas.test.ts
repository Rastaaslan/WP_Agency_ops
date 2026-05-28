import { describe, expect, it } from "vitest";
import { clientFormSchema } from "./schemas";

describe("clientFormSchema", () => {
  it("accepts a minimal client", () => {
    const result = clientFormSchema.parse({ name: "Client Demo", email: "" });

    expect(result.name).toBe("Client Demo");
    expect(result.email).toBeUndefined();
  });

  it("rejects invalid email", () => {
    expect(() =>
      clientFormSchema.parse({ name: "Client Demo", email: "not-an-email" }),
    ).toThrow();
  });
});
