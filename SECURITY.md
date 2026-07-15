# Security policy

Mælk is an early-stage public project for a Denmark-first, open-source, AI-native ERP platform for commerce operations. Please treat security, privacy, credentials, accounting data, and live operational data as human-gated areas.

## Reporting a vulnerability

If you believe you found a security issue, do not open a public issue with exploit details or secrets.

Instead:

1. Open a minimal GitHub issue that says a private security report is needed, without sensitive details; or
2. Contact the maintainers through the private channel Mads/ANANKE has approved for the project.

A maintainer will acknowledge the report, decide the private handling path, and coordinate any public disclosure after a fix is ready.

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
