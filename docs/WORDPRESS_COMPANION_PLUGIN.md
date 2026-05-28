# Plugin compagnon WordPress

Le MVP ne livre pas encore le plugin compagnon afin de garder la première version robuste et simple. L’architecture est prête via `WordPressConnector`, `CompanionPluginWordPressConnector` et `SecretProvider`.

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

## Endpoints prévus

```txt
/wp-json/wp-agency-ops/v1/health
/wp-json/wp-agency-ops/v1/plugins
/wp-json/wp-agency-ops/v1/themes
/wp-json/wp-agency-ops/v1/updates
```

## Sécurité prévue

- Clé API générée côté WordPress.
- Header `X-WP-Agency-Ops-Key`.
- Aucune action destructive.
- Lecture seule au début.
- Pas de mise à jour automatique.
- Rotation manuelle de clé.

## Structure future

```txt
wordpress-plugin/
  wp-agency-ops-companion/
    wp-agency-ops-companion.php
    includes/
      class-rest-controller.php
      class-auth.php
      class-readers.php
    README.md
```

## Étapes d’implémentation

1. Créer le plugin minimal.
2. Ajouter la clé API dans les options WordPress.
3. Protéger toutes les routes REST custom.
4. Retourner uniquement des données de lecture.
5. Ajouter le mode `companion_plugin` dans l’application.
6. Stocker une référence de secret via `SecretProvider`.
7. Ajouter tests et documentation d’installation.
