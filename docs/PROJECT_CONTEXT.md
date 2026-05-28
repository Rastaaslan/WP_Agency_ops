# Contexte projet — WP Agency Ops v2

## WP Agency Ops v2

WP Agency Ops v2 est un cockpit global pour piloter un parc de sites WordPress côté agence.

Son rôle est de donner une vue transversale sur les clients, les sites, l'état global, les interventions, la sécurité, la performance, les formulaires, les sauvegardes, les exports techniques et les données importées depuis WPUR.

Le projet doit rester centré sur la supervision et l'orchestration globale. Il ne doit pas devenir un moteur spécialisé de maintenance de plugins.

## WPUR

WPUR est un projet séparé spécialisé dans la maintenance détaillée des plugins WordPress.

WPUR couvre notamment :

- le scan local ou FTP des plugins ;
- les versions installées ;
- les versions disponibles ;
- l'historique ;
- la comparaison des versions ;
- la préparation de payloads mensuels ;
- la préparation Figma ;
- les rapports centrés plugins.

## Pourquoi les deux projets restent séparés

La séparation évite de dupliquer deux moteurs métier dans un même outil.

WPUR garde la logique fine et spécialisée autour des plugins. WP Agency Ops garde la vue cockpit : état global, priorisation, suivi, intervention et restitution synthétique.

Cette frontière permet de faire évoluer WPUR sans alourdir WP Agency Ops, et de faire évoluer WP Agency Ops sans réimplémenter le métier plugin.

## Ce que WP Agency Ops ajoute au-dessus de WPUR

WP Agency Ops peut consommer des données WPUR pour enrichir la vue globale d'un site ou d'un client.

Il peut notamment :

- importer un payload WPUR ;
- valider la structure d'un import WPUR ;
- stocker un import WPUR lié à un site ;
- afficher une synthèse utile au pilotage global ;
- relier une intervention à une maintenance réalisée via WPUR ;
- intégrer les signaux WPUR dans des exports techniques globaux.

## Hors périmètre

WP Agency Ops v2 ne doit pas implémenter :

- un scanner détaillé de plugins WordPress ;
- un scanner FTP de plugins ;
- le parsing des headers PHP de plugins ;
- la récupération des dernières versions sur WordPress.org ;
- la comparaison détaillée des versions plugin par plugin ;
- la génération du payload mensuel WPUR ;
- la préparation Figma centrée plugins ;
- les rapports spécialisés plugins ;
- un moteur complet de maintenance plugins.

Les fonctionnalités ci-dessus doivent rester dans WPUR, ou être exposées à WP Agency Ops sous forme d'import, de synthèse ou d'intégration explicite.
