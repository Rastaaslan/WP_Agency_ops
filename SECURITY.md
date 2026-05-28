# Security Policy

## Supported scope

WP Agency Ops Toolkit is currently a local MVP. Security fixes are accepted for
the current default branch and active Codex feature branches.

The WordPress companion plugin is read-only by design. Reports should focus on
issues that could expose secrets, bypass the companion API key, trigger unsafe
network access, corrupt local data, or make the application perform unexpected
WordPress actions.

## Reporting a vulnerability

Open a private security advisory on GitHub if available, or contact the
maintainer privately before publishing details. Do not include client data,
production secrets, API keys, database files, or full WordPress backups in the
report.

Please include:

- A short summary of the risk.
- Reproduction steps on a local or disposable environment.
- Affected area: app, route handler, WordPress connector, companion plugin, or
  tooling.
- Expected impact and any known workaround.

## Non-goals for the MVP

This MVP does not yet provide multi-user auth, SaaS tenant isolation, encrypted
secret storage, persistent rate limiting, or automated WordPress updates.

See [docs/SECURITY_NOTES.md](docs/SECURITY_NOTES.md) for implementation notes
and the current pre-SaaS hardening checklist.
