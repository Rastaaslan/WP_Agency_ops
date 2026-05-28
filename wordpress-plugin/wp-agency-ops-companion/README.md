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
/wp-json/wp-agency-ops/v1/site-info
```

## Donnees exposees

- Version WordPress.
- Version PHP.
- Theme actif.
- Locale, timezone, type d'environnement et mode debug.
- Nombre de plugins actifs/inactifs.
- Plugins installes, statut actif, auteur, URL, version et update disponible.
- Themes installes, theme actif, parent/enfant et update disponible.
- Updates disponibles pour core, plugins, themes et traductions depuis les transients WordPress.
- Synthese `site-info` pour le dashboard et les rapports.

## Exemple curl

```bash
curl \
  -H "X-WP-Agency-Ops-Key: votre-cle-api" \
  https://votre-site.test/wp-json/wp-agency-ops/v1/site-info
```

## Limites

- Lecture seule.
- Aucun declenchement de mise a jour.
- Aucun backup.
- Aucun rollback.
- Aucun scan offensif.

## Securite

La cle API est generee a l'activation et peut etre regeneree depuis l'administration. Ne l'envoyez qu'a une instance de confiance de WP Agency Ops Toolkit.
