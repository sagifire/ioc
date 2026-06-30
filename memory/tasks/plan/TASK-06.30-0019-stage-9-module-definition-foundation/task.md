# TASK-06.30-0019: Stage 9 module definition foundation

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-30
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати першу частину Stage 9: object-configuration API foundation for module
definitions without composer runtime behavior.

## Product Context

Stage 9 starts composer/modules in `@sagifire/ioc`. Before composer can validate or compose
application graph, the public module definition contract must exist as a stable explicit
object API. This task replaces the Stage 2 composer placeholder with module definition
types and `defineModule()`.

## Scope

- Replace `packages/ioc/src/composer.ts` placeholder with module definition foundation.
- Add public `defineModule()`.
- Add public `ModuleDefinition<TMetadata = unknown>`.
- Add public `ModuleDependencyDefinition<TValue = unknown>`.
- Add public `ModuleCapabilityDefinition<TValue = unknown>`.
- Add public `ModuleSetupFunction`.
- Add public `ModuleSetupContext`.
- Add public `ModuleSetupResult`.
- Add supporting string literal types for dependency/capability kinds where useful.
- Normalize dependency defaults:
  - `required = true`;
  - `kind = 'external'`.
- Validate module IDs with a conservative readable rule aligned with token ID style where
  practical.
- Reject empty/invalid module IDs with typed diagnostics.
- Reject duplicate `requires` token IDs inside one module definition if they would be
  ambiguous.
- Reject duplicate `provides` token IDs inside one module definition if they would be
  ambiguous.
- Freeze or otherwise make returned module definitions immutable at the public object
  boundary.
- Export module definition API from `@sagifire/ioc/composer`.
- Re-export module definition API from root `@sagifire/ioc` if it does not harm
  tree-shaking boundaries.
- Add runtime tests for normalization, immutability and validation.
- Add type-level assertions for module metadata, required port and capability token
  inference.
- Update package export smoke tests for `@sagifire/ioc/composer` and root exports.
- Update minimal docs/README only if current public API text would otherwise become
  misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing `createComposer()`.
- Implementing `composer.use()`, `composer.bind()`, `composer.validate()` or
  `composer.compose()`.
- Executing module setup.
- Registering providers through module setup.
- Implementing private module scopes or composed runtime.
- Implementing inspection APIs.
- Implementing module-level cycle detection or dependency-edge analysis.
- Implementing DSL helpers.
- Implementing testing helpers or Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] `defineModule()` is implemented and exported from `@sagifire/ioc/composer`.
- [ ] Module definition public types are exported.
- [ ] Dependency defaults are normalized to `required = true` and `kind = 'external'`.
- [ ] Invalid module IDs fail with a typed readable error.
- [ ] Ambiguous duplicate requires/provides inside one module definition fail.
- [ ] Returned module definitions are immutable at the public boundary.
- [ ] Type inference preserves module metadata, required port token values and capability
  token values.
- [ ] Root and composer subpath export smoke tests cover module definition API as
  applicable.
- [ ] Runtime tests cover successful definitions, defaults, validation and immutability.
- [ ] Stage 9 task does not implement composer runtime, DSL, adapters or testing helpers.
- [ ] Stage 10 cycle detection behavior is not implemented.
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
  - Status: completed
  - Purpose: Початковий autonomous implementation run для module definition foundation.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval planning task
`TASK-06.30-0018-stage-9-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
