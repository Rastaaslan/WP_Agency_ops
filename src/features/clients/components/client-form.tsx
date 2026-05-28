import { Button } from "@/components/ui/button";

type ClientFormValue = {
  name?: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export function ClientForm({
  action,
  client,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  client?: ClientFormValue;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      <label>
        Nom du contact
        <input name="name" required defaultValue={client?.name ?? ""} />
      </label>
      <label>
        Entreprise
        <input name="companyName" defaultValue={client?.companyName ?? ""} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          Email
          <input name="email" type="email" defaultValue={client?.email ?? ""} />
        </label>
        <label>
          Telephone
          <input name="phone" defaultValue={client?.phone ?? ""} />
        </label>
      </div>
      <label>
        Notes
        <textarea name="notes" rows={6} defaultValue={client?.notes ?? ""} />
      </label>
      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
