# WP Agency Ops v2

WP Agency Ops v2 est le cockpit global WordPress.

Statut actuel : squelette technique uniquement. Cette branche ne contient pas encore de CRUD clients, sites, interventions, sécurité, performance, formulaires, sauvegardes, rapports, auth, plugin compagnon ou intégration WPUR réelle.

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

Prisma et SQLite sont configurés, mais aucun modèle métier définitif n'est encore créé.

```bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

`npm run db:seed` est volontairement un no-op tant que le modèle métier v2 n'est pas validé.

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
