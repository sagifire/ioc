# Testing Requirements

Source trace: `SPEC.md` sections 46-49.

## Unit Tests

Cover:

- tokens;
- namespaces;
- provider registration;
- provider resolution;
- lifetimes;
- scopes;
- async providers;
- resources;
- disposal;
- diagnostics;
- DSL config conversion.

## Integration Tests

Cover:

- container + scope;
- container + async resources;
- composer + modules;
- composer + bindings;
- module isolation;
- runtime inspection;
- testing overrides;
- Next adapter with simulated route/action flow.

## Type Tests

Add type-level tests where practical.

Cover:

- token type inference;
- `runtime.get()` return type;
- `runtime.getAsync()` return type;
- factory context `get()` inference;
- module public API token inference;
- DSL inference.

Candidate tools:

- `tsd`;
- `expect-type`;
- Vitest type assertions.

Stage 3 choice:

- Use Vitest `expectTypeOf` for token type inference assertions.

Later stages may choose `tsd` or another dedicated type-test tool if Vitest assertions are
not enough for complex inference contracts.

## Tree-Shaking Tests

Verify:

- importing `@sagifire/ioc/tokens` does not include composer;
- importing `@sagifire/ioc/container` does not include Next adapter;
- core package does not import Next.js;
- `@sagifire/ioc-next` is separate;
- `sideEffects: false` is valid.

## Stage Rule

Every behavior-changing stage must add or update relevant tests. Stage 2 foundation should
add smoke tests or placeholder tests only if they validate package/export/build plumbing and
do not implement container logic.

Stage 3 must add runtime tests for token creation, namespace ID composition and invalid ID
rejection, plus type-level assertions for token value inference.

Stage 4 must add runtime tests for value/factory/class providers, singleton/transient
lifetimes, missing providers, `tryGet()`, duplicate single-provider token registration,
provider cycle detection and configuration immutability after `freeze()`. Stage 4 must also
add Vitest `expectTypeOf` assertions for `runtime.get()`, `runtime.tryGet()` and sync
factory context inference.

Stage 5 must add runtime tests for multi-provider `add().toValue()`,
`add().toFactory()`, registration order, `getAll()` missing-token behavior, fresh returned
arrays, strict single vs multi-provider validation, multi-provider factory lifetimes,
provider cycles through `get()` / `getAll()` and configuration immutability after
`freeze()`. Stage 5 must also add Vitest `expectTypeOf` assertions for `add()`,
`runtime.getAll()` and sync factory context `getAll()` inference.

Stage 6 must add runtime tests for `runtime.createScope()`, `runtime.withScope()`,
`Scope.get()`, `Scope.tryGet()`, `Scope.getAll()`, scope-local single value overrides,
scope-local multi value extensions, single/multi scope-local conflict validation, scoped
factory/class lifetimes, scoped multi-provider factory lifetimes, runtime-level scoped
provider rejection, scope-bound factory context resolution, provider cycles through scoped
resolution, idempotent `scope.dispose()`, disposed scope rejection, `withScope()` disposal
on success and failure, fresh scope `getAll()` arrays and configuration immutability after
`freeze()`. Stage 6 must also add Vitest `expectTypeOf` assertions for `Scope` resolution
APIs, `runtime.createScope()`, `runtime.withScope()` and scope-bound factory context
inference.

Stage 7 must add runtime tests for `toAsyncFactory()`, `toAsyncResource()`, async eager
initialization during `freeze()`, async eager access through `get()`, async lazy access
through `getAsync()`, invalid sync access to async lazy providers/resources,
`runtime.getAsync()`, `runtime.tryGetAsync()`, `scope.getAsync()`, sync providers through
async APIs, failed lazy initialization retry behavior, in-flight singleton/scoped
initialization de-duplication, async factory lifetimes, explicit resource ownership,
singleton resource disposal, scoped resource disposal, reverse disposal order where
possible, idempotent runtime/scope disposal, disposed runtime/scope rejection, async and
mixed sync/async provider cycles and Stage 4-6 regression cases affected by async
support. Stage 7 must also add Vitest `expectTypeOf` assertions for async binding APIs,
`runtime.getAsync()`, `runtime.tryGetAsync()`, `scope.getAsync()` and async factory context
inference.

Stage 8 diagnostics error foundation must add runtime tests for `SagifireIocError`,
diagnostics error options, optional `details`, optional `cause`, `isSagifireIocError()` or
equivalent type guard, and representative migrated errors from token, container, context,
async access and disposal layers. These tests must verify existing public code strings,
`instanceof Error`, class-specific `instanceof`, safe structured details and unchanged
runtime behavior for the failure modes that produce those errors. Stage 8 error foundation
must also add Vitest `expectTypeOf` assertions for the public diagnostics foundation API.

Stage 8 diagnostic reports and formatting must add runtime tests for `Diagnostic`,
`DiagnosticReport`, `formatDiagnostics()`, ok/empty reports, single diagnostics,
multi-diagnostic reports in input order, details rendering for Stage 3-7 errors and
generic handling of unknown errors. Formatter tests must keep output deterministic and
plain text. Stage 8 reports/formatter must also add Vitest `expectTypeOf` assertions for
report and formatter public API.

Stage 9 module definition foundation must add runtime tests for `defineModule()`,
dependency default normalization, module definition validation, duplicate
requires/provides rejection and public definition immutability. It must also add Vitest
`expectTypeOf` assertions for module metadata, required port token values and capability
token values.

Stage 9 composer builder/bindings/static validation must add runtime tests for
`createComposer()`, `composer.use()`, `composer.bind()`, deterministic module order,
duplicate module IDs, missing required ports, required ports satisfied by explicit
bindings, invalid binding targets and duplicate statically knowable single capabilities.
It must also add Vitest `expectTypeOf` assertions for composer binding token inference and
binding factory context inference.

Stage 9 module setup/private providers must add runtime tests for setup execution,
private provider registration, exported provider registration, module-bound context
resolution, declared required port resolution and rejection of another module's private
providers. It must also add Vitest `expectTypeOf` assertions for `ModuleSetupContext`
binding and resolution APIs.

Stage 9 composed runtime/capabilities must add runtime tests for composing multiple
modules, bindings satisfying required ports, exported capability resolution, required-port
bindings not being public by default, private provider hiding, duplicate provided single
tokens, missing required ports, sync/async/scoped/resource behavior through composed
runtime and typed validation failures. It must also add Vitest `expectTypeOf` assertions
for composed runtime token inference.

Stage 9 inspection API must add runtime tests for `composer.inspect()`,
`composer.getGraph()`, composed `runtime.inspect()`, deterministic inspection shape,
registered modules, required ports, capabilities, bindings, validation status and privacy
of provider values/private runtime internals. It must also add Vitest `expectTypeOf`
assertions for inspection public API.

Stage 9 tests must explicitly guard that module-level cycle detection, capability
dependency edge detection and binding dependency edge detection are not implemented before
Stage 10.
