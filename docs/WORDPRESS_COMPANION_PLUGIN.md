# Plugin compagnon WordPress

Le MVP livre un plugin compagnon minimal dans `wordpress-plugin/wp-agency-ops-companion`. Il expose des endpoints REST en lecture seule et protégés par clé API.

## Objectif du plugin

Le plugin devra exposer en lecture seule :

- version WordPress ;
- version PHP ;
- liste des plugins ;
- liste des thèmes ;
- mises à jour disponibles ;
- état de santé WordPress ;
- état des backups ;
- recommandations simples ;
- logs de lecture.

## Endpoints disponibles

```txt
/wp-json/wp-agency-ops/v1/health
/wp-json/wp-agency-ops/v1/plugins
/wp-json/wp-agency-ops/v1/themes
/wp-json/wp-agency-ops/v1/updates
```

## Sécurité

- Clé API générée côté WordPress à l'activation.
- Header `X-WP-Agency-Ops-Key`.
- Aucune action destructive.
- Lecture seule.
- Pas de mise à jour automatique.
- Rotation manuelle de clé.

## Structure actuelle

```txt
wordpress-plugin/
  wp-agency-ops-companion/
    wp-agency-ops-companion.php
    README.md
```

## Configuration côté app

1. Installer et activer le plugin.
2. Copier la clé depuis **Outils > WP Agency Ops**.
3. Ajouter la clé dans `.env`, par exemple :

```bash
WP_AGENCY_OPS_COMPANION_API_KEY="copiez-la-cle-ici"
```

4. Dans la fiche site, sélectionner `companion_plugin`.
5. Renseigner `env:WP_AGENCY_OPS_COMPANION_API_KEY` comme référence de secret.

## Prochaines améliorations

- Stockage chiffré de secrets côté app.
- Référence de secret par site sans variable globale.
- Endpoint santé plus détaillé.
- État des backups.
- Logs de lecture plus complets.
