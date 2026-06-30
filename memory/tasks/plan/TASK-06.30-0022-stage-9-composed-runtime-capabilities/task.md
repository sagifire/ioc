# TASK-06.30-0022: Stage 9 composed runtime and capabilities

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-30
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати `composer.compose()` and immutable composed runtime wrapper that exposes only
declared exported capabilities while preserving container scopes, async resolution and
disposal behavior.

## Product Context

This task turns the module setup/provider graph into a usable application runtime. It is
the task where Stage 9 acceptance criteria for composing multiple modules, satisfying
required ports and hiding module internals become user-visible.

## Scope

- Implement `composer.compose()`.
- Compose all registered modules in deterministic order.
- Apply composition bindings to satisfy required ports.
- Build internal container from:
  - module providers;
  - exported module capability providers;
  - composition bindings;
  - multi-provider contributions where supported by module setup.
- Freeze the internal container and return an immutable composed runtime wrapper.
- Expose public runtime methods:
  - `get()`;
  - `tryGet()`;
  - `getAll()`;
  - `getAsync()`;
  - `tryGetAsync()`;
  - `createScope()`;
  - `withScope()`;
  - `dispose()`.
- Gate public resolution to declared exported capabilities only.
- Keep required-port-only binding tokens private to module resolution unless explicitly
  declared as provided capability.
- Preserve container behavior for sync providers, multi-providers, scopes, async providers,
  resources and disposal behind the composed runtime.
- Validate compose-time issues:
  - missing provider for declared provided capability;
  - duplicate actual single providers for exported capability;
  - unresolved required ports after setup/bindings;
  - private provider access from public runtime.
- Ensure `compose()` validates and throws `ComposerValidationError` or equivalent typed
  error on invalid graph.
- Add runtime tests for multiple modules, bindings satisfying required ports, exported
  capabilities, private provider hiding, scopes, async access and disposal.
- Add type-level assertions for composed runtime capability token inference.
- Update run result memory after implementation.

## Out of Scope

- Implementing `runtime.inspect()`.
- Implementing `composer.inspect()` or `composer.getGraph()`.
- Implementing module-level cycle detection or dependency-edge analysis.
- Implementing DSL helpers, testing helpers or Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] `composer.compose()` returns an immutable runtime.
- [x] Multiple modules can be composed.
- [x] Required ports can be satisfied by explicit bindings.
- [x] Runtime exposes exported capabilities.
- [x] Runtime does not expose module private providers.
- [x] Required-port-only bindings are not public runtime capabilities by default.
- [x] Provided single tokens are unique.
- [x] Missing required ports fail validation before usable runtime is returned.
- [x] Existing container sync, async, scope and disposal behavior works through composed
  runtime where applicable.
- [x] Invalid composed graphs throw typed diagnostics.
- [x] Runtime tests cover the full Stage 9 user-visible composition path.
- [x] Type-level assertions cover public runtime token inference.
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
  - Purpose: Початковий autonomous implementation run для composed runtime capabilities.
  - Result: completed; prepared for review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після завершення і approval
`TASK-06.30-0021-stage-9-module-setup-private-providers`.
