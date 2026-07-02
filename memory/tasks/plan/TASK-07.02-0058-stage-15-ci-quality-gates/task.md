# TASK-07.02-0058: Stage 15 CI quality gates

Status: done
Type: chore
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Add GitHub Actions CI quality gates for the repository without adding publish behavior.

## Product Context

Stage 15 release readiness needs CI gates that prove the package workspace builds, tests,
typechecks and lints before package dry-run or release workflows are trusted.

## Scope

- Add `.github/workflows/ci.yml` or equivalent CI workflow.
- Run `pnpm install` through a deterministic lockfile-aware workflow.
- Run relevant root checks: build, test, typecheck, lint and formatting if appropriate.
- Use a maintained Node.js version and pnpm/corepack setup compatible with the repository.
- Keep CI workflow independent from npm publishing and release credentials.
- Document local verification and any workflow limitations in the task result.
- Update task run result memory after implementation.

## Out of Scope

- Adding npm publish workflow.
- Adding release tags, Changesets release PR behavior or provenance publishing.
- Managing GitHub repository settings or branch protection.
- Changing runtime behavior or public API.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] CI workflow exists under `.github/workflows/`.
- [ ] CI installs dependencies using lockfile-aware pnpm workflow.
- [ ] CI runs build, test, typecheck and lint, unless a task-level reason documents a
  different minimal gate.
- [ ] CI does not publish packages or require npm secrets.
- [ ] Local commands equivalent to CI gates are run or their limitations are documented.
- [ ] Workflow YAML is reviewed or validated where practical.

## Linked Memory

- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/testing.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.02-0057-stage-15-changesets-versioning-changelog/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for CI quality gates.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
