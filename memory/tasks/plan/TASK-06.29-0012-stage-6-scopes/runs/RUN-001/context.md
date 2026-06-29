# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.29-0012-stage-6-scopes/task.md`
- `memory/tasks/plan/TASK-06.29-0012-stage-6-scopes/runs/RUN-001/requirements.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

`@sagifire/ioc` має бути TypeScript-native, JavaScript-friendly бібліотекою для явної
модульної композиції залежностей. Stage 6 додає request/operation/task-local context до
вже реалізованого sync single/multi-provider container foundation.

## Relevant Domain Context

- Token - typed dependency identity object with stable runtime `id`; object identity is
  not required for matching.
- Container builder - mutable configuration phase API used before `freeze()`.
- Runtime - frozen immutable container/composer output used for dependency resolution.
- Scope - request, operation or task-local resolution context with scoped values and
  scoped resources.
- Scoped value - value available inside a scope, usually request/operation-specific
  context.
- Scoped provider - provider lifetime that creates one instance per scope and cannot be
  resolved without active scope.
- Single provider token - token registered through `bind(token)` where exactly one
  provider is expected.
- Multi-provider token - token registered through `add(token)` where multiple providers
  are collected through `getAll()`.

## Relevant Technical Context

- Core package `@sagifire/ioc` має бути runtime-agnostic.
- Container does not know about modules.
- Context does not know about Next.js.
- Stage 4 implemented sync single-provider `bind()`, `get()` and `tryGet()`.
- Stage 5 implemented multi-provider `add()` and `getAll()`.
- Stage 6 starts scopes and scoped lifetime.
- Async providers/resources start at Stage 7.
- Full diagnostics layer starts at Stage 8.
- `get()` must never perform hidden async behavior.
- `freeze()` is async-compatible by public API design.
- Token ID is canonical provider identity.
- Scope-local precedence decision:
  single values override, multi values extend, kind conflicts fail.

## Relevant Knowledge Packages

Немає обов'язкових reusable knowledge packages. Якщо під час implementation виникне
процесний конфлікт, перевірити `memory/knowledge/package-index.md`.

## Files / Modules to Inspect

- `packages/ioc/src/tokens.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/context.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/tsup.config.ts`
- `packages/ioc/test/container.test.ts`
- `test/package-exports.test.ts`
- Existing package README/docs only if public API description becomes misleading.

## Known Risks

- Зробити scope mutable configuration API after creation and accidentally create service
  locator behavior.
- Зламати Stage 5 strict single/multi-provider model through permissive scope-local
  values.
- Cache scoped providers per runtime instead of per scope.
- Resolve scoped providers through runtime-level APIs without active scope.
- Make `tryGet()` swallow provider/scope errors instead of returning `undefined` only for
  missing single providers.
- Forget to route factory `ResolutionContext` through active scope when resolving scoped
  providers.
- Return internal arrays from scope `getAll()` and allow caller mutation runtime/scope
  storage.
- Forget to dispose scope in `withScope()` failure paths.
- Introduce async provider/resource behavior before Stage 7.
- Implement diagnostics framework before Stage 8.
- Add Node-only, framework-specific or global mutable state to core.
- Break tree-shaking friendly subpath export boundary.

## Assumptions

- Stage 5 multi-provider implementation already passed task-level human review.
- `TASK-06.29-0011` буде approved або користувач явно дозволить почати Stage 6
  implementation раніше.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
