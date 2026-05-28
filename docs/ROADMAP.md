# Roadmap produit

## Phase 1 - Toolkit local

- Clients.
- Sites WordPress.
- Scans REST publics et snapshots manuels.
- Interventions.
- Rapports Markdown et HTML.
- Forms Watch manuel.
- Checks securite et performance simples.
- Suivi manuel des sauvegardes fichiers/base.
- Import manuel de payload WPUR JSON avec synthese cockpit.
- Export technique JSON global par site.
- Workflow demo scan -> intervention -> rapport. Livre.

## Phase 2 - Plugin compagnon WordPress

- Endpoints securises par cle API. MVP minimal livre.
- Version WordPress/PHP. MVP minimal livre.
- Plugins, themes et mises a jour. MVP minimal livre via transients WordPress.
- Endpoint `site-info` et synthese exploitable par les scans. Livre pour demo.
- Etat des backups remonte par le plugin compagnon.
- Sante WordPress avancee.
- Logs de lecture.

## Phase 3 - Maintenance assistee

- Backup avant update avec checklist guidee.
- Mise a jour plugin par plugin, assistee mais non automatique.
- Journal technique.
- Screenshots avant/apres.
- Rollback manuel guide.

## Phase 3 bis - Integration WPUR

- Import JSON WPUR manuel. Livre.
- Historique des imports WPUR par site. Livre.
- Synthese WPUR dans le cockpit site. Livre.
- Liaison optionnelle entre intervention plugin maintenance et import WPUR. Prepare.
- Worker externe WPUR via CLI. A etudier plus tard.
- Module interne WPUR. Non planifie pour le MVP.

## Phase 4 - Rapports avances

- Export PDF.
- Templates agence.
- Marque blanche.
- Envoi email client.
- Planification mensuelle.

## Phase 5 - Monitoring

- Uptime planifie.
- Tests de formulaires.
- Alertes email, Slack ou Discord.
- Historique uptime.

## Phase 6 - Static Publish

- Analyse de compatibilite.
- Export statique.
- Preview.
- Formulaires statiques.
- Deploiement.
- Rollback.

## Phase 7 - SaaS / licence

- Auth.
- Multi-agence.
- Facturation.
- Licences.
- Roles.
- Hebergement cloud.

## Prochain palier conseille

1. Stabiliser le format WPUR importe avec plusieurs payloads reels.
2. Export PDF et templates de rapport agence.
3. Backup assiste avant intervention.
4. Monitoring planifie.
5. Alertes email, Slack ou Discord.
