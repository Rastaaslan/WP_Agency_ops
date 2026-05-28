import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { getSiteById } from "@/features/sites/services/site-service";
import { importWpurPayloadAction } from "@/features/wpur/wpur-actions";
import { WpurImportForm } from "@/features/wpur/components/wpur-import-form";

export default async function NewWpurImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const site = await getSiteById(id);

  if (!site) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={`Coller un payload JSON WPUR produit pour ${site.name}.`}
        eyebrow="Imports WPUR"
        title="Importer un payload WPUR"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href={`/sites/${site.id}`}
        >
          Retour site
        </Link>
      </PageHeader>

      <SectionPanel title="Cadre d'import">
        <div className="space-y-3 text-sm leading-6">
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            WPUR reste la source de vérité pour les rapports détaillés plugins.
          </p>
          <p className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-cyan-950">
            WP Agency Ops importe uniquement une synthèse du payload WPUR.
          </p>
        </div>
      </SectionPanel>

      <SectionPanel
        description="Le JSON est validé côté serveur, puis stocké comme payload externe lié au site. Le payload complet reste consultable depuis la fiche site."
        title="Payload JSON"
      >
        <WpurImportForm
          action={importWpurPayloadAction.bind(null, site.id)}
          cancelHref={`/sites/${site.id}`}
        />
      </SectionPanel>
    </div>
  );
}
