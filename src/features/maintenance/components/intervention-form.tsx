import { Button } from "@/components/ui/button";
import { labelFromEnum } from "@/lib/utils";
import { maintenanceStatusValues, maintenanceTypeValues } from "../schemas";

type SiteOption = {
  id: string;
  name: string;
  client: { name: string; companyName: string | null };
};

type InterventionFormValue = {
  siteId?: string;
  title?: string;
  type?: string;
  status?: string;
  description?: string | null;
  technicalNotes?: string | null;
  clientSummary?: string | null;
};

export function InterventionForm({
  action,
  sites,
  intervention,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  sites: SiteOption[];
  intervention?: InterventionFormValue;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      <label>
        Site
        <select name="siteId" required defaultValue={intervention?.siteId ?? ""}>
          <option value="" disabled>
            Selectionner un site
          </option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} - {site.client.companyName || site.client.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Titre
        <input name="title" required defaultValue={intervention?.title ?? ""} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          Type
          <select name="type" defaultValue={intervention?.type ?? "other"}>
            {maintenanceTypeValues.map((value) => (
              <option key={value} value={value}>
                {labelFromEnum(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Statut
          <select name="status" defaultValue={intervention?.status ?? "planned"}>
            {maintenanceStatusValues.map((value) => (
              <option key={value} value={value}>
                {labelFromEnum(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Description
        <textarea name="description" rows={4} defaultValue={intervention?.description ?? ""} />
      </label>
      <label>
        Notes techniques
        <textarea name="technicalNotes" rows={5} defaultValue={intervention?.technicalNotes ?? ""} />
      </label>
      <label>
        Resume client
        <textarea name="clientSummary" rows={4} defaultValue={intervention?.clientSummary ?? ""} />
      </label>
      {!intervention ? (
        <label>
          Items d&apos;intervention
          <textarea name="itemsText" rows={4} placeholder="Une action par ligne" />
        </label>
      ) : null}
      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
