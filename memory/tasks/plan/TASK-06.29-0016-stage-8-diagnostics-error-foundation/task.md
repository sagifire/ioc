# TASK-06.29-0016: Stage 8 diagnostics error foundation

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати першу частину Stage 8 diagnostics: спільну базову `SagifireIocError`,
stable diagnostics error code contract, type guard and migration of existing Stage 3-7
public typed errors to the new foundation.

## Product Context

До Stage 8 core package already has readable typed errors, but they are local classes that
extend `Error` directly. Stage 8 має зробити ці помилки узгодженим public diagnostics
surface without changing container runtime behavior.

This task prepares the stable error model for the next Stage 8 task, where diagnostic
reports and `formatDiagnostics()` will be implemented.

## Scope

- Replace `packages/ioc/src/diagnostics.ts` placeholder with diagnostics foundation.
- Add public `SagifireIocError` base class.
- Add `SagifireIocErrorOptions` or equivalent constructor options.
- Add `isSagifireIocError(error)` or equivalent public type guard.
- Make `SagifireIocError` expose:
  - `code`;
  - `message`;
  - optional `details`;
  - optional `cause`.
- Preserve normal `instanceof Error` behavior and class-specific `instanceof` behavior.
- Use error code naming convention `SAGIFIRE_IOC_<AREA>_<REASON>`.
- Preserve existing Stage 3-7 public code strings unless a direct conflict is found.
- Migrate existing public errors to extend `SagifireIocError`:
  - `InvalidTokenIdError`;
  - `ProviderNotFoundError`;
  - `DuplicateProviderError`;
  - `ProviderKindMismatchError`;
  - `ProviderCycleError`;
  - `ContainerFrozenError`;
  - `AsyncProviderAccessError`;
  - `RuntimeDisposedError`;
  - `InvalidProviderLifecycleError`;
  - `InvalidScopeError`;
  - `ScopeDisposedError`;
  - `DuplicateScopeLocalValueError`.
- Populate structured `details` for each migrated error using safe public diagnostic data:
  token IDs, token ID paths, provider kinds, actions, lifecycle modes, invalid reasons and
  invalid input values where already exposed by the error.
- Preserve current behavior of `get()`, `tryGet()`, `getAll()`, `getAsync()`,
  `tryGetAsync()`, scope APIs, freeze and dispose.
- Export diagnostics foundation through `@sagifire/ioc/diagnostics`.
- Re-export diagnostics foundation from root `@sagifire/ioc` if it does not harm
  tree-shaking boundaries.
- Keep existing token/container/context subpath exports compatible.
- Add runtime tests for base error behavior, migrated errors, details, cause and type
  guard.
- Add type-level assertions for public diagnostics foundation API.
- Update package export smoke tests for `@sagifire/ioc/diagnostics` and root exports.
- Update minimal docs/README only if current public API text would otherwise become
  misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing `Diagnostic`, `DiagnosticReport`, `DiagnosticSeverity` or
  `formatDiagnostics()`.
- Implementing report formatting, pretty printing, terminal colors or markdown output.
- Adding composer/module-specific diagnostics.
- Implementing duplicate module ID, missing required port, invalid binding, private
  provider exposure or module cycle errors before Stage 9.
- Changing provider resolution semantics, lifecycle behavior or disposal ownership.
- Renaming public error classes.
- Silently renaming existing public code strings.
- Exposing provider values or private runtime internals in `details`.
- Introducing Node-only APIs, `process`, `Buffer`, `fs`, `path`, decorators,
  `reflect-metadata`, Next.js or React into core.
- Editing `memory/sources/SPEC.md`.

## Stage 8 Error Foundation Decisions

- `SagifireIocError` is the shared base class for public IoC diagnostics errors.
- `code` is stable public API and uses `SAGIFIRE_IOC_<AREA>_<REASON>`.
- Existing Stage 3-7 code strings remain stable unless implementation finds a direct
  conflict; any deviation must be documented in `RUN-001/result.md`.
- `details` should be structured and useful for humans, Codex and tests.
- `details` must not contain provider values, resource instances, scope-local values or
  private runtime internals.
- `cause` should preserve an underlying failure where a wrapper error is introduced.
- The foundation task should not redesign all messages if doing so increases risk without
  improving diagnostics.
- Existing public error classes remain the primary concrete typed errors for Stage 3-7
  failure modes.

## Acceptance Criteria

- [ ] `SagifireIocError` is implemented and exported from `@sagifire/ioc/diagnostics`.
- [ ] `SagifireIocError` exposes stable `code`, readable `message`, optional `details`
  and optional `cause`.
- [ ] `SagifireIocError` preserves `instanceof Error`.
- [ ] `isSagifireIocError()` or equivalent type guard is implemented and exported.
- [ ] Existing Stage 3-7 public typed errors extend `SagifireIocError`.
- [ ] Existing Stage 3-7 public typed errors preserve class names and `instanceof`
  behavior.
- [ ] Existing Stage 3-7 public code strings are preserved or any intentional deviation is
  documented in `RUN-001/result.md`.
- [ ] Migrated errors include structured `details` with safe diagnostic fields.
- [ ] Migrated errors do not expose provider values or private runtime internals in
  `details`.
- [ ] Token, container and context subpath exports remain compatible.
- [ ] Root and diagnostics subpath export smoke tests cover diagnostics foundation.
- [ ] Runtime tests cover base error, type guard, details, cause and representative
  migrated errors from token/container/context layers.
- [ ] Type-level assertions cover public diagnostics foundation API.
- [ ] Stage 8 task does not implement `DiagnosticReport`, `formatDiagnostics()`,
  composer, DSL, adapters or testing helpers.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

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
  - Status: planned
  - Purpose: Початковий autonomous implementation run для diagnostics error foundation.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval planning task
`TASK-06.29-0015-stage-8-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
