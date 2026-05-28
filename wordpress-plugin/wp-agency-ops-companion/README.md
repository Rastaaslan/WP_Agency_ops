# WP Agency Ops Companion

Plugin WordPress minimal et en lecture seule pour WP Agency Ops Toolkit.

## Installation

1. Depuis le repo, generer l'archive avec `npm run plugin:zip`.
2. Installer `dist/wp-agency-ops-companion.zip` depuis l'administration WordPress ou copier le dossier `wp-agency-ops-companion` dans `wp-content/plugins/`.
3. Activer le plugin depuis l'administration WordPress.
4. Aller dans **Outils > WP Agency Ops**.
5. Copier la cle API.
6. Configurer l'application WP Agency Ops Toolkit avec le mode `companion_plugin`.

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
