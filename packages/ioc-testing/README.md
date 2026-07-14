# @sagifire/ioc-testing

Testing helpers for `@sagifire/ioc`.

This package creates fresh test-only container/composer configuration before
`freeze()` or `compose()`. It never patches an existing frozen `ContainerRuntime` or
`ComposedRuntime`.

The package is currently used from the workspace. The manifest is `0.0.2` and
`Apache-2.0` with npm publish metadata, Changesets versioning, package dry-run validation
and a manual npm publish workflow. Actual npm publishing remains gated by explicit human
approval and external GitHub/npm settings. This README describes the current `0.0.2`
manifest plus unreleased workspace additions; it is not a version or publish-readiness
claim.

## Imports

```ts
import {
    assertDiagnosticReportHasDiagnostic,
    assertDiagnosticReportOk,
    assertErrorDiagnostic,
    assertGraphHasBinding,
    assertGraphHasCapability,
    assertGraphHasAdapterSourceEdge,
    assertGraphHasEdge,
    assertGraphHasModule,
    assertGraphHasMultiCapability,
    assertGraphHasMultiCapabilityProvider,
    assertGraphHasRequiredPort,
    assertGraphExportSnapshot,
    assertProviderGraphCoverage,
    assertProviderGraphHasDependencyEdge,
    assertProviderGraphHasNode,
    assertLifetimeValidationReportHasDiagnostic,
    assertChildScopeHasValue,
    assertChildScopeHasValues,
    createModuleHarness,
    createTestComposer,
    createTestRuntime,
    fakeModule,
    multiOverride,
    override
} from '@sagifire/ioc-testing'
```

The package exposes a root export only and depends on `@sagifire/ioc`.

## Public Surface

- Runtime helpers: `createTestRuntime(configure?)` and
  `createTestRuntime({ configure, overrides, multiOverrides, lifetimeValidation })`.
- Override declarations: `override(token).toValue()`, `toFactory()`, `toClass()` and
  `toAsyncFactory()`.
- Multi contribution declarations: `multiOverride(token).appendValue()`, `appendValues()`,
  `appendFactory()`, `appendAsyncFactory()`, `appendAsyncResource()`,
  `replaceWithValue()`, `replaceWithValues()`, `replaceWithFactory()`,
  `replaceWithAsyncFactory()` and `replaceWithAsyncResource()`.
- Composer helpers: `createTestComposer(configure?)` and
  `createTestComposer({ modules, configure, overrides, multiOverrides, lifetimeValidation })`.
- Fake modules: `fakeModule(definition)` and `fakeModule(id, definition)`.
- Module harnesses:
  `createModuleHarness({ module, supportModules, fakeModules, overrides, multiOverrides })`.
- Graph assertions: `assertGraphHasModule()`, `assertGraphHasCapability()`,
  `assertGraphHasMultiCapability()`, `assertGraphHasMultiCapabilityProvider()`,
  `assertGraphHasRequiredPort()`, `assertGraphHasBinding()`, `assertGraphHasEdge()` and
  `assertGraphHasAdapterSourceEdge()`.
- Canonical export assertion: `assertGraphExportSnapshot()` through public graph export APIs.
- Provider inspection assertions: nodes, dependency/ownership edges, per-provider and aggregate
  coverage, lifetime diagnostics and focused scope inspection wrappers.
- Child scope assertions: `assertChildScopeHasValue()` and `assertChildScopeHasValues()`.
- Diagnostic assertions: `assertDiagnosticReportOk()`,
  `assertDiagnosticReportHasDiagnostic()` and `assertErrorDiagnostic()`.
- Error classes: `DuplicateTestOverrideError`, `GraphAssertionError`,
  `ScopeAssertionError` and `DiagnosticAssertionError`.

## Test Runtime

```ts
import { token } from '@sagifire/ioc'
import { createTestRuntime, override } from '@sagifire/ioc-testing'

const LOGGER = token<{ info(message: string): void }>('test.logger')

const runtime = await createTestRuntime({
    overrides: [
        override(LOGGER).toValue({
            info(): void {}
        })
    ]
})

runtime.get(LOGGER)
await runtime.dispose()
```

Overrides are explicit token-level declarations. Duplicate override declarations fail
deterministically.

## Test Composer

`createTestComposer()` creates a fresh core composer configuration, applies modules,
explicit configuration and overrides, then returns the normal composer API:

```ts
const composer = createTestComposer({
    modules: [contactRequestsModule],
    overrides: [
        override(CONTACT_AUTH_READER).toValue({
            currentUserId(): string {
                return 'test-user'
            }
        })
    ]
})

assertDiagnosticReportOk(composer.validate())

const runtime = await composer.compose()
```

Composer overrides are visible as explicit binding edges in inspection data.

Multi contribution helpers are also applied to the fresh composer before `compose()`:

```ts
const composer = createTestComposer({
    modules: [auditConsumerModule, fakeAuditModule],
    multiOverrides: [
        multiOverride(AUDIT_EVENTS).replaceWithValues(['test-started']),
        multiOverride(AUDIT_EVENTS).appendValue('test-finished')
    ]
})
```

`replaceWith*()` replaces previous test contribution declarations for that token in the
same helper input. It does not remove module contributions or mutate an existing composed
runtime.

Async factory overrides accept optional production lifecycle choices (`lifetime` and
`initialization`). Async resource overrides require explicit singleton/scoped lifetime.
Helpers pass those choices through public `add()` builders and keep production ordering,
retry, scope, ownership, disposal and no-partial-array behavior.

## Fake Modules And Harnesses

Fake modules are normal explicit module definitions:

```ts
const fakeAuthModule = fakeModule('test-auth', {
    provides: [
        {
            token: CONTACT_AUTH_READER,
            useValue: {
                currentUserId(): string {
                    return 'test-user'
                }
            }
        }
    ]
})
```

For declared multi-capabilities, fake module providers can set `cardinality: 'multi'`;
values, sync/async factories and async resources are registered through public
`context.add()`. Async resources require explicit `lifetime: 'singleton' | 'scoped'`.

Module harnesses compose one module under test with support modules, fake modules or
explicit required-port overrides:

```ts
const harness = createModuleHarness({
    module: contactRequestsModule,
    fakeModules: [fakeAuthModule]
})

const graph = harness.getGraph()
const runtime = await harness.compose()
```

Fake modules remain visible through public graph inspection, and module-private providers
remain hidden behind normal composed runtime capability access.

## Assertions

Lifetime assertions read only public immutable provider inspection data. Test runtime,
composer and harness options accept the same opt-in `lifetimeValidation` policy as production;
factory overrides, multi overrides and fake factory/resource providers preserve explicit
dependency metadata:

```ts
const runtime = await createTestRuntime({
    lifetimeValidation: {
        mode: 'report',
        coverage: 'summary'
    },
    overrides: [
        override(SERVICE).toFactory(createService, {
            dependencies: [
                {
                    token: REQUEST,
                    access: 'instance'
                }
            ]
        })
    ]
})

assertProviderGraphCoverage(runtime.inspect(), 'complete')
assertProviderGraphHasDependencyEdge(runtime.inspect(), {
    consumer: { visibility: 'public', tokenId: SERVICE.id },
    dependency: { visibility: 'public', tokenId: REQUEST.id },
    access: 'instance'
})
```

Provider node, dependency-edge, ownership-edge and per-provider coverage assertions accept
`ProviderInspection`, `RuntimeInspection`, a normalized provider graph or a public `Scope`.
`assertScopeInspectionHasProviderNode()` and
`assertScopeInspectionHasDependencyEdge()` are focused wrappers over `scope.inspect()`.
Lifetime report assertions use the public `LifetimeValidationReport`; no helper reads container
records or mutates a frozen runtime.

Canonical JSON snapshots can cover the complete portable graph without parsing DOT or
Mermaid labels:

```ts
assertGraphExportSnapshot(harness.getGraph(), expectedCanonicalJson)
```

The helper performs no filesystem access. It throws `GraphExportSnapshotAssertionError`
with the first differing line; file reads and explicit snapshot updates stay at the test
runner edge.

Graph assertions read `ModuleGraph`, `ComposerInspection` or `RuntimeInspection` data:

```ts
assertGraphHasModule(harness.getGraph(), 'contact-requests')
assertGraphHasEdge(harness.inspect(), {
    edgeKind: 'binding',
    requiredTokenId: CONTACT_AUTH_READER.id,
    bindingTokenId: CONTACT_AUTH_READER.id
})
assertGraphHasMultiCapability(harness.getGraph(), {
    tokenId: AUDIT_EVENTS.id,
    providerCount: 2
})
assertGraphHasMultiCapabilityProvider(harness.getGraph(), {
    tokenId: AUDIT_EVENTS.id,
    moduleId: 'audit-module'
})
assertGraphHasAdapterSourceEdge(harness.getGraph(), {
    adapterTargetTokenId: CONTACT_AUTH_READER.id,
    adapterSourceTokenId: AUTH_PUBLIC_API.id
})
```

Child scope assertions create and dispose child scopes through public scope APIs:

```ts
await assertChildScopeHasValue({
    parent: requestScope,
    token: CURRENT_USER_ID,
    options: {
        values: [[CURRENT_USER_ID, 'impersonated-user']]
    },
    expectedValue: 'impersonated-user',
    expectedParentValue: 'original-user'
})
```

Diagnostic assertions read `DiagnosticReport` data or diagnostics derived from typed
errors:

```ts
assertDiagnosticReportOk(harness.validate())
assertDiagnosticReportHasDiagnostic(harness.validate(), {
    code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT'
})
assertErrorDiagnostic(error, {
    code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_ID'
})
```

Assertion failures throw deterministic plain `Error` subclasses and do not require a
runtime dependency on Vitest internals.

## Boundaries

- `@sagifire/ioc-testing` may depend on `@sagifire/ioc`.
- `@sagifire/ioc` must not import this package.
- Testing helpers must not use filesystem or fixture auto-discovery.
- Next.js, React, route handler helpers and server action helpers belong to
  `@sagifire/ioc-next`.

## Governance

- [License](LICENSE) - Apache License, Version 2.0.
- [Notices](NOTICE) - package notices and attribution.
- [Contributing](../../CONTRIBUTING.md) - contribution flow and GitHub Issues support
  channel.
- [Security](../../SECURITY.md) - security-sensitive reporting policy.
- [Trademarks](../../TRADEMARKS.md) - `@sagifire/ioc` product mark usage guidance.
- [Changelog](CHANGELOG.md) - package release history.
- [Release workflow](../../docs/release.md) - release PRs, validation, manual publish and
  provenance notes.

## More Documentation

- [Testing guide](../../docs/testing.md)
- [Lifetime dependency validation](../../docs/lifetime-validation.md)
- [Testing overrides example](../../examples/testing-overrides/README.md)
- [Diagnostics](../../docs/diagnostics.md)
- [Composer](../../docs/composer.md)
