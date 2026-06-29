# Roadmap

## Planning Rule

Project roadmap starts with Project Memory bootstrap. After Stage 1, implementation stages
follow `SPEC.md` sections 32-45 in the same order, shifted by one stage number in this
roadmap.

Root source trace:

- `SPEC.md` sections 32-45 - original staged implementation plan.
- `TASK-06.26-0002` - Stage 1 memory bootstrap task.
- `TASK-06.26-0003` - Stage 2 implementation planning task.
- `TASK-06.26-0004` - Stage 2 repository/build foundation implementation task.
- `TASK-06.26-0005` - Stage 3 implementation planning task.
- `TASK-06.26-0006` - Stage 3 tokens implementation task.
- `TASK-06.29-0007` - Stage 4 implementation planning task.
- `TASK-06.29-0008` - Stage 4 container sync providers implementation task.
- `TASK-06.29-0009` - Stage 5 implementation planning task.
- `TASK-06.29-0010` - Stage 5 multi-provider implementation task.

## Completed

- Stage 1: Project Memory bootstrap.
  - Status: done.
  - Source: `TASK-06.26-0002`.
  - Scope: перенести `AGENTS.md` і `SPEC.md` у canonical Project Memory.
  - Acceptance:
    - architecture boundaries, implementation rules, coding style і workflow з
      `AGENTS.md` перенесені;
    - `SPEC.md` перенесений структурно з trace до root source;
    - roadmap, state, progress і релевантні `index.md` оновлені;
    - implementation code або monorepo foundation не створювались.

- Stage 2: Repository and build foundation.
  - Status: done.
  - Source: `SPEC.md` section 32.
  - Planning Task: `TASK-06.26-0003-stage-2-implementation-planning`.
  - Implementation Task: `TASK-06.26-0004-stage-2-repository-build-foundation`.
  - Build Tool: `tsup`.
  - Implemented:
    - `pnpm` workspace;
    - package structure для `@sagifire/ioc`, `@sagifire/ioc-next`,
      `@sagifire/ioc-testing`;
    - TypeScript, ESLint, Prettier, Vitest і build config;
    - package export placeholders;
    - README/docs skeleton;
    - CI-ready scripts.
  - Acceptance:
    - `pnpm install` works;
    - `pnpm build` works;
    - `pnpm test` works;
    - `pnpm typecheck` works;
    - `pnpm lint` works;
    - all packages build independently;
    - all package exports resolve correctly;
    - types are generated;
    - `sideEffects: false` is configured;
    - Stage 3+ runtime behavior is not implemented.
  - Guardrails:
    - не реалізовувати container logic;
    - не реалізовувати tokens, composer, DSL, diagnostics behavior або adapters;
    - не заявляти в README/docs, що unimplemented runtime API вже працює.

- Stage 3: Tokens.
  - Status: done.
  - Source: `SPEC.md` section 33.
  - Planning Task: `TASK-06.26-0005-stage-3-implementation-planning`.
  - Implementation Task: `TASK-06.26-0006-stage-3-tokens`.
  - Type-Level Test Approach: Vitest `expectTypeOf` for Stage 3 token inference.
  - Implemented:
    - `Token<TValue>`;
    - `token<TValue>(id, options?)`;
    - `namespace(id)` helper for stable prefixed IDs;
    - token ID validation;
    - minimal token-specific invalid ID error without full diagnostics layer;
    - root and `./tokens` public exports;
    - runtime tests and type-level assertions.
  - Acceptance:
    - typed tokens infer `TValue`;
    - namespaces create stable prefixed IDs;
    - token ID is runtime identity;
    - invalid token IDs are rejected through readable token-specific error;
    - `@sagifire/ioc/tokens` remains independent from container/composer/DSL/adapters;
    - `pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm lint` pass.
  - Guardrails:
    - container, providers, lifetimes, scopes і async model не реалізовувались;
    - composer, modules, capabilities, required ports і bindings не реалізовувались;
    - DSL, Next.js adapters і testing helpers не реалізовувались;
    - full diagnostics layer не реалізовувався;
    - global mutable token registry не створювався;
    - token object identity не став canonical runtime identity.

## Recently Completed

- Stage 4: Container sync providers.
  - Status: done.
  - Source: `SPEC.md` section 34.
  - Planning Task: `TASK-06.29-0007-stage-4-implementation-planning`.
  - Implementation Task: `TASK-06.29-0008-stage-4-container-sync-providers`.
  - Type-Level Test Approach: Vitest `expectTypeOf` for `runtime.get()`,
    `runtime.tryGet()` and factory context inference.
  - API Decisions:
    - `freeze()` returns `Promise<ContainerRuntime>` even for sync-only Stage 4;
    - `toValue` is singleton;
    - `toFactory` is transient by default;
    - `toClass` is transient by default;
    - `toClass()` accepts no-argument constructors only and does not use decorators,
      `reflect-metadata`, parameter names or constructor metadata;
    - classes with dependencies must be wired through explicit `toFactory()`;
    - token ID is the provider key; token object identity is not used for matching;
    - `tryGet()` returns `undefined` only for missing providers and still throws provider
      cycles or provider execution errors.
  - Implement:
    - `createContainer()`;
    - `bind().toValue()`;
    - `bind().toFactory()`;
    - `bind().toClass()`;
    - singleton and transient lifetimes;
    - async-compatible `freeze()`;
    - immutable `runtime.get()`;
    - immutable `runtime.tryGet()`;
    - provider cycle detection;
    - duplicate single-provider token detection;
    - minimal container-specific typed errors without full diagnostics layer;
    - root and `./container` public exports where tree-shaking boundary allows;
    - runtime tests and type-level assertions.
  - Acceptance:
    - sync value, factory and no-argument class providers resolve correctly;
    - singleton returns same instance/value per frozen runtime;
    - transient returns new instance/value per resolution;
    - duplicate single-provider token fails;
    - provider cycles fail with readable error and token ID path;
    - runtime is immutable after freeze;
    - `runtime.get()` and factory context preserve token value inference;
    - `@sagifire/ioc/container` remains independent from composer/DSL/adapters;
    - `pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm lint` pass.
  - Guardrails:
    - не реалізовувати multi-provider `add()` або `getAll()`;
    - не реалізовувати scopes, scoped lifetime, scope-local values або disposal;
    - не реалізовувати async providers, async resources, `getAsync()` або
      `tryGetAsync()`;
    - не реалізовувати composer, modules, capabilities, required ports або bindings;
    - не реалізовувати DSL, Next.js adapters або testing helpers;
    - не реалізовувати full diagnostics layer: `SagifireIocError`,
      `DiagnosticReport` або `formatDiagnostics()`;
    - не додавати global mutable container або provider registry;
    - не використовувати decorators, `reflect-metadata` або constructor metadata.

- Stage 5: Multi-provider.
  - Status: done.
  - Source: `SPEC.md` section 35.
  - Planning Task: `TASK-06.29-0009-stage-5-implementation-planning`.
  - Implementation Task: `TASK-06.29-0010-stage-5-multi-provider`.
  - Type-Level Test Approach: Vitest `expectTypeOf` for `add()`, `runtime.getAll()` and
    factory context `getAll()` inference.
  - API Decisions:
    - `bind(token)` is for single-provider tokens;
    - `add(token)` is for multi-provider tokens;
    - `bind()` and `add()` cannot be mixed for the same token ID;
    - `get()` fails for multi-provider token even if only one provider was registered;
    - `getAll()` fails for token registered through `bind()`;
    - `getAll()` returns empty array for completely missing token;
    - `getAll()` returns public type `TValue[]`, with a fresh array per call in
      registration order;
    - `ResolutionContext` includes sync `getAll()` in Stage 5;
    - `add().toValue()` is singleton by definition;
    - `add().toFactory()` is transient by default and supports `.singleton()` /
      `.transient()`.
  - Implement:
    - `ContainerBuilder.add()`;
    - `add().toValue()`;
    - `add().toFactory()`;
    - multi-provider factory singleton/transient lifetimes;
    - `runtime.getAll()`;
    - `ResolutionContext.getAll()`;
    - single vs multi-provider validation;
    - minimal multi-provider-specific typed errors without full diagnostics layer;
    - root and `./container` public exports where tree-shaking boundary allows;
    - runtime tests and type-level assertions.
  - Acceptance:
    - multiple providers can be registered for same token via `add()`;
    - `getAll()` returns all values in registration order;
    - `getAll()` returns a fresh array per call;
    - `getAll()` returns empty array for missing token;
    - `get()` fails for multi-provider token;
    - `getAll()` fails for single-provider token;
    - `bind()` duplicate still fails;
    - `bind()` and `add()` cannot be mixed for same token ID;
    - multi-provider factory lifetimes work;
    - provider cycles through `get()` / `getAll()` fail with readable error and token ID
      path;
    - `runtime.getAll()` and factory context `getAll()` preserve token value inference;
    - Stage 5 does not implement scopes, async providers/resources, composer, DSL,
      diagnostics report/formatter, Next.js adapters or testing helpers;
    - `pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm lint` pass.
  - Guardrails:
    - не реалізовувати `add().toClass()` без окремого Stage 5 decision;
    - не реалізовувати scopes, scoped lifetime, scope-local values або disposal;
    - не реалізовувати async providers, async resources, `getAsync()` або
      `tryGetAsync()`;
    - не реалізовувати composer, modules, capabilities, required ports або bindings;
    - не реалізовувати DSL, Next.js adapters або testing helpers;
    - не реалізовувати full diagnostics layer: `SagifireIocError`,
      `DiagnosticReport` або `formatDiagnostics()`;
    - не додавати global mutable container або provider registry.

## Next

- Stage 6: Scopes.
  - Source: `SPEC.md` section 36.
  - Implement: `runtime.createScope()`, scope resolution APIs, scoped lifetime,
    scope-local values, `scope.dispose()`, `runtime.withScope()` and `InvalidScopeError`.
  - Acceptance:
    - scoped provider has one instance per scope;
    - scoped provider cannot be resolved without scope;
    - scope-local values override or extend runtime values according to documented rules;
    - disposed scope cannot resolve values;
    - `withScope()` disposes scope automatically.

- Stage 7: Async providers and resources.
  - Source: `SPEC.md` section 37.
  - Implement: `toAsyncFactory()`, `toAsyncResource()`, `eager()`, `lazy()`,
    `runtime.getAsync()`, `scope.getAsync()`, `runtime.dispose()`, async resource
    disposal, `AsyncProviderAccessError`, `RuntimeDisposedError` and `ScopeDisposedError`.
  - Acceptance:
    - async eager provider initializes during `freeze()`;
    - async eager provider is available via `get()`;
    - async lazy provider initializes on `getAsync()`;
    - `get()` on async lazy provider throws clear error;
    - failed lazy async initialization is not cached by default;
    - runtime and scope disposal dispose resources and are idempotent.

- Stage 8: Diagnostics.
  - Source: `SPEC.md` section 38.
  - Implement: `SagifireIocError`, typed error classes, `Diagnostic`,
    `DiagnosticReport`, `formatDiagnostics()` and detailed messages.
  - Acceptance:
    - all common failure modes produce typed errors;
    - errors include codes and useful details;
    - formatted diagnostics are readable for humans and Codex.

- Stage 9: Composer and modules.
  - Source: `SPEC.md` section 39.
  - Implement: `defineModule()`, `createComposer()`, `composer.use()`,
    `composer.bind()`, `composer.compose()`, private module scopes, requires/provides
    metadata, runtime capability registry, module graph, validation and inspection.
  - Acceptance:
    - multiple modules can be composed;
    - module IDs are unique;
    - provided single tokens are unique;
    - missing required ports fail validation;
    - bindings can satisfy required ports;
    - runtime exposes exported capabilities;
    - module internals are not exposed through runtime;
    - inspection returns useful module graph.

- Stage 10: Module graph cycle detection.
  - Source: `SPEC.md` section 40.
  - Implement: module dependency graph, module cycle detection, capability dependency
    edges and binding dependency edges.
  - Acceptance:
    - module-level cycles are detected;
    - cycle path is included in diagnostics;
    - valid acyclic graphs compose successfully.

## Later

- Stage 11: DSL.
  - Source: `SPEC.md` section 41.
  - Implement: `module()`, `defineApp()`, `adapt()`, bind helper DSL and DSL to object
    config conversion.
  - Acceptance: DSL creates valid configs, requires no decorators, keeps graph visible
    and leaves object API fully usable.

- Stage 12: `@sagifire/ioc-testing`.
  - Source: `SPEC.md` section 42.
  - Implement: test runtime, test composer, overrides, module harness, fake modules and
    graph assertion helpers.
  - Acceptance: overrides apply before compose, frozen runtime is never mutated, single
    module harness works with fake ports and graph assertions are readable in Vitest.

- Stage 13: `@sagifire/ioc-next`.
  - Source: `SPEC.md` section 43.
  - Implement: `createNextRuntime()`, cached runtime helper, request context helper,
    route scope helper, server action scope helper and Next.js examples.
  - Acceptance: adapter depends on `@sagifire/ioc`, core has no Next.js dependency,
    runtime can be cached safely and request/operation scopes are created and disposed
    at framework boundaries.

- Stage 14: Documentation and examples.
  - Source: `SPEC.md` section 44.
  - Implement docs for README, architecture, container, async model, composer, modules,
    Next.js integration, testing, diagnostics and migration from DI containers.
  - Implement examples: `basic-node`, `next-app-router`, `module-composition`,
    `async-db-resource`, `testing-overrides`.
  - Acceptance: public API, async model, module isolation, Next.js integration and testing
    workflow are documented and demonstrated.

- Stage 15: Release automation.
  - Source: `SPEC.md` section 45.
  - Implement: changesets or equivalent release workflow, package versioning, changelog
    generation, GitHub Actions CI, npm publish workflow and provenance support if chosen.
  - Acceptance: packages can be versioned according to chosen strategy, CI runs build/test
    typecheck, release artifacts are valid and npm package exports work after publish
    dry-run.
