import { describe, expect, it } from "vitest";
import { assertSafeHttpUrl, normalizeUrl } from "./urls";

describe("url helpers", () => {
  it("normalizes URLs without a protocol", () => {
    expect(normalizeUrl("example.com/")).toBe("https://example.com");
  });

  it("blocks private targets by default", () => {
    expect(() => assertSafeHttpUrl("http://127.0.0.1:3000")).toThrow(
      /adresse privee/,
    );
  });
});
