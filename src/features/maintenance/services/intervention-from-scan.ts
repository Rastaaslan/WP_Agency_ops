type ScanAsset = {
  name: string;
  version: string | null;
  newVersion: string | null;
  updateAvailable: boolean;
  active?: boolean | null;
};

type ScanUpdate = {
  kind?: string;
  label?: string;
  currentVersion?: string;
  newVersion?: string;
};

type ScanRecommendation = {
  message?: string;
  priority?: string;
};

type ScanForIntervention = {
  id: string;
  plugins: ScanAsset[];
  themes: ScanAsset[];
  rawJson?: unknown;
};

export type GeneratedInterventionItem = {
  label: string;
  status: "planned";
  details: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isScanUpdate(value: unknown): value is ScanUpdate {
  return isRecord(value) && typeof value.kind === "string";
}

function scanUpdates(rawJson: unknown) {
  if (!isRecord(rawJson) || !Array.isArray(rawJson.updates)) {
    return [];
  }

  return rawJson.updates.filter(isScanUpdate);
}

function scanRecommendations(rawJson: unknown) {
  if (!isRecord(rawJson) || !Array.isArray(rawJson.recommendations)) {
    return [];
  }

  return rawJson.recommendations.filter(
    (item): item is ScanRecommendation =>
      isRecord(item) && typeof item.message === "string",
  );
}

function details({
  category,
  level,
  scanId,
  text,
}: {
  category: string;
  level: "info" | "warning" | "important";
  scanId: string;
  text: string;
}) {
  return [
    `Categorie: ${category}`,
    `Niveau: ${level}`,
    "Source: scan",
    `Scan: ${scanId}`,
    `Details: ${text}`,
  ].join("\n");
}

function updateLabel(asset: ScanAsset, kind: "plugin" | "theme") {
  const label = kind === "plugin" ? "Mettre a jour le plugin" : "Mettre a jour le theme";
  const version = asset.version ? ` de ${asset.version}` : "";
  const newVersion = asset.newVersion ? ` vers ${asset.newVersion}` : "";

  return `${label} ${asset.name}${version}${newVersion}.`;
}

export function generateInterventionItemsFromScan(
  scan: ScanForIntervention,
): GeneratedInterventionItem[] {
  const items: GeneratedInterventionItem[] = [
    {
      label: "Effectuer une sauvegarde avant intervention.",
      status: "planned",
      details: details({
        category: "backup",
        level: "important",
        scanId: scan.id,
        text: "Etape de securite avant toute maintenance technique.",
      }),
    },
  ];
  const updates = scanUpdates(scan.rawJson);

  for (const update of updates.filter((item) => item.kind === "core")) {
    items.push({
      label: update.newVersion
        ? `Mettre a jour WordPress vers ${update.newVersion}.`
        : "Verifier la mise a jour WordPress disponible.",
      status: "planned",
      details: details({
        category: "update",
        level: "important",
        scanId: scan.id,
        text: update.label ?? "Mise a jour WordPress detectee par le scan.",
      }),
    });
  }

  for (const plugin of scan.plugins.filter((item) => item.updateAvailable)) {
    items.push({
      label: updateLabel(plugin, "plugin"),
      status: "planned",
      details: details({
        category: "update",
        level: "warning",
        scanId: scan.id,
        text: "Extension avec mise a jour disponible.",
      }),
    });
  }

  for (const theme of scan.themes.filter((item) => item.updateAvailable)) {
    items.push({
      label: updateLabel(theme, "theme"),
      status: "planned",
      details: details({
        category: "update",
        level: "warning",
        scanId: scan.id,
        text: "Theme avec mise a jour disponible.",
      }),
    });
  }

  if (scan.plugins.some((plugin) => plugin.active === false)) {
    items.push({
      label: "Verifier les plugins inactifs.",
      status: "planned",
      details: details({
        category: "cleanup",
        level: "info",
        scanId: scan.id,
        text: "Supprimer uniquement les extensions confirmees comme inutiles.",
      }),
    });
  }

  for (const recommendation of scanRecommendations(scan.rawJson).slice(0, 4)) {
    items.push({
      label: recommendation.message ?? "Verifier une recommandation du scan.",
      status: "planned",
      details: details({
        category: "recommendation",
        level:
          recommendation.priority === "important"
            ? "important"
            : recommendation.priority === "warning"
              ? "warning"
              : "info",
        scanId: scan.id,
        text: "Recommandation generee automatiquement a partir du scan.",
      }),
    });
  }

  items.push(
    {
      label: "Controler les formulaires critiques.",
      status: "planned",
      details: details({
        category: "form",
        level: "info",
        scanId: scan.id,
        text: "Verifier au moins les formulaires client importants apres maintenance.",
      }),
    },
    {
      label: "Verifier l'affichage apres intervention.",
      status: "planned",
      details: details({
        category: "quality",
        level: "important",
        scanId: scan.id,
        text: "Controler les pages principales avant validation client.",
      }),
    },
    {
      label: "Relancer un scan apres intervention.",
      status: "planned",
      details: details({
        category: "scan",
        level: "info",
        scanId: scan.id,
        text: "Comparer l'etat apres intervention avec le scan source.",
      }),
    },
  );

  const labels = new Set<string>();
  return items.filter((item) => {
    if (labels.has(item.label)) {
      return false;
    }

    labels.add(item.label);
    return true;
  });
}
