import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Parametres"
        description="Configuration locale, variables attendues et modules futurs."
      />
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Variables attendues</CardTitle>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="font-mono text-zinc-500">DATABASE_URL</dt><dd>SQLite local du MVP.</dd></div>
            <div><dt className="font-mono text-zinc-500">ALLOW_PRIVATE_NETWORK_TARGETS</dt><dd>Active volontairement les checks vers localhost/IP privees en local.</dd></div>
          </dl>
        </Card>
        <Card>
          <CardTitle>Plugin compagnon</CardTitle>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            L&apos;architecture prepare un plugin compagnon WordPress pour exposer health, plugins, themes et updates via une API protegee. Le MVP utilise REST public et snapshots manuels.
          </p>
        </Card>
        <Card>
          <CardTitle>Connexions futures</CardTitle>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Application passwords, backups, screenshots avant/apres, rollback manuel, monitoring planifie et deploiements statiques sont representes par interfaces et documentation.
          </p>
        </Card>
        <Card>
          <CardTitle>Limites de securite</CardTitle>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Les checks HTTP restent non intrusifs. Aucun scan offensif, aucune mise a jour WordPress automatique et aucun secret n&apos;est stocke en clair pour des actions sensibles.
          </p>
        </Card>
      </section>
    </>
  );
}
