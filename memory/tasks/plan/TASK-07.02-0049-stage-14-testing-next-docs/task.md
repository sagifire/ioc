# TASK-07.02-0049: Stage 14 testing and Next docs

Status: backlog
Type: docs
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Expand Stage 14 documentation for `@sagifire/ioc-testing` and `@sagifire/ioc-next`.

## Product Context

Stage 12 and Stage 13 implemented testing helpers and Next App Router adapter helpers.
Current docs list the APIs but need a durable workflow-oriented guide.

## Scope

- Rewrite `docs/testing.md` around isolated test runtimes, overrides, test composers,
  fake modules, module harnesses, graph assertions and diagnostic assertions.
- Rewrite `docs/next-integration.md` around cached runtime, request context, route handler
  scopes, server action scopes and composed runtime context token visibility.
- Explain when to use fake modules vs overrides.
- Explain Next framework boundary usage and scope disposal on success/failure.
- Keep Next examples thin and focused on calls into module public APIs.
- Update package README links if needed.
- Update task run result memory after implementation.

## Out of Scope

- Creating or hardening example applications.
- Adding Next.js, React or framework test dependencies.
- Changing testing or Next adapter public API.
- Adding hidden current-request/current-action APIs.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Testing docs explain all current `@sagifire/ioc-testing` helper families.
- [ ] Testing docs distinguish overrides, fake modules and module harnesses.
- [ ] Next docs explain cached runtime, explicit request context, route scopes and server
  action scopes.
- [ ] Next docs state business logic should stay behind module public APIs.
- [ ] Docs explicitly say helpers do not mutate frozen runtimes.
- [ ] Docs avoid claiming full Next.js app dependency/install is required.
- [ ] Relevant docs formatting checks pass.
- [ ] Verification is recorded in run result.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: pending
  - Purpose: Autonomous implementation run for testing and Next docs.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
