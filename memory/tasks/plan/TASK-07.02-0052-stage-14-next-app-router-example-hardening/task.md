# TASK-07.02-0052: Stage 14 Next App Router example hardening

Status: done
Type: docs
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Harden the existing `examples/next-app-router` skeleton into a Stage 14 documentation-grade
example.

## Product Context

Stage 13 added a narrow App Router-shaped skeleton without installing Next.js. Stage 14
should make it clear and useful while preserving the adapter boundary and avoiding hidden
framework magic.

## Scope

- Improve `examples/next-app-router` file organization and README.
- Demonstrate `createNextRuntime()`, `createNextRequestContext()`, route handler scope and
  server action scope together.
- Keep business logic in application modules and framework files thin.
- Document how the example maps to real App Router boundaries.
- Verify package-boundary expectations and typecheck/run example code where practical.
- Avoid adding Next.js/React dependency unless the task identifies a concrete need and asks
  for permission.
- Update docs navigation and root README links if needed.
- Update task run result memory after implementation.

## Out of Scope

- Full Next.js application setup with dev server unless explicitly approved.
- Route scanning, filesystem discovery or automatic module discovery.
- Hidden current request/action service locator APIs.
- Changing `@sagifire/ioc-next` public API.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] `examples/next-app-router` README explains runtime cache, request context, route
  scope and server action scope.
- [x] Route/action files stay thin and call module public APIs.
- [x] Example avoids hidden discovery and global mutable app/container registries.
- [x] Example does not require Next.js install unless the run result records approved
  dependency changes.
- [x] Example code is typechecked or otherwise verified through documented commands where
  practical.
- [x] Verification is recorded in run result.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for Next App Router example hardening.
  - Result: approved after task-level human review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
