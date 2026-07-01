# TASK-07.01-0038: Stage 12 testing hardening and docs

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Завершити Stage 12 через hardening, export coverage and docs sync for
`@sagifire/ioc-testing`.

## Product Context

This task finalizes the testing package after runtime helpers, overrides, test composer,
module harnesses, fake modules and assertions are implemented. It should stabilize public
API coverage and documentation without starting Stage 13 adapters.

## Scope

- Harden integration coverage across final testing helper surface.
- Verify package exports for `@sagifire/ioc-testing`.
- Verify root package boundaries: core does not import testing helpers.
- Verify testing helpers do not import Next.js, React or adapter-specific APIs.
- Add final type-level coverage for helper inference if earlier tasks left gaps.
- Update `README.md`, `packages/ioc-testing/README.md`, `docs/testing.md` and minimal
  adjacent docs to describe testing workflows accurately.
- Update task memory, roadmap/state progress and run result after implementation.

## Out of Scope

- Implementing new testing helper families not planned by Stage 12.
- Implementing Next.js adapters or examples.
- Implementing Stage 14 full documentation/examples.
- Adding release automation.
- Changing core runtime/composer semantics.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Final `@sagifire/ioc-testing` public helper surface has integration regression tests.
- [x] Package export smoke tests cover final testing API.
- [x] Type-level assertions cover final helper inference.
- [x] Docs explain isolated test runtimes, overrides, test composer, module harnesses,
  fake modules and graph/diagnostic assertions.
- [x] Docs state that overrides apply before `freeze()` / `compose()` and never mutate
  frozen runtime.
- [x] Boundary checks confirm core does not import testing package.
- [x] Boundary checks confirm testing package does not implement Next.js adapters.
- [x] Stage 12 task does not implement Stage 13, Stage 14 or Stage 15 behavior.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/tasks/plan/TASK-07.01-0033-stage-12-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для testing package hardening.
  - Result: completed, approved after task-level human review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після approval
`TASK-07.01-0037-stage-12-graph-diagnostic-assertions`, якщо користувач явно не змінить
порядок. Після approval цієї task Stage 12 може бути перевірений як завершений.
