# WP Agency Ops v2

WP Agency Ops v2 est le cockpit global WordPress.

Statut actuel : base technique et modèle de données minimal. Cette branche ne contient pas encore de CRUD, d'UI métier, de sécurité, de performance, de formulaires, de sauvegardes, de rapports, d'auth, de plugin compagnon ou d'intégration WPUR réelle.

WPUR reste un projet séparé dédié à la maintenance détaillée des plugins WordPress. WP Agency Ops v2 pourra importer et afficher des synthèses WPUR plus tard, mais ne doit pas réimplémenter son moteur.

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
