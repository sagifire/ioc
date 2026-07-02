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

Stage 10 dependency edge model must add runtime tests for `composer.getGraph()`,
`composer.inspect()` and composed runtime graph metadata where applicable. Tests must cover
capability dependency edges, binding dependency edges, deterministic edge ordering, binding
priority over capability satisfaction and privacy of provider values/private runtime
internals. It must also add Vitest `expectTypeOf` assertions for public edge types.

Stage 10 module cycle diagnostics must add runtime tests for simple two-module cycles,
longer cycles, valid acyclic graphs, binding-satisfied required ports that avoid false
module cycles and deterministic cycle diagnostics. Diagnostics tests must verify module ID
paths and token/capability paths without exposing provider values.

Stage 10 runtime inspection hardening must add regression tests that validation and
inspection do not execute binding factories, module provider factories or async resources
to infer dependencies. Provider-level cycles inside factories must continue to surface as
container/provider diagnostics when resolution actually happens. Stage 9 no-edge/no-cycle
guard assertions should be replaced with Stage 10 edge/cycle assertions.

Stage 11 module DSL foundation must add runtime tests for `module()` conversion to existing
module definitions, explicit required ports/capabilities, validation reuse and composer
compatibility. It must also add Vitest `expectTypeOf` assertions for module DSL token
inference.

Stage 11 `defineApp()` DSL must add runtime tests for deterministic app DSL conversion to
existing composer configuration, validation/inspection/compose behavior and graph parity
with equivalent object API configuration. It must also add Vitest `expectTypeOf`
assertions for app DSL inference.

Stage 11 bind/adapt DSL must add runtime tests for supported bind helper conversions,
`adapt()` behavior, binding priority, deterministic binding dependency edges and
non-execution of adapter/binding factories during validation/inspection. It must also add
Vitest `expectTypeOf` assertions for required port token value, adapter output and context
access inference.

Stage 11 DSL hardening must add final regression tests for root and `@sagifire/ioc/dsl`
exports, DSL-generated graph inspection parity, no decorators/metadata/discovery/global
registry behavior and documentation examples that keep object API first-class.

Stage 12 testing package foundation must add runtime tests for `@sagifire/ioc-testing`
public exports, isolated test runtime creation, explicit test container configuration,
fresh runtime/configuration per helper call, provider resolution through existing core
runtime APIs and disposal behavior. It must also add Vitest `expectTypeOf` assertions for
testing runtime helper inference and package export smoke coverage for
`@sagifire/ioc-testing`.

Stage 12 overrides/test composer must add runtime tests for explicit override
declarations, applying overrides before `freeze()` / `compose()`, duplicate override
rejection, test composer creation from fresh configuration, required-port override
validation, graph visibility after overrides and no mutation of frozen runtime. It must
also add Vitest `expectTypeOf` assertions for override token inference and test composer
helper types.

Stage 12 module harness/fake modules must add runtime tests for fake module creation,
single-module harness composition, fake required ports, support modules, public capability
resolution through composed runtime, private provider isolation and graph inspection
visibility. It must also add Vitest `expectTypeOf` assertions for fake module and harness
inference.

Stage 12 graph/diagnostic assertions must add runtime tests for passing and failing graph
assertions, deterministic failure messages, module/capability/required-port/binding/edge
checks, diagnostic report checks, typed error-derived diagnostic checks and non-mutation of
input graph/diagnostic objects. It must also add Vitest `expectTypeOf` assertions for
assertion helper input types.

Stage 12 testing hardening/docs must add final regression tests for the complete
`@sagifire/ioc-testing` public API, package exports, core-to-testing package boundary, no
Next.js adapter behavior in the testing package, final helper inference and docs examples
that demonstrate overrides applying before `freeze()` / `compose()` without mutating frozen
runtime.

Stage 13 Next runtime foundation must add runtime tests for `@sagifire/ioc-next` public
exports, cached runtime creation, cache reuse, in-flight initialization de-duplication,
failed initialization retry/cache policy and no mutation of existing frozen runtimes. It
must also add Vitest `expectTypeOf` assertions for cached runtime helper inference and
package export smoke coverage for `@sagifire/ioc-next`.

Stage 13 request context must add runtime tests for explicit request context creation,
conversion to core scope options, single and multi request-local values, deterministic
duplicate/conflict behavior through existing core validation and public immutability of
context declarations. It must also add Vitest `expectTypeOf` assertions for request
context helper inference.

Stage 13 route handler scope must add runtime tests using simulated route invocation for
successful execution, thrown handler disposal, request-scoped value visibility, async
callback behavior, explicit runtime/scope/context callback data and absence of hidden
current request APIs. It must also add Vitest `expectTypeOf` assertions for route handler
callback inference.

Stage 13 server action scope must add runtime tests using simulated action invocation for
successful execution, thrown action disposal, action-scoped value visibility, async
callback behavior, explicit runtime/scope/context callback data, action argument/return
type inference and independence from route request/response behavior. It must also add
Vitest `expectTypeOf` assertions for server action helper inference.

Stage 13 Next examples/hardening/docs must add final regression tests for the complete
`@sagifire/ioc-next` public API, package exports, core-to-next package boundary,
testing-to-next package boundary, no filesystem auto-discovery, no hidden current
request/action service locator and docs/examples that demonstrate App Router boundary
usage without placing business logic in route/action handlers.

Stage 14 README/package documentation must be verified with relevant formatting/link
checks where available and by reviewing snippets against implemented public API. If full
build/test/typecheck/lint is not relevant to docs-only changes, the task result must say
why.

Stage 14 core/container/async docs must verify snippets against implemented APIs where
practical and explicitly guard the documented sync/async boundary: `get()` remains sync and
async providers/resources use explicit async access.

Stage 14 composer/modules/diagnostics docs must verify object API and DSL snippets against
implemented APIs where practical. Docs must keep validation/inspection non-execution of
user factories clear.

Stage 14 testing/Next docs must verify helper names and workflow snippets against current
package exports. Testing docs must preserve the rule that overrides apply before
`freeze()` / `compose()`. Next docs must preserve explicit request/action context and scope
disposal behavior.

Stage 14 example tasks must choose the smallest sufficient verification path per example:

- run the example if it is executable without external services;
- typecheck example source if a runtime command would require unavailable framework
  infrastructure;
- add targeted tests only when they validate example behavior without duplicating existing
  package tests;
- record a manual check only when the example is intentionally framework-shaped and cannot
  run without dependencies that were not approved.

Stage 14 final docs hardening must check docs/example links, stale placeholder language,
claims about unimplemented release automation and consistency between README, package
READMEs, deep docs and examples.

Stage 15 repository governance artifacts must verify that placeholder license/notice text
is gone, package manifests use Apache 2.0, contribution/security/trademark documents are
discoverable and no policy asks users to post secrets or sensitive vulnerability details in
public issues.

Stage 15 package metadata must verify package manifests parse, package metadata is
consistent across publishable packages, root workspace remains private and package `files`
entries include intended release artifacts.

Stage 15 versioning/changelog setup must verify the chosen tool can run locally where
practical, version/changelog scripts exist and no actual publish occurs.

Stage 15 CI quality gates must verify workflow YAML by review or tooling where practical
and run local equivalents for build, test, typecheck and lint unless the task documents a
concrete limitation.

Stage 15 package dry-run validation must build packages, run package dry-run for all
publishable packages, inspect package contents and smoke-test package exports/types from
packed artifacts where practical.

Stage 15 npm publish workflow/provenance must verify the workflow references secrets
safely, runs validation before publish and supports npm provenance where practical. The
task must not execute actual publish without explicit human approval.

Stage 15 final release hardening must re-run relevant release checks, scan docs for stale
release/publishing claims and sync Project Memory with the final Stage 15 state.
