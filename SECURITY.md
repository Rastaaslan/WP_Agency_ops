# Security Policy

## Supported scope

WP Agency Ops v2 is currently a technical skeleton. Security reports should focus
on the Next.js app shell, route handlers, dependency configuration, environment
handling, Prisma configuration, and local development tooling.

There is no WordPress scanner, no companion plugin, no WPUR import, no auth, and
no production data workflow in this branch yet.

## Reporting a vulnerability

Open a private security advisory on GitHub if available, or contact the
maintainer privately before publishing details. Do not include client data,
production secrets, API keys, database files, or WordPress backups in the report.

Please include:

- A short summary of the risk.
- Reproduction steps on a local or disposable environment.
- The affected area.
- Expected impact and any known workaround.

## Non-goals for the skeleton

This skeleton does not yet provide multi-user auth, SaaS tenant isolation,
encrypted secret storage, persistent rate limiting, automated WordPress actions,
plugin maintenance, or WPUR processing.
