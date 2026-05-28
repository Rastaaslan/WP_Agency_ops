import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialSecurityCheckFormState } from "@/features/security/security-form-state";
import {
  runSecurityCheckAction,
} from "@/features/security/security-actions";

const { nextCacheMock, nextNavigationMock, securityServiceMock } = vi.hoisted(
  () => ({
    nextCacheMock: {
      revalidatePath: vi.fn(),
    },
    nextNavigationMock: {
      redirect: vi.fn((path: string) => {
        throw new Error(`NEXT_REDIRECT:${path}`);
      }),
    },
    securityServiceMock: {
      runSecurityCheck: vi.fn(),
    },
  }),
);

vi.mock("@/features/security/services/security-check-service", () => securityServiceMock);

vi.mock("next/cache", () => ({
  revalidatePath: nextCacheMock.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: nextNavigationMock.redirect,
}));

describe("security actions", () => {
  beforeEach(() => {
    nextCacheMock.revalidatePath.mockReset();
    nextNavigationMock.redirect.mockClear();
    securityServiceMock.runSecurityCheck.mockReset();
  });

  it("runs a security check and redirects to the site page", async () => {
    securityServiceMock.runSecurityCheck.mockResolvedValue({
      id: "security_1",
      siteId: "site_1",
    });

    await expect(
      runSecurityCheckAction(
        "site_1",
        createInitialSecurityCheckFormState(),
        new FormData(),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/sites/site_1");

    expect(securityServiceMock.runSecurityCheck).toHaveBeenCalledWith("site_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites/site_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/api/sites/site_1/technical-export",
    );
  });

  it("returns a readable error when the site is missing", async () => {
    securityServiceMock.runSecurityCheck.mockResolvedValue(null);

    const result = await runSecurityCheckAction(
      "missing_site",
      createInitialSecurityCheckFormState(),
      new FormData(),
    );

    expect(result.formError).toBe(
      "Site introuvable. Impossible de lancer le contrôle.",
    );
    expect(nextNavigationMock.redirect).not.toHaveBeenCalled();
  });

  it("returns a readable error when the service fails", async () => {
    securityServiceMock.runSecurityCheck.mockRejectedValue(new Error("failed"));

    const result = await runSecurityCheckAction(
      "site_1",
      createInitialSecurityCheckFormState(),
      new FormData(),
    );

    expect(result.formError).toBe(
      "Impossible de lancer le contrôle sécurité. Réessayez plus tard ou vérifiez l'URL du site.",
    );
    expect(nextNavigationMock.redirect).not.toHaveBeenCalled();
  });
});
