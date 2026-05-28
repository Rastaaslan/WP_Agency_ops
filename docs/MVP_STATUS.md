# Statut MVP local — WP Agency Ops v2

## État MVP local

WP Agency Ops v2 est démontrable comme cockpit global WordPress local. Le MVP couvre le suivi client/site, les interventions globales, les signaux opérationnels et l'import de synthèses WPUR, sans réimplémenter le moteur WPUR.

## Fonctionnalités livrées

- Dashboard synthèse avec KPIs, interventions à suivre, derniers sites, derniers imports WPUR et points à surveiller.
- CRUD UI clients avec création, modification et archivage logique.
- CRUD UI sites avec création, modification et archivage logique.
- CRUD UI interventions globales avec statut et items génériques.
- Import manuel d'un export WPUR JSON, validation serveur, stockage et synthèse sur la fiche site.
- Suivi manuel des sauvegardes documentées.
- Suivi manuel des formulaires critiques.
- Contrôles sécurité simples et non offensifs.
- Contrôles performance simples.
- État technique du site exposé en JSON via l'API existante.
- Seed réaliste et scénario de démo autour d'Atelier Nova.

## Ce qui est démontrable

- Ouvrir le dashboard et lire les signaux principaux.
- Naviguer vers Atelier Nova, son site principal et les interventions liées.
- Créer ou modifier un client, un site, une intervention, une sauvegarde et un formulaire surveillé.
- Importer manuellement un export WPUR produit par l'outil WPUR.
- Lancer un contrôle sécurité simple et un contrôle performance simple.
- Consulter l'état technique global d'un site.

## Frontière WPUR

WPUR reste l'outil spécialisé pour la maintenance détaillée des plugins WordPress : scans, versions installées, versions disponibles, historique, comparaison, préparation Figma et rapports plugins.

WP Agency Ops v2 reste le cockpit global : clients, sites, interventions, sauvegardes, formulaires, sécurité, performance, états techniques et synthèse WPUR.

WP Agency Ops v2 importe WPUR, mais ne le remplace pas. Le repo ne doit pas ajouter de scan plugins, lookup WordPress.org, comparaison plugin par plugin, rapport plugin détaillé ou génération de payload Figma.

## Hors scope MVP

- Scan WordPress ou scan plugins.
- Rapport plugin détaillé ou préparation Figma.
- Backup automatique, upload de fichiers de sauvegarde ou rollback.
- Tests automatiques de formulaires.
- Monitoring planifié et alertes email, Slack ou Discord.
- Authentification, multi-utilisateur, SaaS, paiement ou licence.
- Déploiement production.

## Limites connues

- L'application cible une utilisation locale de démonstration.
- SQLite est utilisé en local, avec une vigilance particulière si un ancien `dev.db` v1 existe.
- `npm run db:migrate` peut échouer dans cet environnement avec `Schema engine error:` sans détail ; les migrations SQL versionnées ont été vérifiées manuellement sur base temporaire, mais ce point reste à corriger avant packaging.
- Les contrôles sécurité et performance sont volontairement simples et ne remplacent pas un audit complet.
- Les imports WPUR sont manuels : WP Agency Ops ne lance pas WPUR.
- L'état technique est encore une réponse JSON d'API, pas encore une restitution client mise en page.
- L'archivage est logique ; il n'y a pas de suppression métier exposée dans l'UI.

## Commandes utiles

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Vérifications :

```bash
npx prisma validate
npm run lint
npm run test
npm run build
```

En cas d'ancienne base locale v1, sauvegarder `dev.db` manuellement avant de repartir sur une base propre :

```powershell
Move-Item -LiteralPath dev.db -Destination dev-v1-backup.db
```

## Prochaine roadmap

### Court terme

- Polish UX final et confirmations sur les actions sensibles.
- Messages d'erreur encore plus guidants.
- État technique plus lisible pour une restitution client.
- Petites corrections issues des démonstrations.

### Moyen terme

- Authentification.
- Multi-utilisateur.
- Packaging local plus simple.
- Licence.
- Déploiement contrôlé.

### Hors scope MVP

- Scan plugins.
- Rapport plugin Figma.
- Backup réel.
- Monitoring planifié.
- SaaS complet.
