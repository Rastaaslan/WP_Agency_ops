import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";
import { CompanionPluginWordPressConnector } from "../connectors/companion-plugin";
import { ManualWordPressConnector, type ManualScanInput } from "../connectors/manual";
import {
  ApplicationPasswordWordPressConnector,
} from "../connectors/placeholders";
import { PublicRestWordPressConnector } from "../connectors/public-rest";
import { EnvironmentSecretProvider } from "../secret-provider";
import type {
  ConnectionCheckResult,
  ConnectorSite,
  WordPressConnector,
  WordPressScanResult,
} from "../types";

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

function connectorFor(site: ConnectorSite, manualInput?: ManualScanInput): WordPressConnector {
  if (manualInput || site.connectionType === "manual") {
    return new ManualWordPressConnector(manualInput);
  }

  if (site.connectionType === "companion_plugin") {
    return new CompanionPluginWordPressConnector(new EnvironmentSecretProvider());
  }

  if (site.connectionType === "application_password") {
    return new ApplicationPasswordWordPressConnector();
  }

  return new PublicRestWordPressConnector();
}

async function getConnectorSite(siteId: string) {
  return prisma.wordPressSite.findUniqueOrThrow({
    where: { id: siteId },
    select: {
      id: true,
      name: true,
      url: true,
      connectionType: true,
      connection: {
        select: {
          apiBaseUrl: true,
          secretReference: true,
          username: true,
        },
      },
    },
  });
}

export function summarizeScanResult(result: WordPressScanResult) {
  const updateCount = [
    ...result.plugins.filter((plugin) => plugin.updateAvailable),
    ...result.themes.filter((theme) => theme.updateAvailable),
    ...result.updates,
  ].length;

  return {
    detected: result.detected,
    wpVersion: result.wpVersion,
    phpVersion: result.phpVersion,
    pluginCount: result.plugins.length,
    themeCount: result.themes.length,
    updateCount,
    warningCount: result.warnings.filter((warning) => warning.severity !== "info").length,
  };
}

export async function runWordPressScan(
  siteId: string,
  manualInput?: ManualScanInput,
) {
  const site = await getConnectorSite(siteId);

  const scan = await prisma.siteScan.create({
    data: {
      siteId,
      status: "running",
      startedAt: new Date(),
    },
  });

  const connector = connectorFor(site, manualInput);

  try {
    const result = await connector.scan(site);
    const summary = summarizeScanResult(result);

    await prisma.$transaction(async (tx) => {
      if (result.plugins.length > 0) {
        await tx.wordPressPlugin.createMany({
          data: result.plugins.map((plugin) => ({
            scanId: scan.id,
            name: plugin.name,
            slug: plugin.slug,
            version: plugin.version,
            updateAvailable: Boolean(plugin.updateAvailable),
            newVersion: plugin.newVersion,
            active: Boolean(plugin.active),
            requiresWp: plugin.requiresWp,
            requiresPhp: plugin.requiresPhp,
            testedUpTo: plugin.testedUpTo,
            status:
              plugin.status ??
              (plugin.updateAvailable
                ? "update_available"
                : plugin.active === false
                  ? "inactive"
                  : "healthy"),
          })),
        });
      }

      if (result.themes.length > 0) {
        await tx.wordPressTheme.createMany({
          data: result.themes.map((theme) => ({
            scanId: scan.id,
            name: theme.name,
            slug: theme.slug,
            version: theme.version,
            updateAvailable: Boolean(theme.updateAvailable),
            newVersion: theme.newVersion,
            active: Boolean(theme.active),
            status:
              theme.status ??
              (theme.updateAvailable
                ? "update_available"
                : theme.active === false
                  ? "inactive"
                  : "healthy"),
          })),
        });
      }

      await tx.siteScan.update({
        where: { id: scan.id },
        data: {
          status: "success",
          finishedAt: new Date(),
          summaryJson: jsonValue(summary),
          rawJson: jsonValue(result),
        },
      });

      await tx.wordPressSite.update({
        where: { id: siteId },
        data: {
          lastScanAt: new Date(),
          connectionStatus: result.detected ? "connected" : "failed",
        },
      });
    });

    return prisma.siteScan.findUniqueOrThrow({
      where: { id: scan.id },
      include: { plugins: true, themes: true },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Le scan WordPress a echoue.";

    await prisma.$transaction([
      prisma.siteScan.update({
        where: { id: scan.id },
        data: {
          status: "failed",
          finishedAt: new Date(),
          errorMessage: message,
        },
      }),
      prisma.wordPressSite.update({
        where: { id: siteId },
        data: { connectionStatus: "failed" },
      }),
    ]);

    throw error;
  }
}

export async function checkWordPressConnection(
  siteId: string,
): Promise<ConnectionCheckResult> {
  const site = await getConnectorSite(siteId);
  const connector = connectorFor(site);
  const result = await connector.checkConnection(site);
  const status = result.ok && result.detected ? "connected" : "failed";
  const checkedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.wordPressSite.update({
      where: { id: siteId },
      data: { connectionStatus: status },
    });

    await tx.wordPressConnection.upsert({
      where: { siteId },
      create: {
        siteId,
        type: site.connectionType,
        apiBaseUrl: site.connection?.apiBaseUrl ?? site.url,
        secretReference: site.connection?.secretReference,
        username: site.connection?.username,
        lastConnectionStatus: status,
        lastConnectionCheckAt: checkedAt,
      },
      update: {
        type: site.connectionType,
        apiBaseUrl: site.connection?.apiBaseUrl ?? site.url,
        secretReference: site.connection?.secretReference,
        username: site.connection?.username,
        lastConnectionStatus: status,
        lastConnectionCheckAt: checkedAt,
      },
    });
  });

  return result;
}
