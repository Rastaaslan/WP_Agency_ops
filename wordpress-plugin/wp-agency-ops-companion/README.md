# WP Agency Ops Companion

Plugin WordPress minimal et en lecture seule pour WP Agency Ops Toolkit.

## Installation

1. Copier le dossier `wp-agency-ops-companion` dans `wp-content/plugins/`.
2. Activer le plugin depuis l'administration WordPress.
3. Aller dans **Outils > WP Agency Ops**.
4. Copier la cle API.
5. Configurer l'application WP Agency Ops Toolkit avec le mode `companion_plugin`.

## Endpoints

Tous les endpoints demandent le header :

```txt
X-WP-Agency-Ops-Key: votre-cle-api
```

Routes :

```txt
/wp-json/wp-agency-ops/v1/health
/wp-json/wp-agency-ops/v1/plugins
/wp-json/wp-agency-ops/v1/themes
/wp-json/wp-agency-ops/v1/updates
```

## Donnees exposees

- Version WordPress.
- Version PHP.
- Theme actif.
- Plugins installes et actifs.
- Themes installes.
- Updates disponibles depuis les transients WordPress.

## Limites

- Lecture seule.
- Aucun declenchement de mise a jour.
- Aucun backup.
- Aucun rollback.
- Aucun scan offensif.

## Securite

La cle API est generee a l'activation et peut etre regeneree depuis l'administration. Ne l'envoyez qu'a une instance de confiance de WP Agency Ops Toolkit.
