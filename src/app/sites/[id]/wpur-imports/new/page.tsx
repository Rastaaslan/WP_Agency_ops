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
        description={`Importer l'export WPUR produit pour ${site.name} afin de conserver sa synthèse dans le suivi global du site.`}
        eyebrow="Imports WPUR"
        title="Importer un export WPUR"
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
            WPUR est l&apos;outil dédié au suivi des plugins et aux rapports associés.
          </p>
          <p className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-cyan-950">
            Ici, WP Agency Ops conserve uniquement une synthèse de son export.
          </p>
        </div>
      </SectionPanel>

      <SectionPanel
        description="L'export est vérifié côté serveur, puis stocké comme synthèse externe liée au site. Le détail de l'export reste consultable depuis la fiche site."
        title="Export WPUR"
      >
        <WpurImportForm
          action={importWpurPayloadAction.bind(null, site.id)}
          cancelHref={`/sites/${site.id}`}
        />
      </SectionPanel>
    </div>
  );
}
