# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.29-0014-stage-7-async-providers-resources/task.md`
- `memory/tasks/plan/TASK-06.29-0014-stage-7-async-providers-resources/runs/RUN-001/requirements.md`
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
модульної композиції залежностей. Stage 7 adds async initialization and resource lifecycle
to the already implemented token, sync container, multi-provider and scope foundation.

## Relevant Domain Context

- Token - typed dependency identity object with stable runtime `id`; object identity is
  not required for matching.
- Provider - registration that produces token value through value, factory, class, async
  factory or async resource binding.
- Runtime - frozen immutable container/composer output used for dependency resolution.
- Scope - request, operation or task-local resolution context with scoped values and
  scoped resources.
- Resource - value with optional dispose callback, usually used for async or
  lifecycle-managed dependencies.
- Scoped provider - provider lifetime that creates one instance per scope and cannot be
  resolved without active scope.

## Relevant Technical Context

- Core package `@sagifire/ioc` має бути runtime-agnostic.
- Container does not know about modules.
- Context does not know about Next.js.
- Stage 4 implemented sync single-provider `bind()`, `get()` and `tryGet()`.
- Stage 5 implemented multi-provider `add()` and `getAll()`.
- Stage 6 implemented scopes, scoped lifetime, scope-local values and `withScope()`.
- Stage 7 starts async providers/resources and runtime disposal.
- Full diagnostics layer starts at Stage 8.
- `get()` must never perform hidden async behavior.
- `freeze()` is async-compatible by public API design.
- Token ID is canonical provider identity.
- Async lazy providers/resources are accessed only through `getAsync()`.
- Async eager singleton providers/resources initialize during `freeze()` and are available
  through `get()` after runtime is ready.
- Failed lazy async initialization is not cached by default.
- Runtime disposal owns singleton resources; scope disposal owns scoped resources.
- Stage 7 does not define `getAllAsync()` or async multi-provider contributions.

## Relevant Knowledge Packages

Немає обов'язкових reusable knowledge packages. Якщо під час implementation виникне
процесний конфлікт, перевірити `memory/knowledge/package-index.md`.

## Files / Modules to Inspect

- `packages/ioc/src/tokens.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/context.ts`
- `packages/ioc/src/lifecycle.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/tsup.config.ts`
- `packages/ioc/test/container.test.ts`
- `packages/ioc/test/scope.test.ts`
- `test/package-exports.test.ts`
- Existing package README/docs only if public API description becomes misleading.

## Known Risks

- Accidentally make `get()` return a `Promise` or allow async lazy value through sync
  access.
- Cache failed lazy async initialization and prevent retry.
- Start two concurrent singleton/scoped lazy initializations for the same provider.
- Dispose resources in registration order instead of reverse initialization order.
- Hide disposer failures or stop cleanup too early without documenting behavior.
- Make runtime disposal own live scopes through a hidden global registry.
- Let existing scopes resolve after runtime disposal.
- Forget that `scope.dispose()` must still be valid after runtime disposal for initialized
  scoped resources.
- Resolve scoped async providers through runtime-level APIs without active scope.
- Break Stage 5 strict single/multi-provider model by inventing async multi-provider
  behavior without `getAllAsync()`.
- Forget to route async factory `ResolutionContext` through active scope when resolving
  scoped dependencies and scope-local values.
- Introduce composer, DSL, diagnostics framework, Next.js adapter or testing helpers before
  their stages.
- Add Node-only, framework-specific or global mutable state to core.
- Break tree-shaking friendly subpath export boundary.

## Assumptions

- Stage 6 scopes implementation already passed task-level human review.
- `TASK-06.29-0013` буде approved або користувач явно дозволить почати Stage 7
  implementation раніше.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
