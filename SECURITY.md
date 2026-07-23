# Security policy

Mælk is an early-stage public project for a Denmark-first, open-source, AI-native ERP platform for commerce operations. Please treat security, privacy, credentials, accounting data, and live operational data as human-gated areas.

## Reporting a vulnerability

Report suspected vulnerabilities through GitHub Private Vulnerability Reporting:

<https://github.com/tinyleed/maelk/security/advisories/new>

Do not open a public issue, discussion, or pull request with exploit details, secrets, private data, or reproduction material.

Include, when available:

- a concise description and potential impact;
- the affected commit, version, route, package, or configuration;
- safe reproduction steps or a minimal proof of concept;
- whether credentials, tenant boundaries, sessions, accounting data, or live integrations may be affected;
- suggested remediation or disclosure constraints;
- a private contact path for follow-up.

A maintainer will acknowledge the private report, coordinate validation and remediation, and decide when any public disclosure is safe.

## What not to include publicly

Never post or commit:

- secrets, credentials, tokens, private keys, or `.env` values;
- production data, customer/supplier private data, ledger/accounting records, VAT/reporting details, or internal account details;
- live integration payloads that identify real systems or people;
- DNS, hosting, deployment, payment, or branch-protection changes that have not been approved.

## Supported versions

Mælk does not have a stable release line yet. Security fixes are handled on `main` and scoped release branches only when maintainers create them.

## Maintainer response goals

For credible reports, maintainers should:

- acknowledge receipt as soon as practical;
- preserve private details until disclosure is approved;
- create a small, reviewable fix branch;
- run the repo harness and relevant tests;
- document impact and follow-up tasks before merge/release.

Human approval remains required for production, deploy, go-live, accounting-impacting, compliance, pricing, and release decisions.
