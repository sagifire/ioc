# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-02

## Goal for This Run

Create and update repository governance artifacts for Stage 15.

## Clarified Requirements

- Use Apache License 2.0.
- Protect `@sagifire/ioc` as a product mark.
- Use GitHub Issues as the primary ordinary project contact/support channel.
- Do not claim formal trademark registration unless explicitly confirmed by the human.
- Do not ask users to disclose secrets or sensitive vulnerability details publicly.

## Scope for This Run

- `LICENSE`.
- `NOTICE`.
- Package `LICENSE` / `NOTICE` files.
- `CONTRIBUTING.md`.
- `SECURITY.md`.
- `TRADEMARKS.md`.
- Publishable package `package.json` license fields if still `UNLICENSED`.
- Narrow README/package README governance links if needed.
- Task run result memory after implementation.

## Out of Scope for This Run

- Changesets/versioning/changelog setup.
- GitHub Actions CI or release workflows.
- Package publish metadata beyond license fields.
- npm publish or publish dry-runs.
- Repository settings, npm settings, secrets or token management.
- Runtime behavior or public API changes.

## Acceptance Criteria for This Run

- [ ] Apache 2.0 replaces placeholder license text.
- [ ] NOTICE files are no longer placeholders.
- [ ] Contribution, security and trademark docs exist.
- [ ] Package license metadata matches Apache 2.0.
- [ ] GitHub Issues contact decision is documented.
- [ ] Product mark usage is documented without unsupported legal claims.
- [ ] Formatting/stale-placeholder verification is recorded in `result.md`.

## Changes from Previous Run

Не застосовується для RUN-001.
