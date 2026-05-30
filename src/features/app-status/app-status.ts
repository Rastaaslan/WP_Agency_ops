export type DatabaseStatusSummary =
  | {
      status: "ok";
      label: "Base disponible";
      message: string;
    }
  | {
      status: "warning";
      label: "Base à vérifier";
      message: string;
    };

export function formatRuntimeEnvironment(value: string) {
  const labels: Record<string, string> = {
    development: "Développement local",
    production: "Production",
    test: "Test",
  };

  return labels[value] ?? "Non renseigné";
}

export function createDatabaseStatusSummary(
  clientCount: number | null,
): DatabaseStatusSummary {
  if (clientCount === null) {
    return {
      status: "warning",
      label: "Base à vérifier",
      message:
        "L'application répond, mais la base de données n'a pas pu être confirmée sur cette page.",
    };
  }

  const clientLabel = clientCount === 1 ? "client suivi" : "clients suivis";

  return {
    status: "ok",
    label: "Base disponible",
    message: `La base répond correctement. ${clientCount} ${clientLabel} dans le cockpit.`,
  };
}
