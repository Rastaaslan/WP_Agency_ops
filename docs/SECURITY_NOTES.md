# Notes de sécurité

## Principes MVP

- Toutes les entrées serveur passent par Zod.
- Les URLs sont normalisées.
- Les checks HTTP utilisent un timeout court.
- Le user-agent est explicite.
- Aucun scan offensif.
- Aucun brute force.
- Aucune mise à jour WordPress automatique.
- Aucun secret sensible en dur.
- Les clés du plugin compagnon passent par variables d'environnement côté app.

## SSRF et réseau privé

Par défaut, les checks bloquent les cibles qui ressemblent à :

- `localhost`
- `127.0.0.1`
- `0.0.0.0`
- `::1`
- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- `169.254.0.0/16`
- domaines `.local`

En local uniquement, vous pouvez définir :

```bash
ALLOW_PRIVATE_NETWORK_TARGETS="true"
```

## Limites

- Le blocage SSRF est une barrière pragmatique, pas une défense SaaS complète.
- Il n’y a pas encore d’authentification.
- Il n’y a pas encore de rate limiting persistant.
- Le stockage chiffré de secrets n’est pas implémenté.
  Le MVP accepte des références `env:VARIABLE` pour éviter d'enregistrer les clés dans SQLite.

## Avant un passage SaaS

- Ajouter auth et autorisation sur chaque Server Action et route API.
- Ajouter rate limiting.
- Ajouter audit logs.
- Ajouter coffre de secrets.
- Vérifier DNS/IP après résolution pour renforcer l’anti-SSRF.
- Isoler les jobs réseau.
- Ajouter monitoring et alerting.
