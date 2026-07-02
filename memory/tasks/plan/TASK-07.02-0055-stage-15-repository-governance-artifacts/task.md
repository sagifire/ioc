# TASK-07.02-0055: Stage 15 repository governance artifacts

Status: done
Type: chore
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати першу частину Stage 15: repository governance artifacts for Apache 2.0
licensing, product mark protection, contribution flow and security policy.

## Product Context

Stage 15 starts with governance artifacts because later publish metadata, package dry-runs
and npm publish workflow should not ship packages with placeholder license/contact/trademark
state.

Product decisions:

- license: Apache License 2.0;
- product mark: `@sagifire/ioc`;
- primary project contact/support channel: GitHub Issues.

## Scope

- Replace placeholder root `LICENSE` with Apache License 2.0 text.
- Replace package `LICENSE` placeholders with the chosen Apache 2.0 license approach.
- Update root and package `NOTICE` files with appropriate project/package notice text.
- Add root `CONTRIBUTING.md`.
- Add root `SECURITY.md`.
- Add root `TRADEMARKS.md`.
- Update package manifests from `UNLICENSED` to `Apache-2.0` if not already handled.
- Record GitHub Issues as primary contact/support channel for ordinary project questions,
  bugs and feature requests.
- In `SECURITY.md`, avoid asking users to paste secrets or exploitable vulnerability
  details into public issues; document the safest repository-available path and record a
  follow-up if private vulnerability reporting must be enabled outside the repository.
- Document `@sagifire/ioc` as a product mark and define allowed/reserved usage without
  claiming formal trademark registration unless the human provides that confirmation.
- Update README/package docs links only if needed to avoid dangling or undiscoverable
  governance documents.
- Update task run result memory after implementation.

## Out of Scope

- Implementing Changesets, versioning or changelog automation.
- Adding GitHub Actions CI or release workflows.
- Running package publish or package dry-run validation beyond artifact-level checks.
- Changing runtime behavior, public API or package exports.
- Managing GitHub repository settings, npm organization settings, secrets or tokens.
- Providing legal advice beyond documenting the chosen project policy.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Root `LICENSE` contains Apache License 2.0 text.
- [x] Publishable package license files are aligned with Apache 2.0.
- [x] Root and package `NOTICE` files no longer contain Stage 2 placeholder language.
- [x] Package manifests use `Apache-2.0` for publishable packages.
- [x] `CONTRIBUTING.md` exists and points ordinary support/contact to GitHub Issues.
- [x] `SECURITY.md` exists and does not encourage public disclosure of secrets or sensitive
  exploit details.
- [x] `TRADEMARKS.md` exists and protects `@sagifire/ioc` as a product mark without false
  registration claims.
- [x] README/package docs links to governance artifacts are updated where needed.
- [x] Formatting and stale-placeholder checks pass.
- [x] `pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm lint` are run if affected
  files or repo workflow require them; otherwise the run result documents why not.

## Linked Memory

- `memory/product/vision.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for repository governance artifacts.
  - Result: approved after task-level human review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
