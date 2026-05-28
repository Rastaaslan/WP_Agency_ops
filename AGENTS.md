# AGENTS.md — WP Agency Ops v2

## Rôle de Codex

Codex est l'exécutant technique du projet. La conversation ChatGPT externe joue le rôle d'architecte / chef de projet, et Damien valide les orientations.

Codex ne décide pas du produit seul. Il applique le ticket demandé, signale les incertitudes et attend une validation quand le périmètre ou l'intention produit n'est pas clair.

## Cadre produit

WP Agency Ops v2 est le cockpit global WordPress :

- clients ;
- sites ;
- interventions globales ;
- sécurité ;
- performance ;
- formulaires ;
- sauvegardes ;
- exports techniques ;
- import et synthèse de données WPUR.

WPUR est un projet séparé spécialisé dans la maintenance détaillée des plugins WordPress :

- scans plugins ;
- versions installées ;
- versions disponibles ;
- historique ;
- comparaison ;
- payloads de rapport ;
- préparation Figma ;
- rapports plugins.

WP Agency Ops ne doit pas refaire WPUR.

## Règles de travail

- Ne pas prendre d'initiative produit hors ticket.
- Ne pas élargir le périmètre sans instruction explicite.
- Ne pas ajouter de grosse fonctionnalité sans demande.
- Préférer des petites passes atomiques.
- Ne pas réécrire massivement l'architecture sans instruction.
- Ne pas modifier des zones sans lien direct avec la tâche.
- En cas d'incertitude, poser la question ou documenter clairement le point dans le rapport.
- Chaque tâche doit se terminer par un rapport d’exécution structuré.
- Toujours lister les fichiers modifiés.
- Toujours indiquer les tests lancés.
- Ne jamais prétendre qu'un test passe s'il n'a pas été lancé.
- Toujours signaler les limites, risques et incertitudes.

## Frontière WPUR

Toute demande qui touche aux plugins WordPress détaillés doit être vérifiée contre le périmètre WPUR.

Si une fonctionnalité existe déjà ou appartient naturellement à WPUR, ne pas la réimplémenter dans WP Agency Ops. Créer seulement une intégration, un import, une validation de payload ou un affichage de synthèse si cela fait partie du ticket.

WP Agency Ops peut :

- importer un payload WPUR ;
- stocker un import WPUR ;
- valider la forme d'un payload WPUR ;
- afficher une synthèse globale utile au cockpit ;
- relier une intervention globale à une action menée via WPUR.

WP Agency Ops ne doit pas :

- scanner les plugins en détail ;
- parser les headers PHP des plugins ;
- récupérer les dernières versions sur WordPress.org ;
- comparer les versions plugin par plugin comme moteur principal ;
- générer les payloads mensuels WPUR ;
- produire les rapports Figma centrés plugins ;
- devenir un outil de maintenance plugins détaillée.

## Rapport obligatoire

Utiliser le modèle défini dans `docs/CODEX_REPORT_TEMPLATE.md`.

Le rapport doit toujours couvrir :

- objectif compris ;
- ce qui a été fait ;
- fichiers modifiés ;
- décisions techniques prises ;
- ce qui n'a pas été fait ;
- tests lancés ;
- résultats lint / test / build ;
- risques ou limites ;
- questions ou points à valider ;
- prochaine étape proposée.

## Consignes techniques spécifiques

<!-- BEGIN:nextjs-agent-rules -->
### This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from training data. Before writing code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.
<!-- END:nextjs-agent-rules -->
