# TASK-07.01-0031: Stage 11 bind and adapt DSL

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 11 bind helper DSL and `adapt()` for explicit composition adapters.

## Product Context

Once module and app DSL conversion exist, Stage 11 can add ergonomics for the most common
composition task: satisfying consumer-owned required ports with explicit adapters over
public capabilities or other context-accessible dependencies.

## Scope

- Implement bind helper DSL declarations for composition-level bindings.
- Implement `adapt()` helper for explicit required-port adapters.
- Ensure bind/adapt DSL compiles to existing `composer.bind()` provider forms.
- Preserve existing composer binding kinds and diagnostics where possible.
- Ensure binding dependency edges remain explicit required-port -> binding edges.
- Do not execute adapter/binding factories during validation or inspection to infer hidden
  dependencies.
- Support type inference for required port token value, adapter output and context token
  access.
- Add runtime tests for value/factory/class/async-factory binding conversion where
  supported by the chosen DSL shape.
- Add tests for adapter graph visibility, binding priority and non-execution during
  validation/inspection.
- Add type-level assertions for bind/adapt inference.
- Update package export smoke tests and minimal docs/README if public API text would
  otherwise be misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing `@sagifire/ioc-testing` graph assertion helpers.
- Implementing Next.js adapters.
- Adding binding-internal dependency declaration API beyond explicit adapter code.
- Executing factories to infer hidden dependency edges.
- Changing composer/runtime binding semantics.
- Adding decorators, `reflect-metadata`, constructor metadata or filesystem discovery.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Bind helper DSL compiles to existing composition bindings.
- [x] `adapt()` supports explicit adapter declarations for required ports.
- [x] Adapter output type matches required port token value.
- [x] Adapter dependencies stay explicit in code and do not become hidden graph magic.
- [x] Validation/inspection do not execute binding or adapter factories.
- [x] Binding dependency edges remain deterministic and visible.
- [x] Runtime tests cover supported bind/adapt conversions and graph behavior.
- [x] Type-level assertions cover bind/adapt inference.
- [x] Stage 11 task does not implement testing helpers or Next.js adapters.
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
- `memory/tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для bind/adapt DSL.
  - Result: [result.md](runs/RUN-001/result.md)

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval and completion of
`TASK-07.01-0030-stage-11-define-app-dsl`, якщо користувач явно не змінить операційний
порядок.
