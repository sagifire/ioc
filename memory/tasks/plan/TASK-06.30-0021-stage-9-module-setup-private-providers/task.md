# TASK-06.30-0021: Stage 9 module setup and private providers

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-30
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати module setup execution, module-bound setup context and private provider
registration/isolation for Stage 9 composer.

## Product Context

Modules must be able to register their own providers while preserving module isolation.
This task wires module setup into the composer internals, but public composed runtime
capability exposure is completed by the next task.

## Scope

- Execute module `setup(context)` during composition preparation.
- Support sync and async module setup if the existing API allows `Promise`.
- Implement `ModuleSetupContext` runtime behavior:
  - `moduleId`;
  - `bind(token)`;
  - `add(token)`;
  - `get(token)`;
  - `tryGet(token)`;
  - `getAll(token)`.
- Support module setup `bind()` / `add()` by delegating to internal container provider
  registration while recording owner module metadata.
- Support private providers that are not declared in `provides`.
- Support exported providers for tokens declared in module `provides`.
- Implement module-bound resolution checks for setup/provider factory contexts:
  - own private providers are allowed;
  - own exported providers are allowed;
  - declared required ports satisfied by composition are allowed;
  - public capabilities allowed by composition are allowed where needed;
  - another module's private providers are rejected.
- Add typed boundary error such as `PrivateProviderAccessError` if needed.
- Validate that declared provided capabilities are actually registered by module setup.
- Validate that private providers are not exposed through composer-level public runtime
  registry data prepared for the next task.
- Add runtime tests for setup execution, private provider resolution and boundary
  rejection.
- Add type-level assertions for module setup context binding/resolution inference.
- Update run result memory after implementation.

## Out of Scope

- Completing public composed runtime wrapper.
- Implementing final runtime capability registry behavior beyond metadata needed here.
- Implementing `runtime.inspect()`.
- Implementing `composer.inspect()` or `composer.getGraph()`.
- Implementing module cycle detection or dependency-edge analysis.
- Implementing DSL helpers, testing helpers or Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Module setup executes during composition preparation.
- [x] Module setup can register single and multi providers.
- [x] Module setup can register private providers.
- [x] Exported providers must match declared `provides` metadata.
- [x] Module-bound contexts can resolve own private providers.
- [x] Module-bound contexts can resolve declared required ports after composition
  satisfaction.
- [x] Module-bound contexts cannot resolve another module's private providers.
- [x] Boundary violations produce typed diagnostics.
- [x] Runtime tests cover private provider isolation.
- [x] Type-level assertions cover `ModuleSetupContext`.
- [x] Stage 9 task does not expose final public runtime capabilities yet.
- [x] Stage 10 cycle detection behavior is not implemented.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для module setup and private providers.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після завершення і approval
`TASK-06.30-0020-stage-9-composer-builder-bindings-validation`.
