# WP Agency Ops v2

WP Agency Ops v2 est le cockpit global WordPress.

Statut actuel : base technique, modèle de données minimal, routes API minimales, première UI métier, CRUD clients côté UI, CRUD sites côté UI, CRUD interventions globales côté UI et import WPUR manuel côté UI. Cette branche ne contient pas encore de sécurité, de performance, de formulaires, de sauvegardes, de rapports, d'auth, de plugin compagnon ou d'intégration WPUR exécutée.

WPUR reste un projet séparé dédié à la maintenance détaillée des plugins WordPress. WP Agency Ops v2 peut importer et afficher des synthèses WPUR, mais ne doit pas réimplémenter son moteur.

## Installation

```bash
npm install
```

Créez un fichier `.env` si nécessaire :

```bash
DATABASE_URL="file:./dev.db"
```

## Lancer le projet

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000).

La page d'accueil doit afficher :

```txt
WP Agency Ops v2 — Cockpit global WordPress
```

## Santé applicative

```bash
curl http://localhost:3000/api/health
```

La route retourne un JSON minimal avec `status`, `app` et `environment`.

## Tests et vérifications

```bash
npm run lint
npm run test
npm run build
```

## Base de données

Prisma et SQLite sont configurés avec un modèle minimal :

- `Client` ;
- `Site` ;
- `Intervention` ;
- `InterventionItem` ;
- `WpurImport`.

`WpurImport` stocke un payload produit par WPUR. WP Agency Ops v2 ne scanne pas les plugins, ne compare pas les versions et ne génère pas les payloads WPUR.

```bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

`npm run db:seed` crée un petit jeu de données fictif : un client, un site, une intervention globale, deux items et un import WPUR minimal.

## Services serveur

Une couche serveur minimale prépare les futurs CRUD sans exposer encore de routes API métier ni d'UI :

- clients ;
- sites ;
- interventions ;
- imports WPUR ;
- export technique global.

Ces services utilisent Prisma et les schémas Zod existants. WPUR est seulement importé via `WpurImport` : le toolkit ne lance pas WPUR, ne scanne pas les plugins et ne génère pas de rapport plugin.

## API minimale

Les routes API minimales exposent les services serveur existants :

- `GET /api/health` ;
- `GET /api/clients` et `POST /api/clients` ;
- `GET /api/clients/[id]`, `PATCH /api/clients/[id]` et `POST /api/clients/[id]/archive` ;
- `GET /api/clients/[id]/sites` ;
- `GET /api/sites` et `POST /api/sites` ;
- `GET /api/sites/[id]`, `PATCH /api/sites/[id]` et `POST /api/sites/[id]/archive` ;
- `GET /api/sites/[id]/interventions` ;
- `GET /api/interventions` et `POST /api/interventions` ;
- `GET /api/interventions/[id]` et `PATCH /api/interventions/[id]` ;
- `PATCH /api/interventions/[id]/status` ;
- `POST /api/interventions/[id]/items` ;
- `PATCH /api/intervention-items/[id]` ;
- `GET /api/sites/[id]/wpur-imports` et `POST /api/sites/[id]/wpur-imports` ;
- `GET /api/wpur-imports/[id]` ;
- `GET /api/sites/[id]/technical-export`.

Les réponses suivent le format `{ "data": ... }` en succès et `{ "error": { "message": "...", "code": "..." } }` en erreur.

Les imports WPUR restent des données reçues et stockées. Ces routes ne lancent pas WPUR, ne scannent pas les plugins, ne récupèrent pas WordPress.org et ne génèrent pas de rapport plugin.

## UI métier

L'interface applicative expose une première navigation métier :

- `/` : accueil avec accès aux clients, sites, interventions et healthcheck ;
- `/clients` : liste des clients et accès à la création ;
- `/clients/new` : création d'un client ;
- `/clients/[id]` : fiche client, sites liés, modification et archivage ;
- `/clients/[id]/edit` : modification d'un client ;
- `/sites` : liste des sites WordPress et accès à la création ;
- `/sites/new` : création d'un site rattaché à un client existant ;
- `/sites/[id]` : fiche site, interventions récentes avec lien de création pré-rattachée au site, synthèse des imports WPUR, modification, archivage et lien vers l'export technique JSON ;
- `/sites/[id]/wpur-imports/new` : import manuel d'un payload JSON WPUR produit par WPUR ;
- `/sites/[id]/edit` : modification d'un site.
- `/interventions` : liste des interventions globales ;
- `/interventions/new` : création d'une intervention liée à un site ;
- `/interventions/[id]` : fiche intervention, changement de statut et gestion d'items simples ;
- `/interventions/[id]/edit` : modification d'une intervention globale.

Le CRUD UI est limité aux clients, aux sites et aux interventions globales. L'import WPUR UI est limité au collage manuel d'un payload JSON déjà produit par WPUR, validé puis stocké comme donnée externe liée au site.

Les items d'intervention doivent rester génériques. Le détail maintenance plugins, les versions, comparaisons et rapports plugins restent dans WPUR.

Prochaines étapes prévues : modules sécurité/performance/forms/backups, dans des tickets séparés.

## Ancienne base locale v1

Si `dev.db` existe déjà et contient l'ancien schéma v1, `npm run db:migrate` peut échouer avec une erreur de drift Prisma.

Ne forcez pas de reset si vous voulez conserver cette base. Renommez-la d'abord en backup local :

```bash
mv dev.db dev-v1-backup.db
```

Sur PowerShell :

```powershell
Move-Item -LiteralPath dev.db -Destination dev-v1-backup.db
```

Relancez ensuite les commandes sur une base propre :

```bash
npm run db:migrate
npm run db:seed
```

## Structure minimale

```txt
src/
  app/
  components/
  features/
  lib/
  server/
prisma/
docs/
```
