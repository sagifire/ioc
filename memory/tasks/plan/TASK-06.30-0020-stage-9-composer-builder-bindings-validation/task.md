# TASK-06.30-0020: Stage 9 composer builder, bindings and static validation

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-30
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати `createComposer()`, `composer.use()`, `composer.bind()` and static
`composer.validate()` foundation without executing module setup or returning composed
runtime.

## Product Context

After module definitions exist, applications need a mutable composer configuration phase
that registers modules and explicit composition bindings. This task establishes the
builder/validation surface before module setup and runtime composition are added.

## Scope

- Add public `createComposer()`.
- Add public `Composer` interface/type.
- Implement `composer.use(moduleDefinition)`.
- Implement `composer.bind(token)` for composition-level single bindings:
  - `toValue()`;
  - `toFactory()`;
  - `toClass()`;
  - `toAsyncFactory()`.
- Store binding metadata without exposing provider values through inspection/diagnostics.
- Add binding factory context type with composed-runtime-oriented access shape.
- Implement static `composer.validate(): DiagnosticReport`.
- Validate duplicate module IDs.
- Validate missing required ports using declared module `requires`, declared module
  `provides` and explicit composer bindings.
- Validate invalid binding targets when a binding targets no declared required port.
- Validate duplicate declared/provided single capabilities where statically knowable.
- Add typed diagnostics/errors:
  - `DuplicateModuleIdError`;
  - `DuplicateModuleCapabilityError`;
  - `MissingRequiredPortError`;
  - `InvalidComposerBindingError`;
  - `ComposerValidationError` if needed by public API.
- Keep composer mutable until composition starts; prevent mutation after future compose
  finalization if this task adds state needed for that guard.
- Export builder/validation API from `@sagifire/ioc/composer` and root where appropriate.
- Add runtime tests for `use()`, `bind()`, validation reports and typed errors.
- Add type-level assertions for `composer.bind()` token inference and binding factory
  context inference.
- Update package export smoke tests.
- Update run result memory after implementation.

## Out of Scope

- Executing module setup.
- Registering module private providers.
- Building or returning composed runtime.
- Implementing public runtime capability registry.
- Implementing `composer.compose()`.
- Implementing `composer.inspect()`, `composer.getGraph()` or `runtime.inspect()`.
- Implementing module-level cycle detection or dependency-edge analysis.
- Implementing DSL helpers, testing helpers or Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] `createComposer()` is implemented and exported.
- [x] `composer.use()` registers modules in deterministic order.
- [x] `composer.bind()` records value, factory, class and async factory bindings.
- [x] `composer.validate()` returns `DiagnosticReport`.
- [x] Duplicate module IDs produce diagnostics.
- [x] Missing required ports produce diagnostics with token ID and requiring module ID.
- [x] Explicit bindings can satisfy required ports in static validation.
- [x] Invalid binding targets produce diagnostics.
- [x] Duplicate statically knowable single capabilities produce diagnostics.
- [x] Typed composer validation errors extend `SagifireIocError`.
- [x] Runtime tests cover builder and validation behavior.
- [x] Type-level assertions cover binding inference.
- [x] Stage 9 task does not execute module setup or compose runtime.
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
  - Purpose: Початковий autonomous implementation run для composer builder and validation.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після завершення і approval
`TASK-06.30-0019-stage-9-module-definition-foundation`.
