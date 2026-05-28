# WP Agency Ops Toolkit

WP Agency Ops Toolkit est un cockpit technique local pour freelances et agences qui maintiennent des sites WordPress pour leurs clients.

Le produit est **WordPress-first** et **static-ready** : WordPress reste le centre du workflow agence, tandis que l’application structure la maintenance, les scans, les interventions, les rapports, les formulaires critiques, les contrôles simples de sécurité/performance et la future publication statique.

## À qui ça sert

- Freelances WordPress qui veulent suivre plusieurs clients proprement.
- Agences qui veulent documenter leurs interventions techniques.
- Équipes qui veulent préparer une architecture évolutive sans lancer un SaaS complet dès le MVP.

## Ce que le MVP sait faire

- Dashboard avec clients, sites, scans, interventions, rapports et sites à surveiller.
- CRUD clients avec archivage.
- CRUD sites WordPress avec statut, environnement et mode de connexion.
- Scan WordPress via REST API publique `/wp-json`.
- Plugin compagnon WordPress minimal, en lecture seule, sous `wordpress-plugin/wp-agency-ops-companion`.
- Snapshot manuel WordPress quand le site n’est pas connecté.
- Historique de scans, plugins, thèmes et warnings.
- Interventions de maintenance avec items.
- Génération et édition de rapports Markdown, avec preview HTML.
- Export Markdown d’un rapport.
- Forms Watch manuel pour les formulaires critiques.
- Contrôle performance HTTP simple.
- Contrôle sécurité non intrusif : HTTPS, headers, `readme.html`, `xmlrpc.php`.
- Section Static Publish avec checklist et score de compatibilité.
- Interfaces préparées pour plugin compagnon, monitoring, déploiement, automatisation et publication statique.

## Ce que le MVP ne fait pas encore

- Pas d’auth multi-utilisateur.
- Pas de paiement, licence ou multi-tenant SaaS.
- Pas de mise à jour WordPress automatique.
- Pas de rollback automatique.
- Pas de scan offensif de vulnérabilités.
- Pas de PDF avancé.
- Pas de stockage chiffré de secrets applicatifs.

## Installation

```bash
npm install
```

Créez un fichier `.env` à partir de `.env.example` si nécessaire :

```bash
DATABASE_URL="file:./dev.db"
ALLOW_PRIVATE_NETWORK_TARGETS="false"
# WP_AGENCY_OPS_COMPANION_API_KEY=""
```

`ALLOW_PRIVATE_NETWORK_TARGETS=true` ne doit être utilisé qu’en local si vous voulez volontairement tester `localhost`, `127.0.0.1` ou une IP privée.

## Initialiser la base

```bash
npm run db:migrate
npm run db:seed
```

Le seed utilise des IDs fixes et des `upsert` : il ajoute/rafraîchit les données d’exemple sans supprimer vos propres données.

## Lancer l’application

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000).

## Commandes utiles

```bash
npm run dev
npm run doctor
npm run build
npm run start
npm run lint
npm run test
npm run plugin:lint
npm run plugin:zip
npm run db:migrate
npm run db:seed
npm run db:studio
```

`npm run doctor` vérifie rapidement l’environnement local : Node, npm, schéma Prisma, migration, fichier `.env.example` et syntaxe PHP du plugin compagnon.

## Utilisation rapide

1. Allez dans **Clients** puis ajoutez un client.
2. Allez dans **Sites WP** puis rattachez un site au client.
3. Ouvrez la fiche site et lancez **Scan REST public**.
4. Si le plugin compagnon est installé, choisissez le mode **companion_plugin** et renseignez une référence de secret comme `env:WP_AGENCY_OPS_COMPANION_API_KEY`.
5. Si REST public ne suffit pas, ajoutez un **snapshot manuel**.
6. Créez une **intervention** depuis la fiche site ou le menu Interventions.
7. Générez un **rapport** depuis la fiche site ou le menu Rapports.
8. Lancez un **check sécurité** depuis la fiche site.
9. Lancez un **check performance** depuis la fiche site.
10. Ajoutez un formulaire dans **Forms Watch**.
11. Complétez la checklist **Static Publish** sur la fiche site.

## Architecture technique

- Next.js App Router.
- TypeScript strict.
- SQLite local.
- Prisma ORM 7 avec adapter `better-sqlite3`.
- Zod pour validation serveur.
- Tailwind CSS pour l’interface.
- Server Actions pour les écrans applicatifs.
- Route handlers JSON sous `/api`.
- Vitest pour les tests.

Structure principale :

```txt
src/
  app/
    (dashboard)/
    api/
  components/
  features/
  lib/
  server/
prisma/
scripts/
docs/
```

## Limites actuelles

- Le mode REST public ne retourne généralement pas les plugins, thèmes et mises à jour. Le plugin compagnon corrige cela si la clé API est configurée.
- Les checks HTTP sont volontaires, courts et non agressifs.
- Les secrets sont représentés par une abstraction `SecretProvider`, mais aucun coffre chiffré n’est implémenté.
- Static Publish est une analyse/checklist, pas encore un générateur statique.
- Monitoring et déploiement sont préparés par interfaces, pas encore automatisés.

## Roadmap courte

- Améliorer la configuration multi-site des clés du plugin compagnon.
- Rapports PDF et templates agence.
- Monitoring planifié avec alertes.
- Screenshots avant/après intervention.
- Publication statique avec preview et rollback.
- Auth, multi-agence, rôles et licence si le produit devient SaaS.

Voir aussi [docs/ROADMAP.md](docs/ROADMAP.md) et [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
