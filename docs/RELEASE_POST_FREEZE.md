# Note de release post-freeze — WP Agency Ops v2

## Statut actuel du projet

WP Agency Ops v2 est dans un état post-freeze propre sur la branche `rebuild/v2-clean`.

Le tag `mvp-local-freeze` reste le point stable historique du MVP local. La branche `rebuild/v2-clean` contient ce MVP local, puis les améliorations post-freeze validées autour du confort utilisateur, du wording et de la lisibilité.

Dernières vérifications connues :

```bash
npx prisma validate
npm run lint
npm run test
npm run build
```

Résultat attendu à ce stade : OK.

## Différence entre `mvp-local-freeze` et `rebuild/v2-clean`

`mvp-local-freeze` conserve l'état gelé du MVP local.

`rebuild/v2-clean` représente l'état courant de travail après freeze. Elle ajoute surtout :

- des confirmations avant actions sensibles ;
- des notices de succès plus visibles ;
- un wording plus clair et moins technique ;
- une page de suivi technique plus lisible ;
- une page utilisateur `État de l'application` ;
- des ajustements de tests liés aux libellés visibles.

Ces changements améliorent la compréhension de l'application sans changer le périmètre métier du MVP.

## Fonctionnalités présentes

- Tableau de bord de synthèse.
- Gestion des clients.
- Gestion des sites.
- Suivis techniques liés aux sites.
- Import manuel d'un export WPUR.
- Synthèse WPUR dans le cockpit.
- Suivi manuel des sauvegardes.
- Suivi manuel des formulaires surveillés.
- Contrôles sécurité simples.
- Contrôles performance simples.
- Export de l'état technique d'un site.
- Page `État de l'application` pour vérifier que l'application locale répond.

## Améliorations UX post-freeze

- Confirmations avant archivage client ou site.
- Confirmations avant annulation ou lancement d'actions sensibles quand applicable.
- Notices locales après création, modification, archivage ou lancement d'un contrôle.
- Messages d'erreur plus rassurants et moins techniques.
- Wording visible harmonisé autour de termes comme `Suivis techniques`, `à surveiller`, `point à vérifier`, `export WPUR` et `état technique du site`.
- Page détail de suivi technique réorientée lecture d'abord.
- Bloc explicatif `Pourquoi cette fiche existe ?`.
- Actions à faire ou vérifier présentées comme une liste lisible.
- Formulaire d'ajout d'action rendu moins dominant.
- Page `État de l'application` reliée depuis la navigation et le tableau de bord.

## Ce qui reste hors scope

WP Agency Ops v2 ne remplace pas WPUR.

Restent hors scope :

- scan WordPress ;
- scan plugins ;
- comparaison détaillée plugin par plugin ;
- rapport plugin détaillé ;
- payload Figma ;
- exécution WPUR ;
- backup réel ;
- monitoring planifié ;
- alertes ;
- authentification ;
- SaaS ;
- paiement ;
- déploiement production.

## Commandes utiles pour lancer la démo

Installer les dépendances :

```bash
npm install
```

Préparer la base locale :

```bash
npm run db:migrate
npm run db:seed
```

Démarrer l'application :

```bash
npm run dev
```

Ouvrir ensuite :

```txt
http://localhost:3000
```

Pages utiles pendant la démo :

```txt
/
/clients
/sites
/interventions
/etat-application
/api/health
```

## Prochaines pistes possibles

- Relire le scénario de démonstration après plusieurs jours pour vérifier qu'il reste clair.
- Ajouter une capture ou courte checklist de démo si le projet doit être transmis.
- Continuer les micro-ajustements UX uniquement après retour utilisateur.
- Préparer une étape dédiée si un jour le projet doit sortir du cadre local.

