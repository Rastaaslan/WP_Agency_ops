import { connection } from "next/server";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import {
  createDatabaseStatusSummary,
  formatRuntimeEnvironment,
} from "@/features/app-status/app-status";
import { APP_NAME } from "@/lib/app-info";
import { env } from "@/server/env";
import { prisma } from "@/server/db/client";

export default async function AppStatusPage() {
  await connection();

  const databaseStatus = await getDatabaseStatus();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Cette page sert à vérifier que l'application locale répond correctement."
        eyebrow="État de l'application"
        title="État de l'application"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/api/health"
        >
          Voir le détail technique
        </Link>
      </PageHeader>

      <SectionPanel
        description="Synthèse lisible de l'application locale et de sa base de données."
        title="Vue générale"
      >
        <dl className="grid gap-5 text-sm md:grid-cols-2 lg:grid-cols-4">
          <StatusItem
            description="Nom de l'application locale ouverte dans ce cockpit."
            label="Application"
            status="ok"
            value={APP_NAME}
          />
          <StatusItem
            description="L&apos;interface se charge et peut afficher cette page."
            label="Statut général"
            status="ok"
            value="Application disponible"
          />
          <StatusItem
            description="Environnement déclaré par l&apos;application."
            label="Environnement"
            status="ok"
            value={formatRuntimeEnvironment(env.NODE_ENV)}
          />
          <StatusItem
            description={databaseStatus.message}
            label="Base de données"
            status={databaseStatus.status}
            value={databaseStatus.label}
          />
        </dl>
      </SectionPanel>

      <SectionPanel
        description="Le détail technique reste disponible pour les vérifications automatisées ou les diagnostics développeur."
        title="Détail technique"
      >
        <div className="flex flex-col gap-4 text-sm leading-6 text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
          <p>
            La page technique `/api/health` reste inchangée et renvoie une
            réponse structurée.
          </p>
          <Link
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
            href="/api/health"
          >
            Ouvrir /api/health
          </Link>
        </div>
      </SectionPanel>
    </div>
  );
}

async function getDatabaseStatus() {
  try {
    const clientCount = await prisma.client.count();

    return createDatabaseStatusSummary(clientCount);
  } catch {
    return createDatabaseStatusSummary(null);
  }
}

function StatusItem({
  description,
  label,
  status,
  value,
}: {
  description: string;
  label: string;
  status: "ok" | "warning";
  value: string;
}) {
  return (
    <div className="border-l-2 border-zinc-200 pl-3">
      <dt className="font-medium text-zinc-500">{label}</dt>
      <dd className="mt-2">
        <span
          className={`inline-flex min-h-7 items-center rounded-md border px-2 text-xs font-medium ${
            status === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {value}
        </span>
        <p className="mt-3 leading-6 text-zinc-700">{description}</p>
      </dd>
    </div>
  );
}
