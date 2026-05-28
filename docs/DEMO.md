# Démo WP Agency Ops v2

Ce scénario montre WP Agency Ops v2 comme cockpit global WordPress.

WPUR reste l'outil spécialisé pour la maintenance détaillée des plugins. WP Agency Ops importe seulement une synthèse WPUR et la replace dans une vue globale client/site/interventions.

## Préparer la démo

Installer les dépendances :

```bash
npm install
```

Créer ou vérifier `.env` :

```bash
DATABASE_URL="file:./dev.db"
```

Si `dev.db` contient une ancienne base locale v1, ne forcez pas de reset. Renommez-la d'abord :

```powershell
Move-Item -LiteralPath dev.db -Destination dev-v1-backup.db
```

Préparer la base et charger les données de démo :

```bash
npm run db:migrate
npm run db:seed
```

Si `npm run db:migrate` renvoie `Schema engine error:` sans détail, ne supprimez pas `dev.db` automatiquement. C'est une limite locale connue à traiter avant packaging ; les migrations SQL versionnées restent la source à vérifier sur une base propre.

Démarrer l'application :

```bash
npm run dev
```

Ouvrir ensuite :

```txt
http://localhost:3000
```

## Scénario à montrer

1. Ouvrir le dashboard.
2. Montrer les KPIs : clients actifs, sites actifs, interventions ouvertes, sites suivis récemment.
3. Montrer les signaux opérationnels : imports WPUR récents, sauvegardes, formulaires, sécurité, performance.
4. Montrer les actions rapides.
5. Ouvrir le client `Atelier Nova`.
6. Ouvrir le site `Site vitrine Atelier Nova`.
7. Montrer les interventions :
   - maintenance générale mensuelle terminée ;
   - suivi formulaire contact en cours ;
   - contrôle technique à surveiller.
8. Montrer la section WPUR :
   - période ;
   - alertes ;
   - date d'import ;
   - rappel que WPUR reste la source de vérité pour les rapports détaillés plugins.
9. Montrer les sauvegardes :
   - sauvegarde complète récente ;
   - sauvegarde base de données ;
   - sauvegarde à statut inconnu.
10. Montrer les formulaires surveillés :
    - formulaire de contact OK ;
    - demande de devis à vérifier.
11. Montrer les contrôles sécurité et performance.
12. Ouvrir l'état technique du site depuis la fiche site.

## Message produit à expliquer

WP Agency Ops v2 est le cockpit global WordPress :

- clients ;
- sites ;
- interventions ;
- sauvegardes ;
- formulaires ;
- sécurité ;
- performance ;
- imports WPUR ;
- état technique global du site.

WPUR reste séparé et spécialisé plugins :

- versions ;
- mises à jour ;
- historique ;
- comparaison ;
- rapports détaillés plugins.

WP Agency Ops ne scanne pas les plugins et ne génère pas les rapports WPUR. Il importe les données WPUR et les affiche comme signal de pilotage global.
