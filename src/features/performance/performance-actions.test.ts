import { beforeEach, describe, expect, it, vi } from "vitest";
import { runPerformanceCheckAction } from "@/features/performance/performance-actions";
import { createInitialPerformanceCheckFormState } from "@/features/performance/performance-form-state";

const { nextCacheMock, nextNavigationMock, performanceServiceMock } =
  vi.hoisted(() => ({
    nextCacheMock: {
      revalidatePath: vi.fn(),
    },
    nextNavigationMock: {
      redirect: vi.fn((path: string) => {
        throw new Error(`NEXT_REDIRECT:${path}`);
      }),
    },
    performanceServiceMock: {
      runPerformanceCheck: vi.fn(),
    },
  }));

vi.mock(
  "@/features/performance/services/performance-check-service",
  () => performanceServiceMock,
);

vi.mock("next/cache", () => ({
  revalidatePath: nextCacheMock.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: nextNavigationMock.redirect,
}));

describe("performance actions", () => {
  beforeEach(() => {
    nextCacheMock.revalidatePath.mockReset();
    nextNavigationMock.redirect.mockClear();
    performanceServiceMock.runPerformanceCheck.mockReset();
  });

  it("runs a performance check and redirects to the site page", async () => {
    performanceServiceMock.runPerformanceCheck.mockResolvedValue({
      id: "performance_1",
      siteId: "site_1",
    });

    await expect(
      runPerformanceCheckAction(
        "site_1",
        createInitialPerformanceCheckFormState(),
        new FormData(),
      ),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/sites/site_1?notice=performance-check-run",
    );

    expect(performanceServiceMock.runPerformanceCheck).toHaveBeenCalledWith(
      "site_1",
    );
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith("/sites/site_1");
    expect(nextCacheMock.revalidatePath).toHaveBeenCalledWith(
      "/api/sites/site_1/technical-export",
    );
  });

  it("returns a readable error when the site is missing", async () => {
    performanceServiceMock.runPerformanceCheck.mockResolvedValue(null);

    const result = await runPerformanceCheckAction(
      "missing_site",
      createInitialPerformanceCheckFormState(),
      new FormData(),
    );

    expect(result.formError).toBe(
      "Site introuvable. Le contrôle performance n'a pas été lancé.",
    );
    expect(nextNavigationMock.redirect).not.toHaveBeenCalled();
  });

  it("returns a readable error when the service fails", async () => {
    performanceServiceMock.runPerformanceCheck.mockRejectedValue(
      new Error("failed"),
    );

    const result = await runPerformanceCheckAction(
      "site_1",
      createInitialPerformanceCheckFormState(),
      new FormData(),
    );

    expect(result.formError).toBe(
      "Le contrôle performance n'a pas pu démarrer. Vérifiez l'URL du site puis réessayez.",
    );
    expect(nextNavigationMock.redirect).not.toHaveBeenCalled();
  });
});
