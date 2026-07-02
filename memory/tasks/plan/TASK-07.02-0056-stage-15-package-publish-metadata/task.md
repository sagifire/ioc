# TASK-07.02-0056: Stage 15 package publish metadata

Status: done
Type: chore
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Make publishable package manifests and package contents metadata ready for npm packaging
without adding versioning automation or publishing workflows yet.

## Product Context

After governance artifacts exist, package metadata must consistently describe repository,
license, support/contact and package contents before Changesets, dry-run validation and
publish automation rely on it.

## Scope

- Update publishable package manifests for `@sagifire/ioc`, `@sagifire/ioc-next` and
  `@sagifire/ioc-testing`.
- Add or verify `repository`, `homepage`, `bugs`, `keywords`, `publishConfig` and package
  file contents fields where appropriate.
- Use GitHub Issues as package `bugs.url` / ordinary support contact.
- Keep root workspace package private.
- Preserve ESM, `sideEffects: false`, package exports and package boundary rules.
- Ensure package `files` includes intended release artifacts and excludes accidental
  workspace-only files.
- Avoid changing package versions unless the run documents why a metadata task must do it.
- Update docs if metadata changes make current package docs inaccurate.
- Update task run result memory after implementation.

## Out of Scope

- Adding Changesets or release versioning flow.
- Generating changelog entries.
- Adding GitHub Actions CI or publish workflows.
- Running npm publish.
- Reworking package exports or public API.
- Changing runtime behavior.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] All publishable package manifests have consistent license/repository/homepage/bugs
  metadata.
- [x] `bugs.url` points to GitHub Issues.
- [x] Public package access policy is explicit where needed.
- [x] Root workspace remains private.
- [x] Package `files` entries are intentional and include release docs/artifacts.
- [x] Package exports remain tree-shaking friendly and unchanged unless a narrow metadata
  need is documented.
- [x] Package manifests parse and package metadata checks pass.
- [x] Relevant build/typecheck/lint/test decisions are recorded.

## Linked Memory

- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.02-0055-stage-15-repository-governance-artifacts/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for package publish metadata.
  - Result: approved after task-level human review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
