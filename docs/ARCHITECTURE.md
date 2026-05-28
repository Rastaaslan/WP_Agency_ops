# Architecture

## Stack

- Next.js App Router.
- TypeScript strict.
- SQLite local.
- Prisma ORM 7.
- Zod.
- Tailwind CSS.
- Vitest.

## Organisation

```txt
src/app/(dashboard)      Écrans applicatifs
src/app/api              Route handlers JSON
src/components           UI, layout, feedback
src/features             Domaines produit
src/server/db            Prisma client
src/server/http          Fetch sécurisé
src/server/validators    Helpers Zod/FormData
src/lib                  Dates, URLs, utils
```

## Domaines

- `clients` : validation, actions, formulaire client.
- `sites` : validation, actions, formulaire site.
- `wordpress` : connecteurs, types normalisés, service de scan.
- `maintenance` : interventions et items.
- `reports` : génération Markdown/HTML.
- `forms` : formulaires surveillés.
- `backups` : suivi manuel des sauvegardes fichiers/base, avec lien optionnel vers une intervention.
- `performance` : provider HTTP simple.
- `security` : provider non intrusif.
- `static-publish` : checklist et interfaces futures.
- `wpur-integration` : types TypeScript, validation Zod, import manuel et synthèse d'un payload WPUR.
- `site-exports` : export JSON global de l'état technique d'un site.
- `monitoring`, `deploy`, `automation` : interfaces préparatoires.

## Flux de données

1. L’utilisateur agit dans une page dashboard.
2. Une Server Action valide les entrées avec Zod.
3. Le service métier exécute l’opération.
4. Prisma persiste dans SQLite.
5. La page est revalidée et affiche l’état à jour.

Les routes `/api/*` exposent un second point d’entrée JSON pour automatisations futures.

`/api/health` retourne un statut simple de l’application et vérifie que la base SQLite répond.

## Connexion WordPress

Le MVP implémente :

- `PublicRestWordPressConnector`
- `ManualWordPressConnector`
- `CompanionPluginWordPressConnector`

Préparé :

- `ApplicationPasswordWordPressConnector`

Le résultat de scan est normalisé dans `WordPressScanResult`, puis stocké dans `SiteScan`, `WordPressPlugin` et `WordPressTheme`. Cet inventaire reste un snapshot technique léger. Les rapports plugins détaillés et l'historique spécialisé appartiennent à WPUR.

## Intégration WPUR

WPUR est traité comme un module spécialisé externe. WP Agency Ops ne lance pas WPUR, ne scanne pas les plugins via FTP et ne recrée pas son rapport plugin.

Le flux actuel est :

```txt
WPUR exporte un payload JSON
-> WP Agency Ops valide le payload avec Zod
-> WpurImport stocke payloadJson + summaryJson
-> la fiche site affiche une synthèse cockpit
```

Les types et services vivent dans `src/features/wpur-integration`. L'import manuel est exposé dans la section **WPUR / Plugins** de la fiche site. Le payload complet reste téléchargeable via `/api/wpur-imports/[id]/payload`.

Une intégration future pourra appeler WPUR comme worker externe ou module interne, mais cette passe garde les deux produits séparés.

Le connecteur compagnon lit une clé API via `SecretProvider`. Dans ce MVP, `EnvironmentSecretProvider` accepte une référence `env:VARIABLE` ou la variable serveur `WP_AGENCY_OPS_COMPANION_API_KEY`.

Le service `checkWordPressConnection` permet de tester une connexion sans créer de scan complet. Il met à jour `WordPressSite.connectionStatus` et `WordPressConnection.lastConnectionCheckAt`.

## Base de données

Le schéma Prisma couvre les clients, sites, connexions, scans, plugins, thèmes, interventions, items, rapports, formulaires, soumissions, checks performance/sécurité, backups manuels, imports WPUR et reviews Static Publish.

`WpurImport` contient `siteId`, `importedAt`, `periodMonth`, `payloadJson` et `summaryJson`. `BackupRecord` contient l'état manuel fichiers/base, la date de vérification, le statut, une note et un lien optionnel vers `MaintenanceIntervention`.

`PrismaSiteTechnicalExportService` implémente `SiteTechnicalExportService.exportSiteTechnicalState(siteId)` et rassemble client, site, dernier état sécurité/performance, formulaires, sauvegardes, interventions et dernier import WPUR.

SQLite suffit pour le MVP local. Le modèle reste compatible avec une future migration PostgreSQL.

## Workflow de demo

Le parcours principal stabilise est :

```txt
Site WordPress connecte
-> scan compagnon enrichi
-> recommandations techniques
-> intervention pre-remplie depuis scan
-> rapport client Markdown/HTML
```

Les recommandations sont generees dans `src/features/wordpress/services/scan-insights.ts`.
Les items d'intervention issus d'un scan sont generes dans `src/features/maintenance/services/intervention-from-scan.ts`.
