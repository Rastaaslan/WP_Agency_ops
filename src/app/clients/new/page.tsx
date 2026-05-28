import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SectionPanel } from "@/components/section-panel";
import { createClientAction } from "@/features/clients/client-actions";
import { ClientForm } from "@/features/clients/components/client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Créer une fiche client minimale pour le cockpit global."
        eyebrow="Clients"
        title="Nouveau client"
      >
        <Link
          className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-cyan-800 hover:border-cyan-300"
          href="/clients"
        >
          Retour clients
        </Link>
      </PageHeader>

      <SectionPanel title="Informations client">
        <ClientForm
          action={createClientAction}
          cancelHref="/clients"
          submitLabel="Créer le client"
        />
      </SectionPanel>
    </div>
  );
}
