import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { createClient } from "@/features/clients/actions";
import { ClientForm } from "@/features/clients/components/client-form";

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="Ajouter un client" description="Creez une fiche client avant de rattacher ses sites WordPress." />
      <Card className="max-w-3xl">
        <ClientForm action={createClient} submitLabel="Creer le client" />
      </Card>
    </>
  );
}
