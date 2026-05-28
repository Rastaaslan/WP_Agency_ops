# Integration WPUR

## Role de WPUR

WPUR est l'outil specialise pour la maintenance des plugins WordPress. Il gere la detection des plugins installes, les versions, les mises a jour disponibles, les statuts particuliers, l'historique, les alertes et le payload de rapport plugin.

WPUR repond au besoin precis : plugins -> versions -> mises a jour -> historique -> rapport plugin.

## Role de WP Agency Ops

WP Agency Ops Toolkit est le cockpit global WordPress. Il centralise les clients, les sites, les interventions, la securite, la performance, les formulaires, les sauvegardes, les exports techniques et les modules specialises comme WPUR.

Le toolkit affiche une synthese WPUR dans le contexte du site, mais ne produit pas le rapport plugin detaille.

## Pourquoi les projets restent separes

Les deux produits n'ont pas le meme centre de gravite :

- WPUR descend en profondeur dans la maintenance plugins.
- WP Agency Ops pilote l'etat technique global du portefeuille WordPress.

Garder les projets separes evite de dupliquer le scanner FTP, l'analyse des headers PHP, les appels WordPress.org, le payload Figma et le rapport plugin WPUR.

## Format attendu

L'import actuel attend un payload JSON de type `monthly_maintenance_matrix`.

Champs principaux :

```ts
type WpurReportPayload = {
  schemaVersion: string;
  reportType: "monthly_maintenance_matrix";
  period: {
    month: string;
    label: string;
  };
  report?: {
    number?: string;
    total?: string;
    title?: string;
  };
  client: {
    name?: string;
  };
  site: {
    url?: string;
  };
  offer?: {
    name?: string;
  };
  maintenanceDates: string[];
  sections: WpurReportSection[];
  alerts: WpurAlert[];
  notes: string[];
};
```

Les schemas Zod vivent dans `src/features/wpur-integration/schemas.ts`. Les types TypeScript et la synthese vivent dans `src/features/wpur-integration`.

## Import manuel

1. Ouvrir une fiche site.
2. Aller dans **WPUR / Plugins**.
3. Coller le payload JSON exporte par WPUR.
4. Cliquer sur **Importer payload WPUR JSON**.
5. Le payload est valide par Zod, stocke dans `WpurImport.payloadJson`, puis resume dans `WpurImport.summaryJson`.

La synthese affiche la periode, les dates de maintenance, le nombre de sections, les plugins listes, les mises a jour cochees, les alertes, les plugins ajoutes/supprimes/changes si ces informations existent, et un lien vers le payload complet.

## Stockage

Modele Prisma :

```txt
WpurImport {
  id
  siteId
  importedAt
  periodMonth
  payloadJson
  summaryJson
}
```

Une intervention peut aussi reference un import WPUR via `MaintenanceIntervention.wpurImportId`.

## Limites actuelles

- Import manuel uniquement.
- Aucun appel CLI `python -m wpur...`.
- Aucun worker externe.
- Aucune fusion de code WPUR dans le toolkit.
- Aucun rapport plugin detaille genere par WP Agency Ops.
- Aucune mise a jour automatique de plugin.

## Integrations futures possibles

- Import JSON WPUR plus riche, avec mapping de payloads reels.
- Worker externe qui appelle WPUR et renvoie un JSON.
- Module WPUR integre, seulement si les deux produits doivent vraiment converger.
- Rapport global WP Agency Ops pouvant citer la synthese WPUR sans remplacer le rapport WPUR.

