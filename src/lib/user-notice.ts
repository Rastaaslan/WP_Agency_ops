export type UserNotice = {
  title: string;
  message: string;
};

const userNotices: Record<string, UserNotice> = {
  "backup-saved": {
    title: "Sauvegarde enregistrée",
    message: "Le suivi documentaire de la sauvegarde a été mis à jour.",
  },
  "client-archived": {
    title: "Client archivé",
    message: "Cette action ne supprime pas les données du client.",
  },
  "client-created": {
    title: "Client créé",
    message: "La fiche client est prête dans le cockpit.",
  },
  "client-updated": {
    title: "Client modifié",
    message: "Les informations du client ont été enregistrées.",
  },
  "intervention-cancelled": {
    title: "Intervention annulée",
    message: "Le statut a été mis à jour sans supprimer l'intervention.",
  },
  "intervention-created": {
    title: "Intervention créée",
    message: "L'action est enregistrée dans le suivi global du site.",
  },
  "intervention-item-added": {
    title: "Item ajouté",
    message: "Le point de suivi a été ajouté à l'intervention.",
  },
  "intervention-item-updated": {
    title: "Item enregistré",
    message: "Le point de suivi de l'intervention a été mis à jour.",
  },
  "intervention-status-updated": {
    title: "Statut enregistré",
    message: "Le statut de l'intervention a été mis à jour.",
  },
  "intervention-updated": {
    title: "Intervention modifiée",
    message: "Les informations de l'intervention ont été enregistrées.",
  },
  "performance-check-run": {
    title: "Contrôle performance lancé",
    message: "Le résultat est ajouté au suivi du site.",
  },
  "security-check-run": {
    title: "Contrôle sécurité lancé",
    message: "Le résultat est ajouté au suivi du site.",
  },
  "site-archived": {
    title: "Site archivé",
    message: "Cette action ne supprime pas les données du site.",
  },
  "site-created": {
    title: "Site créé",
    message: "La fiche site est prête dans le cockpit.",
  },
  "site-updated": {
    title: "Site modifié",
    message: "Les informations du site ont été enregistrées.",
  },
  "watched-form-saved": {
    title: "Formulaire surveillé enregistré",
    message: "Le suivi documentaire du formulaire a été mis à jour.",
  },
  "wpur-imported": {
    title: "Import WPUR réussi",
    message: "La synthèse WPUR est disponible sur la fiche site.",
  },
};

export function getUserNotice(
  value: string | string[] | undefined,
): UserNotice | null {
  const key = Array.isArray(value) ? value[0] : value;

  if (!key) {
    return null;
  }

  return userNotices[key] ?? null;
}
