# WP Agency Ops v2

WP Agency Ops v2 est le cockpit global WordPress.

Statut actuel : base technique, modèle de données minimal, routes API minimales, dashboard synthèse, CRUD clients côté UI, CRUD sites côté UI, CRUD interventions globales côté UI, import WPUR manuel côté UI, suivi manuel des sauvegardes, suivi manuel des formulaires critiques, contrôle sécurité simple non offensif et contrôle performance simple. Cette branche ne contient pas encore de tests automatiques de formulaires, de sauvegardes automatiques, de rapports, d'auth, de plugin compagnon ou d'intégration WPUR exécutée.

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

La page d'accueil affiche le dashboard synthèse du cockpit global WordPress.

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
- `BackupRecord` ;
- `WatchedForm` ;
- `SecurityCheck` ;
- `PerformanceCheck` ;
- `WpurImport`.

`WpurImport` stocke un export produit par WPUR. WP Agency Ops v2 ne scanne pas les plugins, ne compare pas les versions et ne génère pas les exports WPUR.

```bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

Limite locale connue : dans cet environnement, Prisma peut renvoyer `Schema engine error:` sans détail pendant `npm run db:migrate`. Les migrations SQL présentes dans `prisma/migrations` ont été vérifiées sur base SQLite temporaire, mais ce point doit être corrigé avant packaging ou démo hors environnement contrôlé.

`npm run db:seed` crée un jeu de données de démo réaliste autour d'Atelier Nova, avec plusieurs interventions, sauvegardes, formulaires surveillés, contrôles sécurité/performance, import WPUR synthétique et un second client léger.

Un scénario guidé est disponible dans [`docs/DEMO.md`](docs/DEMO.md).
Le statut de gel MVP local est résumé dans [`docs/MVP_STATUS.md`](docs/MVP_STATUS.md).

## Services serveur

Une couche serveur minimale prépare les futurs CRUD sans exposer encore de routes API métier ni d'UI :

- dashboard synthèse ;
- clients ;
- sites ;
- interventions ;
- sécurité ;
- performance ;
- imports WPUR ;
- état technique global du site.

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

- `/` : dashboard synthèse avec KPIs, interventions à suivre, derniers sites, derniers imports WPUR et points à surveiller ;
- `/clients` : liste des clients et accès à la création ;
- `/clients/new` : création d'un client ;
- `/clients/[id]` : fiche client, sites liés, modification et archivage ;
- `/clients/[id]/edit` : modification d'un client ;
- `/sites` : liste des sites WordPress et accès à la création ;
- `/sites/new` : création d'un site rattaché à un client existant ;
- `/sites/[id]` : fiche site, interventions récentes avec lien de création pré-rattachée au site, contrôle sécurité simple, contrôle performance simple, synthèse des imports WPUR, modification, archivage et lien vers l'état technique du site ;
- `/sites/[id]/backups/new` : création d'un suivi manuel de sauvegarde pour le site ;
- `/sites/[id]/forms/new` : création d'un formulaire surveillé pour le site ;
- `/sites/[id]/wpur-imports/new` : import manuel d'un export WPUR JSON produit par WPUR ;
- `/sites/[id]/edit` : modification d'un site.
- `/backups/[id]/edit` : modification du statut et des notes d'une sauvegarde documentée ;
- `/forms/[id]/edit` : modification du statut, de la dernière vérification et des notes d'un formulaire surveillé ;
- `/interventions` : liste des interventions globales ;
- `/interventions/new` : création d'une intervention liée à un site ;
- `/interventions/[id]` : fiche intervention, changement de statut et gestion d'items simples ;
- `/interventions/[id]/edit` : modification d'une intervention globale.

Le CRUD UI est limité aux clients, aux sites et aux interventions globales. L'import WPUR UI est limité au collage manuel d'un export JSON déjà produit par WPUR, validé puis stocké comme donnée externe liée au site.

Le suivi des sauvegardes est documentaire : l'application permet d'enregistrer le type, le statut, la date, le fournisseur, l'emplacement et les notes d'une sauvegarde, avec une liaison optionnelle à une intervention. WP Agency Ops ne lance pas de sauvegarde automatique, ne stocke aucun fichier de backup, ne se connecte pas à un hébergeur et ne fait pas de rollback.

Le suivi des formulaires est documentaire : l'application permet d'enregistrer les formulaires critiques, leur statut, leur dernière vérification, leurs destinataires attendus et leurs notes. WP Agency Ops ne teste pas automatiquement les formulaires, n'envoie pas de requêtes POST vers les formulaires et ne stocke aucune soumission.

Le contrôle sécurité est volontairement simple et non offensif : il vérifie l'URL du site, HTTPS, quelques en-têtes HTTP basiques, `/xmlrpc.php` et `/readme.html` avec des requêtes limitées et un timeout court. Il ne lance pas d'attaque, ne fait pas de brute force, ne scanne pas des chemins en masse et ne remplace pas un audit sécurité complet.

Le contrôle performance est volontairement simple : il mesure une réponse HTTP sur l'URL du site, stocke le statut HTTP, le temps de réponse et la taille déclarée via `content-length` si disponible. Il ne lance pas Lighthouse, PageSpeed, crawl multi-pages, test de charge, monitoring planifié ou alerte.

Le dashboard affiche WPUR en synthèse uniquement : période, date d'import et nombre d'alertes. Il ne détaille pas les plugins et ne remplace pas les rapports WPUR.

Les items d'intervention doivent rester génériques. Le détail maintenance plugins, les versions, comparaisons et rapports plugins restent dans WPUR.

Prochaines étapes à définir dans des tickets séparés, sans élargir le périmètre sans validation.

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
