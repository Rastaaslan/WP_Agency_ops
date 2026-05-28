import { Button } from "@/components/ui/button";
import { labelFromEnum } from "@/lib/utils";
import { connectionTypeValues, siteEnvironmentValues } from "../schemas";

type ClientOption = {
  id: string;
  name: string;
  companyName: string | null;
};

type SiteFormValue = {
  clientId?: string;
  name?: string;
  url?: string;
  adminUrl?: string | null;
  environment?: string;
  connectionType?: string;
  secretReference?: string | null;
  notes?: string | null;
};

export function SiteForm({
  action,
  clients,
  site,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  clients: ClientOption[];
  site?: SiteFormValue;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      <label>
        Client
        <select name="clientId" required defaultValue={site?.clientId ?? ""}>
          <option value="" disabled>
            Selectionner un client
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.companyName || client.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Nom du site
        <input name="name" required defaultValue={site?.name ?? ""} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          URL publique
          <input name="url" required placeholder="https://example.com" defaultValue={site?.url ?? ""} />
        </label>
        <label>
          URL admin
          <input name="adminUrl" placeholder="https://example.com/wp-admin" defaultValue={site?.adminUrl ?? ""} />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          Environnement
          <select name="environment" defaultValue={site?.environment ?? "production"}>
            {siteEnvironmentValues.map((value) => (
              <option key={value} value={value}>
                {labelFromEnum(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mode de connexion
          <select name="connectionType" defaultValue={site?.connectionType ?? "public_rest"}>
            {connectionTypeValues.map((value) => (
              <option key={value} value={value}>
                {labelFromEnum(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Reference de secret
        <input
          name="secretReference"
          placeholder="env:WP_AGENCY_OPS_COMPANION_API_KEY"
          defaultValue={site?.secretReference ?? ""}
        />
      </label>
      <label>
        Notes
        <textarea name="notes" rows={6} defaultValue={site?.notes ?? ""} />
      </label>
      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
