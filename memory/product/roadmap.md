# Roadmap

## Planning Rule

Project roadmap starts with Project Memory bootstrap. After Stage 1, implementation stages
follow `SPEC.md` sections 32-45 in the same order, shifted by one stage number in this
roadmap.

Stage 16 is a human-directed post-Stage-15 stabilization extension. It is not sourced from
historical `SPEC.md` sections 32-45.

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
- `TASK-06.29-0011` - Stage 6 implementation planning task.
- `TASK-06.29-0012` - Stage 6 scopes implementation task.
- `TASK-06.29-0013` - Stage 7 implementation planning task.
- `TASK-06.29-0014` - Stage 7 async providers/resources implementation task.
- `TASK-06.29-0015` - Stage 8 implementation planning task.
- `TASK-06.29-0016` - Stage 8 diagnostics error foundation implementation task.
- `TASK-06.29-0017` - Stage 8 diagnostic reports/formatting implementation task.
- `TASK-06.30-0018` - Stage 9 implementation planning task.
- `TASK-06.30-0019` - Stage 9 module definition foundation implementation task.
- `TASK-06.30-0020` - Stage 9 composer builder/bindings/static validation implementation
  task.
- `TASK-06.30-0021` - Stage 9 module setup/private providers implementation task.
- `TASK-06.30-0022` - Stage 9 composed runtime/capabilities implementation task.
- `TASK-06.30-0023` - Stage 9 inspection API implementation task.
- `TASK-06.30-0024` - Stage 10 implementation planning task.
- `TASK-06.30-0025` - Stage 10 dependency edge model implementation task.
- `TASK-06.30-0026` - Stage 10 module cycle diagnostics implementation task.
- `TASK-06.30-0027` - Stage 10 runtime inspection hardening implementation task.
- `TASK-07.01-0028` - Stage 11 implementation planning task.
- `TASK-07.01-0029` - Stage 11 module DSL foundation implementation task.
- `TASK-07.01-0030` - Stage 11 `defineApp()` DSL implementation task.
- `TASK-07.01-0031` - Stage 11 bind/adapt DSL implementation task.
- `TASK-07.01-0032` - Stage 11 DSL hardening/docs implementation task.
- `TASK-07.01-0033` - Stage 12 implementation planning task.
- `TASK-07.01-0034` - Stage 12 testing package foundation implementation task.
- `TASK-07.01-0035` - Stage 12 overrides/test composer implementation task.
- `TASK-07.01-0036` - Stage 12 module harness/fake modules implementation task.
- `TASK-07.01-0037` - Stage 12 graph/diagnostic assertions implementation task.
- `TASK-07.01-0038` - Stage 12 testing hardening/docs implementation task.
- `TASK-07.01-0039` - Stage 13 implementation planning task.
- `TASK-07.01-0040` - Stage 13 Next runtime foundation implementation task.
- `TASK-07.01-0041` - Stage 13 Next request context implementation task.
- `TASK-07.01-0042` - Stage 13 route handler scope implementation task.
- `TASK-07.01-0043` - Stage 13 server action scope implementation task.
- `TASK-07.01-0044` - Stage 13 Next examples/hardening/docs implementation task.
- `TASK-07.02-0045` - Stage 14 implementation planning task.
- `TASK-07.02-0046` - Stage 14 README and package docs implementation task.
- `TASK-07.02-0047` - Stage 14 core/container/async docs implementation task.
- `TASK-07.02-0048` - Stage 14 composer/modules/diagnostics docs implementation task.
- `TASK-07.02-0049` - Stage 14 testing/Next docs implementation task.
- `TASK-07.02-0050` - Stage 14 basic-node/module-composition examples implementation
  task.
- `TASK-07.02-0051` - Stage 14 async-db-resource/testing-overrides examples
  implementation task.
- `TASK-07.02-0052` - Stage 14 Next App Router example hardening implementation task.
- `TASK-07.02-0053` - Stage 14 migration guide/final docs hardening implementation task.
- `TASK-07.02-0054` - Stage 15 implementation planning task.
- `TASK-07.02-0055` - Stage 15 repository governance artifacts implementation task.
- `TASK-07.02-0056` - Stage 15 package publish metadata implementation task.
- `TASK-07.02-0057` - Stage 15 Changesets/versioning/changelog implementation task.
- `TASK-07.02-0058` - Stage 15 CI quality gates implementation task.
- `TASK-07.02-0059` - Stage 15 package dry-run validation implementation task.
- `TASK-07.02-0060` - Stage 15 npm publish workflow/provenance implementation task.
- `TASK-07.02-0061` - Stage 15 release docs/final hardening implementation task.
- `TASK-07.02-0062` - Stage 16 implementation planning task.
- `TASK-07.02-0063` - Stage 16 codebase audit report research task.
- `TASK-07.02-0064` - Stage 16 critical fixes from audit implementation task.
- `TASK-07.02-0065` - Stage 16 version `0.0.1` and stabilization handoff implementation
  task.

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

- Stage 6: Scopes.
  - Status: done.
  - Source: `SPEC.md` section 36.
  - Planning Task: `TASK-06.29-0011-stage-6-implementation-planning`.
  - Implementation Task: `TASK-06.29-0012-stage-6-scopes`.
  - Type-Level Test Approach: Vitest `expectTypeOf` for `runtime.createScope()`,
    `Scope.get()`, `Scope.tryGet()`, `Scope.getAll()`, `runtime.withScope()` callback
    inference and scope-bound factory context inference.
  - API Decisions:
    - Stage 6 is implemented as one implementation task because `Scope`, scoped lifetime,
      scope-local values and `withScope()` share one active-scope resolution model.
    - `runtime.createScope(options?)` creates an explicit request/operation/task-local
      resolution boundary.
    - `runtime.withScope(callback)` and `runtime.withScope(options, callback)` create a
      scope and dispose it automatically.
    - `Scope` exposes sync `get()`, `tryGet()`, `getAll()` and `dispose()`.
    - `scope.dispose()` returns `Promise<void>` for forward compatibility with Stage 7
      resource disposal, even though Stage 6 only marks sync scope invalid.
    - `LifetimeBinding` adds `.scoped()`.
    - `.scoped()` applies to sync single-provider `toFactory()` / `toClass()` and
      multi-provider `toFactory()` contributions.
    - `toValue()` remains singleton by definition.
    - Scope-local values are supplied at scope creation time and are not mutated through
      public scope APIs after scope creation.
    - Scope-local single values override runtime single-provider resolution for the same
      token ID inside that scope.
    - Scope-local multi values extend runtime multi-provider collections in runtime-first,
      scope-local-after order.
    - Runtime/local single/multi kind conflicts fail instead of silently converting token
      kind.
  - Implemented:
    - `runtime.createScope()`;
    - `runtime.withScope()`;
    - `Scope.get()`;
    - `Scope.tryGet()`;
    - `Scope.getAll()`;
    - `scope.dispose()`;
    - scoped lifetime for sync single-provider factory/class providers;
    - scoped lifetime for multi-provider factory contributions;
    - scope-local single values;
    - scope-local multi values;
    - scope-bound factory `ResolutionContext`;
    - invalid scope usage errors;
    - root, `./container` and `./context` public exports where tree-shaking boundary
      allows;
    - runtime tests and type-level assertions.
  - Acceptance:
    - scoped provider has one instance per scope;
    - scoped provider cannot be resolved without scope;
    - scope-local single values override runtime single providers inside one scope;
    - scope-local multi values extend runtime multi-provider collections in documented
      order;
    - single/multi conflicts between runtime and scope-local values fail;
    - duplicate local single values fail;
    - multiple local multi values are allowed;
    - disposed scope cannot resolve values;
    - `withScope()` disposes scope automatically on success and failure;
    - scope-bound factory context resolves scoped dependencies and scope-local values;
    - provider cycles through scoped resolution fail with readable token ID path;
    - Stage 6 does not implement async providers/resources, `getAsync()`, runtime disposal,
      composer, DSL, diagnostics report/formatter, Next.js adapters or testing helpers;
    - `pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm lint` pass.
  - Guardrails:
    - не реалізовувати `scope.getAsync()`, `runtime.getAsync()` або
      `runtime.tryGetAsync()`;
    - не реалізовувати async providers, async resources або runtime resource disposal;
    - не реалізовувати composer, modules, capabilities, required ports або bindings;
    - не реалізовувати DSL, Next.js adapters або testing helpers;
    - не реалізовувати full diagnostics layer: `SagifireIocError`,
      `DiagnosticReport` або `formatDiagnostics()`;
    - не додавати mutable public API for adding/replacing scope-local values after scope
      creation;
    - не додавати global mutable container або provider registry.

- Stage 7: Async providers and resources.
  - Status: done.
  - Source: `SPEC.md` section 37.
  - Planning Task: `TASK-06.29-0013-stage-7-implementation-planning`.
  - Implementation Task: `TASK-06.29-0014-stage-7-async-providers-resources`.
  - Review Status: RUN-001 approved after task-level human review.
  - Type-Level Test Approach: Vitest `expectTypeOf` for `toAsyncFactory()`,
    `toAsyncResource()`, `runtime.getAsync()`, `runtime.tryGetAsync()`,
    `scope.getAsync()` and async factory context inference.
  - API Decisions:
    - Stage 7 is implemented as one implementation task because async provider access,
      lazy/eager initialization, resource ownership and disposal share one lifecycle
      model.
    - Stage 7 adds async single-provider bindings through `bind()`.
    - Stage 7 does not add async multi-provider contributions through `add()`.
    - Stage 7 does not add `getAllAsync()` or `scope.getAllAsync()`.
    - `get()` remains sync and never returns `Promise`.
    - sync providers are valid through `getAsync()` / `tryGetAsync()` as resolved
      Promises.
    - async eager singleton providers/resources initialize during `freeze()`.
    - async eager singleton providers/resources are available through `get()` after
      `freeze()` and through `getAsync()`.
    - async lazy providers/resources initialize on `getAsync()`.
    - async lazy providers/resources are never available through `get()` / `tryGet()`,
      even after initialization.
    - failed lazy async initialization is not cached by default.
    - in-flight singleton/scoped lazy initialization is de-duplicated until it resolves or
      rejects.
    - `toAsyncFactory()` defaults to transient lazy provider.
    - async factory providers may be `transient`, `singleton` or `scoped`.
    - eager async factory/resource initialization is valid only for singleton providers.
    - `toAsyncResource()` requires explicit `singleton()` or `scoped()` ownership.
    - async resources default to lazy initialization unless `eager()` is explicitly chosen.
    - scoped async providers/resources initialize lazily through `scope.getAsync()`.
    - `runtime.dispose()` owns initialized singleton resources.
    - `scope.dispose()` owns initialized scoped resources.
    - runtime disposal does not silently dispose live scopes or maintain a global scope
      registry.
  - Implement:
    - `bind().toAsyncFactory()`;
    - `bind().toAsyncResource()`;
    - `Resource<TValue>` or equivalent lifecycle contract;
    - async binding lifecycle/mode helpers for valid `singleton()`, `transient()`,
      `scoped()`, `eager()` and `lazy()` combinations;
    - `runtime.getAsync()`;
    - `runtime.tryGetAsync()`;
    - `scope.getAsync()`;
    - `ResolutionContext.getAsync()`;
    - `ResolutionContext.tryGetAsync()`;
    - `runtime.dispose()`;
    - async eager initialization during `freeze()`;
    - async lazy initialization on `getAsync()`;
    - retry behavior for failed lazy initialization;
    - singleton/scoped resource disposal in reverse initialization order where possible;
    - minimal async/disposal typed errors without full diagnostics layer:
      `AsyncProviderAccessError`, `RuntimeDisposedError`, `ScopeDisposedError`;
    - root, `./container`, `./context` and `./lifecycle` public exports where
      tree-shaking boundary allows;
    - runtime tests and type-level assertions.
  - Acceptance:
    - async eager provider initializes during `freeze()`;
    - async eager provider is available via `get()`;
    - async lazy provider initializes on `getAsync()`;
    - `get()` and `tryGet()` on async lazy provider throw clear error;
    - failed lazy async initialization is not cached by default;
    - `runtime.getAsync()` / `runtime.tryGetAsync()` preserve token value inference;
    - `scope.getAsync()` resolves scoped async providers/resources;
    - runtime and scope disposal dispose resources and are idempotent;
    - runtime resolution and scope creation after `runtime.dispose()` fail with
      `RuntimeDisposedError`;
    - scope resolution after `scope.dispose()` fails with `ScopeDisposedError`;
    - Stage 7 does not implement async multi-provider, `getAllAsync()`, composer, DSL,
      diagnostics report/formatter, Next.js adapters or testing helpers;
    - `pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm lint` pass.
  - Guardrails:
    - не реалізовувати async multi-provider contributions through `add()`;
    - не реалізовувати `getAllAsync()` або `scope.getAllAsync()`;
    - не реалізовувати `cacheFailure()` for failed lazy initialization;
    - не створювати runtime-owned global/live scope registry;
    - не реалізовувати composer, modules, capabilities, required ports або bindings;
    - не реалізовувати DSL, Next.js adapters або testing helpers;
    - не реалізовувати full diagnostics layer: `SagifireIocError`,
      `DiagnosticReport` або `formatDiagnostics()`;
    - не додавати global mutable container або provider registry.

- Stage 8: Diagnostics.
  - Status: done after task-level human review.
  - Source: `SPEC.md` section 38.
  - Planning Task: `TASK-06.29-0015-stage-8-implementation-planning`.
  - Implementation Tasks:
    - `TASK-06.29-0016-stage-8-diagnostics-error-foundation` - done after task-level
      human review;
    - `TASK-06.29-0017-stage-8-diagnostic-reports-formatting` - done after task-level
      human review.
  - Implementation Decomposition:
    - Task 1 built the diagnostics error foundation and migrated existing Stage 3-7
      public typed errors.
    - Task 2 built diagnostic report types, formatting and the minimal bridge from typed
      errors to reports.
  - API Decisions:
    - error code convention is `SAGIFIRE_IOC_<AREA>_<REASON>`;
    - existing Stage 3-7 public code strings are preserved unless a direct conflict is
      found;
    - `SagifireIocError` becomes the shared base class for public IoC diagnostics errors;
    - existing concrete error classes remain public and keep class-specific `instanceof`
      behavior;
    - `details` should contain safe structured diagnostic data such as token IDs, provider
      kinds, actions, lifecycle modes, scope reasons and cycle paths;
    - `details` must not expose provider values, resource instances, scope-local values or
      private runtime internals;
    - diagnostic formatting must be deterministic, plain text and runtime-agnostic;
    - Stage 8 does not implement composer/module graph diagnostics because composer starts
      in Stage 9.
  - Implement: `SagifireIocError`, typed error classes, `Diagnostic`,
    `DiagnosticReport`, `formatDiagnostics()` and detailed messages.
  - Acceptance:
    - all common failure modes produce typed errors;
    - errors include codes and useful details;
    - formatted diagnostics are readable for humans and Codex.
  - Guardrails:
    - не реалізовувати composer, modules, capabilities, required ports, bindings, module
      graph validation or inspection APIs;
    - не реалізовувати duplicate module ID, missing required port, invalid binding,
      private provider exposure or module cycle diagnostics before Stage 9;
    - не змінювати provider resolution, async access, scope or disposal semantics;
    - не використовувати Node-only formatting APIs, terminal colors, Next.js, React,
      decorators or `reflect-metadata` in core.

- Stage 9: Composer and modules.
  - Status: done after task-level human review.
  - Source: `SPEC.md` section 39.
  - Planning Task: `TASK-06.30-0018-stage-9-implementation-planning`.
  - Implementation Tasks:
    - `TASK-06.30-0019-stage-9-module-definition-foundation` - done after task-level
      human review;
    - `TASK-06.30-0020-stage-9-composer-builder-bindings-validation` - done after
      task-level human review;
    - `TASK-06.30-0021-stage-9-module-setup-private-providers` - done after task-level
      human review;
    - `TASK-06.30-0022-stage-9-composed-runtime-capabilities` - done after task-level
      human review;
    - `TASK-06.30-0023-stage-9-inspection-api` - done after task-level human review.
  - Implementation Decomposition:
    - Task 1 built explicit module definition object API and `defineModule()`.
    - Task 2 built composer builder, composition binding registration and static
      validation.
    - Task 3 executed module setup and enforced private provider isolation.
    - Task 4 built composed runtime wrapper and exported capability registry.
    - Task 5 exposed safe composer/runtime inspection data.
  - Implemented:
    - `defineModule()`;
    - module definition/dependency/capability/setup types;
    - `createComposer()`;
    - `composer.use()`;
    - `composer.bind()`;
    - `composer.validate()`;
    - `composer.prepare()`;
    - `composer.compose()`;
    - module private provider contexts;
    - requires/provides metadata;
    - runtime capability registry;
    - module graph metadata;
    - `composer.inspect()`;
    - `composer.getGraph()`;
    - `runtime.inspect()` for composed runtime.
  - Acceptance:
    - multiple modules can be composed;
    - module IDs are unique;
    - provided single tokens are unique;
    - missing required ports fail validation;
    - bindings can satisfy required ports;
    - runtime exposes exported capabilities;
    - module internals are not exposed through runtime;
    - inspection returns useful module graph.
  - Guardrails Preserved:
    - module-level cycle detection was not implemented;
    - capability dependency edge detection was not implemented;
    - binding dependency edge detection was not implemented;
    - cycle path diagnostics were not added before Stage 10;
    - DSL helpers, testing helpers and Next.js adapters were not implemented;
    - filesystem auto-discovery, decorators, `reflect-metadata`, Node-only APIs and
      global mutable registries were not added to core.

- Stage 10: Module graph cycle detection.
  - Status: done after task-level human review.
  - Source: `SPEC.md` section 40.
  - Planning Task: `TASK-06.30-0024-stage-10-implementation-planning`.
  - Implementation Tasks:
    - `TASK-06.30-0025-stage-10-dependency-edge-model` - done after task-level human
      review;
    - `TASK-06.30-0026-stage-10-module-cycle-diagnostics` - done after task-level human
      review;
    - `TASK-06.30-0027-stage-10-runtime-inspection-hardening` - done after task-level
      human review.
  - Implementation Decomposition:
    - Task 1 adds explicit dependency edge metadata to module graph inspection.
    - Task 2 detects module cycles and emits typed diagnostics with cycle paths.
    - Task 3 hardens composed runtime inspection, binding-edge semantics and final
      regressions/docs.
  - API Decisions:
    - Capability dependency edge means required port consumer module -> provider module
      capability.
    - Binding dependency edge means required port consumer module -> explicit composition
      binding.
    - If a required port is satisfied by a binding, the graph records a binding edge and
      does not also create a module-to-module capability edge for that required port.
    - Module cycles are detected over module-to-module capability dependency edges.
    - Binding edges represent composition adapters and do not create module-level cycles by
      themselves.
    - `composer.validate()` must not execute binding factories, module provider factories
      or async resources to infer hidden dependencies.
    - Provider-level cycles inside factories remain existing container/runtime diagnostics.
    - Cycle diagnostics include safe structured module ID path and token/capability path.
  - Implement:
    - module dependency graph edge metadata;
    - capability dependency edges;
    - binding dependency edges;
    - module cycle detection;
    - typed cycle diagnostics;
    - cycle path details in validation reports;
    - composer and runtime inspection sync for dependency edges.
  - Acceptance:
    - module-level cycles are detected;
    - cycle path is included in diagnostics;
    - valid acyclic graphs compose successfully;
    - module graph inspection includes capability and binding dependency edges;
    - binding-satisfied required ports do not create false module cycle diagnostics.
  - Guardrails:
    - не реалізовувати DSL helpers `module()`, `defineApp()` або `adapt()`;
    - не реалізовувати `@sagifire/ioc-testing` graph assertions or module harnesses;
    - не реалізовувати Next.js adapters;
    - не виконувати factories/resources під час validation/inspection для hidden
      dependency inference;
    - не додавати filesystem auto-discovery, decorators, `reflect-metadata`, Node-only
      APIs or global mutable registries into core.

- Stage 11: DSL.
  - Status: done after task-level human review.
  - Source: `SPEC.md` section 41.
  - Planning Task: `TASK-07.01-0028-stage-11-implementation-planning`.
  - Implementation Tasks:
    - `TASK-07.01-0029-stage-11-module-dsl-foundation` - done after task-level human
      review;
    - `TASK-07.01-0030-stage-11-define-app-dsl` - done after task-level human review;
    - `TASK-07.01-0031-stage-11-bind-adapt-dsl` - done after task-level human review;
    - `TASK-07.01-0032-stage-11-dsl-hardening-docs` - done after task-level human
      review.
  - Implementation Decomposition:
    - Task 1 builds `module()` as an optional ergonomic layer over `defineModule()`.
    - Task 2 builds `defineApp()` and deterministic conversion to existing composer
      configuration.
    - Task 3 builds bind helper DSL and `adapt()` for explicit composition adapters.
    - Task 4 hardens DSL inference, exports, inspection parity and minimal docs.
  - API Decisions:
    - DSL is optional and object-configuration API remains fully usable.
    - `module()` must produce existing module definitions or an equivalent stable shape
      compatible with `defineModule()` and `createComposer().use()`.
    - `defineApp()` must convert to existing `createComposer()`, `composer.use()` and
      `composer.bind()` behavior instead of creating a parallel runtime.
    - `adapt()` must remain explicit adapter code for required ports and must not infer
      dependencies by executing factories during validation.
    - DSL-generated configuration must remain inspectable through existing composer and
      runtime graph APIs.
  - Acceptance:
    - DSL creates valid module and app configuration;
    - DSL requires no decorators, `reflect-metadata`, filesystem discovery or constructor
      metadata;
    - dependency graph remains visible through inspection APIs;
    - object API remains fully usable without DSL;
    - DSL does not add testing helpers, Next.js adapters or global app/container registry;
    - `pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm lint` pass.
  - Guardrails:
    - не реалізовувати `@sagifire/ioc-testing` helpers or graph assertions;
    - не реалізовувати Next.js adapters;
    - не додавати decorators, `reflect-metadata`, filesystem auto-discovery, global
      mutable app/container registry or service locator;
    - не виконувати factories/adapters during validation/inspection for hidden dependency
      inference;
    - не робити DSL required path for users of explicit object configuration.

- Stage 12: `@sagifire/ioc-testing`.
  - Status: done after task-level human review.
  - Source: `SPEC.md` section 42.
  - Planning Task: `TASK-07.01-0033-stage-12-implementation-planning`.
  - Implementation Tasks:
    - `TASK-07.01-0034-stage-12-testing-package-foundation` - done;
    - `TASK-07.01-0035-stage-12-overrides-test-composer` - done;
    - `TASK-07.01-0036-stage-12-module-harness-fake-modules` - done;
    - `TASK-07.01-0037-stage-12-graph-diagnostic-assertions` - done;
    - `TASK-07.01-0038-stage-12-testing-hardening-docs` - done.
  - Implementation Decomposition:
    - Task 1 replaces the placeholder package surface and builds isolated test runtime
      foundation.
    - Task 2 builds explicit override declarations and test composer helpers.
    - Task 3 builds fake modules and single-module harness helpers.
    - Task 4 builds graph and diagnostic assertion helpers.
    - Task 5 hardens final exports, package boundaries and docs.
  - API Decisions:
    - Testing helpers live in `@sagifire/ioc-testing`, not in core.
    - `@sagifire/ioc-testing` may depend on `@sagifire/ioc`; core must not depend on
      testing helpers.
    - Test runtimes/composers are created from fresh configuration.
    - Overrides apply before `freeze()` / `compose()` and never mutate frozen runtime.
    - Composer-level overrides should satisfy required ports or test wiring; replacing
      public capabilities should be modeled by fake/test modules.
    - Fake modules are explicit module definitions and remain visible in inspection.
    - Module harnesses preserve module-private provider isolation.
    - Graph assertions use public inspection data only.
    - Diagnostic assertions use public `DiagnosticReport` / typed error data only.
  - Acceptance:
    - test runtime helper creates isolated runtime configuration;
    - test composer helper composes modules with test-only overrides;
    - overrides apply before `compose()` / `freeze()`;
    - frozen runtime is never mutated;
    - single module harness works with fake required ports;
    - fake modules are explicit and inspectable;
    - graph assertions are readable in Vitest;
    - diagnostic assertions are deterministic and readable;
    - package exports for `@sagifire/ioc-testing` work;
    - `pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm lint` pass.
  - Guardrails:
    - не мутувати frozen `ContainerRuntime` або `ComposedRuntime`;
    - не використовувати private runtime internals для overrides or assertions;
    - не приховувати dependency graph за testing DSL magic;
    - не додавати filesystem auto-discovery or fixture auto-discovery;
    - не реалізовувати Next.js adapters, route/action scopes or framework helpers;
    - не додавати decorators, `reflect-metadata`, Node-only APIs or global mutable
      registries into core;
    - не змінювати core container/composer/runtime semantics без окремої task-level
      потреби.

## Recently Completed Stage 13

- Stage 13: `@sagifire/ioc-next`.
  - Status: done after task-level human review.
  - Source: `SPEC.md` section 43.
  - Planning Task: `TASK-07.01-0039-stage-13-implementation-planning`.
  - Implementation Tasks:
    - `TASK-07.01-0040-stage-13-next-runtime-foundation` - done;
    - `TASK-07.01-0041-stage-13-next-request-context` - done;
    - `TASK-07.01-0042-stage-13-route-handler-scope` - done;
    - `TASK-07.01-0043-stage-13-server-action-scope` - done;
    - `TASK-07.01-0044-stage-13-next-examples-hardening-docs` - done.
  - Implementation Decomposition:
    - Task 1 replaces the placeholder package surface and builds cached runtime helper.
    - Task 2 builds request context helper over explicit scope-local values.
    - Task 3 builds route handler scope helper and disposal lifecycle.
    - Task 4 builds server action scope helper and operation lifecycle.
    - Task 5 hardens exports/tests/boundaries and adds minimal Next integration docs and
      examples.
  - API Decisions:
    - Next adapter helpers live in `@sagifire/ioc-next`.
    - `@sagifire/ioc-next` may depend on `@sagifire/ioc`; `@sagifire/ioc` must not depend
      on `@sagifire/ioc-next`, Next.js or React.
    - Runtime caching belongs at adapter/application boundary and must not create a core
      global container or service locator.
    - Cached runtime initialization should deduplicate in-flight creation; failed
      initialization should remain retryable unless a task documents a stronger policy.
    - Request context is explicit scope-local data, not hidden async-local current request
      access.
    - Route handler and server action helpers create one scope per invocation and dispose
      it after callback execution on success and failure.
    - Route/action helpers pass runtime, scope and context explicitly to user callbacks.
    - Next.js/React dependencies should be peer or optional type-only dependencies only if
      an implementation task proves they are needed.
  - Implement:
    - `createNextRuntime()` or equivalent cached runtime helper;
    - request context helper through explicit token/value declarations;
    - route handler scope helper;
    - server action scope helper;
    - package exports and boundary tests;
    - minimal Next integration docs and App Router examples/snippets.
  - Acceptance:
    - adapter depends on `@sagifire/ioc`;
    - core has no Next.js, React or `@sagifire/ioc-next` dependency;
    - runtime can be cached safely without a hidden global core container;
    - request/operation scopes are created and disposed at framework boundaries;
    - request context values are explicit scope-local values;
    - route handler helper disposes scope on success and failure;
    - server action helper disposes scope on success and failure;
    - package exports for `@sagifire/ioc-next` work;
    - minimal Next integration docs/examples demonstrate boundary usage.
  - Guardrails:
    - не імпортувати Next.js або React з `@sagifire/ioc`;
    - не мутувати frozen `ContainerRuntime` або `ComposedRuntime`;
    - не створювати hidden global mutable container/service locator;
    - не додавати filesystem auto-discovery, route scanning або module discovery;
    - не додавати decorators, `reflect-metadata` або constructor metadata;
    - не змінювати `@sagifire/ioc-testing` helper surface;
    - не реалізовувати broad Stage 14 documentation/examples або Stage 15 release
      automation.

## Recently Completed Stage 14

- Stage 14: Documentation and examples.
  - Status: done after task-level human review.
  - Source: `SPEC.md` section 44.
  - Planning Task: `TASK-07.02-0045-stage-14-implementation-planning`.
  - Implementation Tasks:
    - `TASK-07.02-0046-stage-14-readme-package-docs` - done;
    - `TASK-07.02-0047-stage-14-core-container-async-docs` - done;
    - `TASK-07.02-0048-stage-14-composer-modules-diagnostics-docs` - done;
    - `TASK-07.02-0049-stage-14-testing-next-docs` - done;
    - `TASK-07.02-0050-stage-14-basic-node-module-examples` - done;
    - `TASK-07.02-0051-stage-14-async-db-testing-examples` - done;
    - `TASK-07.02-0052-stage-14-next-app-router-example-hardening` - done;
    - `TASK-07.02-0053-stage-14-migration-final-docs-hardening` - done.
  - Implementation Decomposition:
    - Task 1 rewrites root README, package READMEs and docs navigation.
    - Task 2 expands architecture, container and async model documentation.
    - Task 3 expands composer, modules and diagnostics documentation.
    - Task 4 expands testing and Next integration documentation.
    - Task 5 adds `basic-node` and `module-composition` examples.
    - Task 6 adds `async-db-resource` and `testing-overrides` examples.
    - Task 7 hardens the existing `next-app-router` example.
    - Task 8 writes the migration guide and performs final docs/examples hardening.
  - Documentation Scope:
    - root README and package READMEs;
    - architecture and package boundaries;
    - container, providers, lifetimes, scopes and scope-local values;
    - async model, async resources, `getAsync()` and disposal;
    - composer, modules, capabilities, required ports, bindings and inspection;
    - diagnostics, reports and formatting;
    - `@sagifire/ioc-testing` workflow;
    - `@sagifire/ioc-next` integration;
    - migration from typical DI container patterns.
  - Example Scope:
    - `examples/basic-node`;
    - `examples/module-composition`;
    - `examples/async-db-resource`;
    - `examples/testing-overrides`;
    - `examples/next-app-router`.
  - Decisions:
    - Stage 14 is documentation/examples only and must not introduce new runtime behavior.
    - Public docs describe implemented public API only.
    - Object-configuration API remains first-class; DSL is optional convenience.
    - Examples keep dependency graph explicit and inspectable.
    - Examples should be runnable or typechecked through existing workspace tooling where
      practical.
    - If a docs/example task discovers a public API gap, it records a follow-up instead of
      silently changing runtime behavior.
  - Acceptance:
    - public API is documented from README/package docs to deep guides;
    - async model is documented and demonstrated;
    - module isolation and graph inspection are documented and demonstrated;
    - Next.js integration is documented and demonstrated at framework boundaries;
    - testing workflow is documented and demonstrated;
    - migration guide exists;
    - required examples exist and are verified where practical.
  - Guardrails:
    - не реалізовувати new runtime behavior, public API changes or package export changes
      unless a task records a separate need and scope;
    - не додавати hidden filesystem discovery, route scanning, module discovery,
      decorators, `reflect-metadata`, constructor metadata or service locator behavior;
    - не мутувати frozen `ContainerRuntime` або `ComposedRuntime` in examples;
    - не імпортувати Next.js або React з `@sagifire/ioc`;
    - не додавати full Next.js dependency install without explicit task-level approval;
    - не реалізовувати Stage 15 release automation.

## Completed

- Stage 15: Release automation.
  - Status: done after task-level human review.
  - Source: `SPEC.md` section 45.
  - Planning Task: `TASK-07.02-0054-stage-15-implementation-planning`.
  - Implementation Tasks:
    - `TASK-07.02-0055-stage-15-repository-governance-artifacts` - done;
    - `TASK-07.02-0056-stage-15-package-publish-metadata` - done;
    - `TASK-07.02-0057-stage-15-changesets-versioning-changelog` - done;
    - `TASK-07.02-0058-stage-15-ci-quality-gates` - done;
    - `TASK-07.02-0059-stage-15-pack-dry-run-validation` - done;
    - `TASK-07.02-0060-stage-15-npm-publish-workflow-provenance` - done;
    - `TASK-07.02-0061-stage-15-release-docs-final-hardening` - done.
  - Implementation Decomposition:
    - Task 1 replaces placeholder governance artifacts and sets Apache 2.0 package license
      metadata.
    - Task 2 prepares package publish metadata and npm package contents declarations.
    - Task 3 configures Changesets or a documented equivalent for versioning and changelog
      generation.
    - Task 4 adds GitHub Actions CI quality gates.
    - Task 5 adds package dry-run validation and packed artifact export smoke checks.
    - Task 6 adds npm publish workflow with provenance support where practical.
    - Task 7 updates release docs and performs final release/readiness consistency
      hardening.
  - Decisions:
    - Use Apache License 2.0 for repository and publishable packages.
    - Protect `@sagifire/ioc` as the product mark.
    - Use GitHub Issues as the primary ordinary project contact/support channel.
    - Repository governance artifacts task must be first in Stage 15.
    - Changesets is the planned default for versioning/changelog; a task may document an
      equivalent replacement only if a concrete blocker is found.
    - Release automation should support npm provenance where practical.
    - Actual npm publishing requires explicit human approval and valid external
      repository/npm credentials.
  - Implement:
    - `LICENSE`, `NOTICE`, `CONTRIBUTING.md`, `SECURITY.md` and `TRADEMARKS.md`;
    - package license and publish metadata;
    - versioning/changelog workflow;
    - GitHub Actions CI;
    - npm package dry-run validation;
    - npm publish workflow with provenance support where practical;
    - final release documentation and Project Memory sync.
  - Acceptance:
    - governance artifacts exist and no longer contain placeholders;
    - package manifests use Apache 2.0 and publish-ready metadata;
    - packages can be versioned according to chosen strategy;
    - changelog generation is configured;
    - CI runs build, test, typecheck and lint;
    - release artifacts are valid and npm package exports work after package dry-run;
    - npm publish workflow exists and uses secrets/provenance safely where practical;
    - no actual publish happens without explicit human approval.
  - Guardrails:
    - не виконувати actual npm publish без explicit human approval;
    - не створювати, не логувати і не комітити npm tokens, GitHub secrets or credentials;
    - не заявляти про registered trademark без окремого підтвердження;
    - не просити користувачів публічно розкривати secrets or sensitive vulnerability
      details in GitHub Issues;
    - не змінювати runtime behavior, public API або package boundaries без окремої
      task-level потреби;
    - не редагувати `memory/sources/SPEC.md`.

## Planned

- Stage 16: `0.0.1` stabilization audit and critical fixes.
  - Status: planned; planning task завершена після task-level human review approval.
  - Source: human directive від 2026-07-02.
  - Planning Task: `TASK-07.02-0062-stage-16-implementation-planning`.
  - Operational Tasks:
    - `TASK-07.02-0063-stage-16-codebase-audit-report` - backlog;
    - `TASK-07.02-0064-stage-16-critical-fixes-from-audit` - backlog;
    - `TASK-07.02-0065-stage-16-version-0-0-1-stabilization-handoff` - backlog.
  - Implementation Decomposition:
    - Task 1 проводить аудит кодової бази і пише audit report повністю українською
      мовою.
    - Task 2 закриває кожну audit finding із критичністю `critical`.
    - Task 3 фіксує publishable package versions at `0.0.1` і переводить проект у
      stabilization mode після critical closure.
  - Decisions:
    - Stage 16 стартує тільки після завершення Stage 15 release/governance readiness.
    - Аудит і виправлення розділені, щоб audit findings лишались reviewable.
    - Audit report має бути повністю українською мовою.
    - Critical findings мають бути закриті до фіксації version `0.0.1`.
    - Non-critical findings мають стати follow-up tasks або documented risks, якщо вони не
      блокують critical fix чи final validation.
    - Existing Changesets/release tooling є default path для version `0.0.1`.
    - Actual npm publish залишається заблокованим без explicit human approval.
  - Audit Scope:
    - поведінка source code;
    - public API and package exports;
    - tests and type tests;
    - docs and examples;
    - release/versioning automation;
    - Project Memory consistency;
    - architecture/package boundary risks.
  - Acceptance:
    - існує повністю український audit report;
    - audit findings мають severity and evidence;
    - усі `critical` findings закриті або явно reclassified with rationale;
    - behavior changes from critical fixes мають tests;
    - publishable package manifests and changelogs fixed at `0.0.1`;
    - final release/stabilization validation проходить або limitations documented;
    - actual npm publish не виконується без explicit human approval.
  - Guardrails:
    - не фіксувати `0.0.1`, доки critical audit findings лишаються open;
    - не змішувати аудит і виправлення в одній task;
    - не робити broad refactor без прямої прив'язки до audit finding;
    - не змінювати runtime behavior поза межами critical fixes;
    - не виконувати actual npm publish без explicit human approval;
    - не редагувати `memory/sources/SPEC.md`.
