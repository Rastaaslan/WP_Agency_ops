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
- `performance` : provider HTTP simple.
- `security` : provider non intrusif.
- `static-publish` : checklist et interfaces futures.
- `monitoring`, `deploy`, `automation` : interfaces préparatoires.

## Flux de données

1. L’utilisateur agit dans une page dashboard.
2. Une Server Action valide les entrées avec Zod.
3. Le service métier exécute l’opération.
4. Prisma persiste dans SQLite.
5. La page est revalidée et affiche l’état à jour.

Les routes `/api/*` exposent un second point d’entrée JSON pour automatisations futures.

## Connexion WordPress

Le MVP implémente :

- `PublicRestWordPressConnector`
- `ManualWordPressConnector`

Préparé :

- `CompanionPluginWordPressConnector`
- `ApplicationPasswordWordPressConnector`

Le résultat de scan est normalisé dans `WordPressScanResult`, puis stocké dans `SiteScan`, `WordPressPlugin` et `WordPressTheme`.

## Base de données

Le schéma Prisma couvre les clients, sites, connexions, scans, plugins, thèmes, interventions, items, rapports, formulaires, soumissions, checks performance/sécurité et reviews Static Publish.

SQLite suffit pour le MVP local. Le modèle reste compatible avec une future migration PostgreSQL.
