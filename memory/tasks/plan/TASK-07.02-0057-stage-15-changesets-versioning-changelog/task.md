# TASK-07.02-0057: Stage 15 Changesets versioning and changelog

Status: done
Type: chore
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Set up package versioning and changelog generation for the pnpm monorepo without publishing
packages yet.

## Product Context

Stage 15 release automation requires a repeatable way to decide package versions and
generate changelog entries before CI dry-run validation and publish workflow tasks.

Planning default: use Changesets. If Changesets is blocked by a concrete technical reason,
the run may document and implement an equivalent alternative, but it must sync that
decision back to Project Memory.

## Scope

- Add Changesets tooling or a documented equivalent.
- Configure versioning strategy for `@sagifire/ioc`, `@sagifire/ioc-next` and
  `@sagifire/ioc-testing`.
- Prefer synchronized public package versions unless the run documents a concrete reason
  for independent versioning.
- Add root scripts for creating changesets and applying version/changelog updates.
- Configure changelog generation for repository/package release notes.
- Keep generated changes readable and human-reviewable.
- Request network/dependency installation permission if tooling is not already installed.
- Update task run result memory after implementation.

## Out of Scope

- Publishing packages.
- Adding GitHub Actions release workflow.
- Adding CI quality gates beyond scripts needed for versioning.
- Changing runtime behavior or public API.
- Inventing npm credentials or repository secrets.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Versioning/changelog tool is configured.
- [ ] Versioning strategy for all publishable packages is documented in repo files or task
  result.
- [ ] Root scripts expose the expected versioning/changelog commands.
- [ ] Changelog generation can be run locally or the task result documents the exact
  blocker.
- [ ] No actual npm publish is performed.
- [ ] Dependency installation, if needed, is done with explicit permission.
- [ ] Relevant formatting/build/typecheck/lint/test decisions are recorded.

## Linked Memory

- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.02-0056-stage-15-package-publish-metadata/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for Changesets/versioning/changelog setup.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
