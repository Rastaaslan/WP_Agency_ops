import type {
  ScanWarning,
  TechnicalRecommendation,
  WordPressScanResult,
} from "../types";

function hasWarning(warnings: ScanWarning[], code: string) {
  return warnings.some((warning) => warning.code === code);
}

function hasRecommendation(
  recommendations: TechnicalRecommendation[],
  code: string,
) {
  return recommendations.some((recommendation) => recommendation.code === code);
}

function addWarning(warnings: ScanWarning[], warning: ScanWarning) {
  if (!hasWarning(warnings, warning.code)) {
    warnings.push(warning);
  }
}

function addRecommendation(
  recommendations: TechnicalRecommendation[],
  recommendation: TechnicalRecommendation,
) {
  if (!hasRecommendation(recommendations, recommendation.code)) {
    recommendations.push(recommendation);
  }
}

export function enrichScanResult(
  result: WordPressScanResult,
): WordPressScanResult {
  const warnings = [...result.warnings];
  const recommendations = [...result.recommendations];
  const pluginUpdates = result.plugins.filter((plugin) => plugin.updateAvailable);
  const themeUpdates = result.themes.filter((theme) => theme.updateAvailable);
  const coreUpdates = result.updates.filter((update) => update.kind === "core");
  const inactivePlugins = result.plugins.filter(
    (plugin) => plugin.active === false || plugin.status === "inactive",
  );

  if (coreUpdates.length > 0) {
    addWarning(warnings, {
      code: "wordpress_update_available",
      severity: "warning",
      message:
        "Une mise a jour WordPress semble disponible. Prevoir une verification avant intervention.",
    });
  }

  if (pluginUpdates.length > 0) {
    addWarning(warnings, {
      code: "plugin_updates_available",
      severity: "warning",
      message: `${pluginUpdates.length} extension(s) avec mise a jour disponible.`,
    });
    addRecommendation(recommendations, {
      code: "plan_plugin_updates",
      priority: "warning",
      message: "Prevoir une mise a jour des extensions.",
    });
  }

  if (themeUpdates.length > 0) {
    addWarning(warnings, {
      code: "theme_updates_available",
      severity: "warning",
      message: `${themeUpdates.length} theme(s) avec mise a jour disponible.`,
    });
    addRecommendation(recommendations, {
      code: "check_theme_compatibility",
      priority: "warning",
      message: "Controler la compatibilite avant mise a jour du theme.",
    });
  }

  if (inactivePlugins.length > 0) {
    addWarning(warnings, {
      code: "inactive_plugins_detected",
      severity: "info",
      message: `${inactivePlugins.length} extension(s) inactive(s) detectee(s).`,
    });
    addRecommendation(recommendations, {
      code: "review_inactive_plugins",
      priority: "info",
      message:
        "Verifier les extensions inactives et supprimer celles qui ne sont plus necessaires.",
    });
  }

  if (result.debugEnabled) {
    addWarning(warnings, {
      code: "debug_enabled",
      severity: result.environment === "production" ? "warning" : "info",
      message:
        "Le mode debug WordPress est actif. A verifier si ce site est public.",
    });
    addRecommendation(recommendations, {
      code: "disable_debug_on_public_site",
      priority: result.environment === "production" ? "warning" : "info",
      message:
        "Desactiver le mode debug en production si ce site est public.",
    });
  }

  if (!result.phpVersion) {
    addWarning(warnings, {
      code: "php_version_unknown",
      severity: "info",
      message:
        "La version PHP n'est pas connue pour ce scan. Le plugin compagnon peut la remonter.",
    });
  }

  if (!result.detected) {
    addWarning(warnings, {
      code: "connection_partial",
      severity: "warning",
      message:
        "La connexion WordPress est partielle ou non confirmee. Verifier l'URL et le mode de connexion.",
    });
  }

  if (pluginUpdates.length > 0 || themeUpdates.length > 0 || coreUpdates.length > 0) {
    addRecommendation(recommendations, {
      code: "backup_before_maintenance",
      priority: "important",
      message: "Effectuer une sauvegarde avant intervention.",
    });
    addRecommendation(recommendations, {
      code: "rescan_after_maintenance",
      priority: "info",
      message: "Relancer un scan apres intervention.",
    });
  }

  return {
    ...result,
    warnings,
    recommendations,
  };
}
