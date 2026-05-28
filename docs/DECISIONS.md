# Décisions produit et architecture

## D-001 — WPUR reste isolé

WPUR reste un projet séparé. WP Agency Ops v2 ne doit pas absorber le moteur WPUR.

Conséquence : toute demande liée aux plugins WordPress détaillés doit être analysée avant implémentation pour éviter une duplication.

## D-002 — Pas de scan plugins détaillé dans WP Agency Ops

WP Agency Ops ne scanne pas les plugins WordPress en détail.

Conséquence : pas de scan local, pas de scan FTP, pas de parsing approfondi des dossiers ou fichiers plugins dans ce repo.

## D-003 — Pas de récupération WordPress.org des versions plugins

WP Agency Ops ne récupère pas les versions disponibles depuis WordPress.org.

Conséquence : la comparaison installée / disponible appartient à WPUR, sauf affichage d'une donnée déjà importée.

## D-004 — Import des payloads WPUR

WP Agency Ops importe les payloads produits par WPUR.

Conséquence : l'intégration acceptable concerne les types, validations, imports, stockages et affichages synthétiques des données WPUR.

## D-005 — WP Agency Ops gère le cockpit global

WP Agency Ops v2 gère le cockpit global WordPress :

- clients ;
- sites ;
- interventions ;
- sécurité ;
- performance ;
- formulaires ;
- sauvegardes ;
- exports.

Conséquence : les fonctionnalités doivent être évaluées selon leur utilité pour la supervision globale, pas selon leur capacité à remplacer WPUR.
