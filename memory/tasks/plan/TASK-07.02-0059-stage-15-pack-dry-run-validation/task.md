# TASK-07.02-0059: Stage 15 package dry-run validation

Status: done
Type: chore
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Add repeatable package dry-run validation that proves publishable artifacts contain the
right files and expose usable package exports before real publishing is automated.

## Product Context

Stage 15 release readiness is not complete if CI passes but npm packages are malformed.
This task validates package contents and export resolution after build/pack without pushing
anything to npm.

## Scope

- Add scripts or documented commands for npm package dry-run validation.
- Build packages before package validation.
- Validate publishable package contents for `@sagifire/ioc`, `@sagifire/ioc-next` and
  `@sagifire/ioc-testing`.
- Verify packed artifacts include `dist`, `README.md`, `LICENSE`, `NOTICE` and package
  metadata.
- Verify package exports/types from packed artifacts where practical.
- Use temporary directories under an allowed workspace temp path for smoke checks.
- Keep dry-run validation independent from actual npm publish.
- Update task run result memory after implementation.

## Out of Scope

- Actual npm publish.
- GitHub Actions publish workflow.
- Changing public API or package exports unless a packaging defect is discovered and
  documented.
- Installing external services or framework dependencies.
- Managing npm credentials or secrets.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] A repeatable package dry-run validation path exists.
- [ ] Dry-run validation covers all three publishable packages.
- [ ] Tarball/package contents are checked for intended release artifacts.
- [ ] Package exports/types are smoke-tested from packed artifacts where practical.
- [ ] Validation does not publish packages.
- [ ] Build/test/typecheck/lint relevance is recorded.
- [ ] Any packaging defects or follow-ups are documented.

## Linked Memory

- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/testing.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.02-0058-stage-15-ci-quality-gates/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for package dry-run validation.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
