# Testing

`@sagifire/ioc-testing` is the test-only companion package for `@sagifire/ioc`.
It helps tests build fresh container or composer configuration, apply explicit
overrides before `freeze()` / `compose()`, inspect the resulting graph and assert
diagnostics. It never patches an existing frozen `ContainerRuntime` or `ComposedRuntime`.

The package is useful when a test needs one of these workflows:

- an isolated container runtime for provider-level tests;
- a composed application graph with test bindings;
- a fake implementation module that replaces a real dependency module;
- a focused harness around one module under test;
- readable assertions over graph or diagnostic data.

All helpers are plain TypeScript helpers. They do not require Vitest at runtime, do not use
filesystem discovery and do not provide Next.js route/action adapters.

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

## Isolated Test Runtimes

Use `createTestRuntime()` for container-level tests: provider wiring, lifetimes, async
resources, disposal behavior or a small set of tokens without module composition.

The helper creates a new core `createContainer()` configuration per call, runs the optional
configuration callback, applies overrides and then calls `freeze()`.

```ts
import { token } from '@sagifire/ioc'
import { createTestRuntime, override } from '@sagifire/ioc-testing'

interface Logger {
    info(message: string): void
}

const LOGGER = token<Logger>('test.logger')

const runtime = await createTestRuntime({
    overrides: [
        override(LOGGER).toValue({
            info(): void {}
        })
    ]
})

runtime.get(LOGGER).info('created in an isolated runtime')

await runtime.dispose()
```

`createTestRuntime(configure)` receives the normal core `ContainerBuilder`, so tests can
use existing `bind()`, `add()`, sync providers, async providers and resources. Override
declarations support:

- `override(token).toValue(value)`
- `override(token).toFactory(factory)`
- `override(token).toClass(ClassConstructor)`
- `override(token).toAsyncFactory(factory)`
- `multiOverride(token).appendValue(value)`
- `multiOverride(token).appendValues(values)`
- `multiOverride(token).appendFactory(factory)`
- `multiOverride(token).appendAsyncFactory(factory, options?)`
- `multiOverride(token).appendAsyncResource(factory, { lifetime, initialization? })`
- `multiOverride(token).replaceWithValue(value)`
- `multiOverride(token).replaceWithValues(values)`
- `multiOverride(token).replaceWithFactory(factory)`
- `multiOverride(token).replaceWithAsyncFactory(factory, options?)`
- `multiOverride(token).replaceWithAsyncResource(factory, { lifetime, initialization? })`

Duplicate overrides for the same token fail with `DuplicateTestOverrideError` before the
configuration callback runs. A test runtime is independent from every other runtime created
by the helper. Multi override `replaceWith*()` entries replace previous test contribution
declarations for the same token in the same helper input; they do not remove module
contributions or mutate an existing runtime.

Async factory options project only production lifecycle choices: `lifetime` may be
`singleton`, `transient` or `scoped`, and `initialization` may be `lazy` or `eager`.
Async resources require `lifetime: 'singleton' | 'scoped'`. Invalid combinations are not
reinterpreted by the testing package; normal production validation rejects them.

The helpers preserve production collection semantics: `getAllAsync()` is sequential and
registration-ordered, failed contribution state retries per provider, successful
singleton/scoped work is reused, resources remain runtime/scope-owned, and a failure
returns no partial array. That last guarantee is return atomicity, not rollback of
arbitrary user factory side effects.

## Test Composers

Use `createTestComposer()` when the test should exercise modules, required ports,
composition bindings, validation or inspection.

The helper creates a new core `createComposer()` configuration per call, registers the
provided modules, runs the optional composer configuration callback, applies overrides as
explicit composer bindings and returns the normal `Composer` API.

```ts
const composer = createTestComposer({
    modules: [contactRequestsModule],
    overrides: [
        override(CONTACT_REQUESTS_AUTH_READER).toValue({
            currentUserId(): string {
                return 'test-user'
            }
        })
    ]
})

assertDiagnosticReportOk(composer.validate())

const runtime = await composer.compose()
const contactRequests = runtime.get(CONTACT_REQUESTS_PUBLIC_API)

await runtime.dispose()
```

Composer overrides are visible in inspection data as binding records and binding dependency
edges. They satisfy required ports, but they do not create a fake module and they do not
turn the overridden token into a public runtime capability by themselves.

`multiOverrides` use the public `add()` API on the fresh test composer. This is useful for
declared multi-capabilities:

```ts
const composer = createTestComposer({
    modules: [auditConsumerModule, fakeAuditModule],
    multiOverrides: [
        multiOverride(AUDIT_EVENTS).replaceWithValues(['test-started']),
        multiOverride(AUDIT_EVENTS).appendValue('test-finished')
    ]
})
```

## Overrides Or Fake Modules

Choose the smallest helper that matches the behavior under test.

Use an override when the test needs to provide a token value directly:

- a required port should be satisfied by a small test double;
- a module under test should see a fake external dependency;
- the graph should record a composition-level binding edge;
- the test is not trying to model a full provider module.

```ts
const harness = createModuleHarness({
    module: contactRequestsModule,
    overrides: [
        override(CONTACT_REQUESTS_AUTH_READER).toFactory(() => {
            return {
                currentUserId(): string {
                    return 'override-user'
                }
            }
        })
    ]
})
```

Use a fake module when the test should replace a module-level capability provider:

- the dependency should appear in the module graph as a provider module;
- graph assertions should verify capability dependency edges;
- the fake has several provided capabilities;
- the test should preserve the same module isolation shape as production composition.

```ts
const fakeAuthModule = fakeModule('test-auth', {
    provides: [
        {
            token: CONTACT_REQUESTS_AUTH_READER,
            useValue: {
                currentUserId(): string {
                    return 'fake-user'
                }
            }
        }
    ]
})

const harness = createModuleHarness({
    module: contactRequestsModule,
    fakeModules: [fakeAuthModule]
})
```

Fake modules are normal explicit module definitions. They declare `provides` metadata and
their generated setup binds fake values, factories or async factories through the existing
module setup API. They remain visible through `composer.getGraph()`, `composer.inspect()`
and `runtime.inspect()`.

For multi-capabilities, fake module providers may set `cardinality: 'multi'`. Value and
synchronous/async factory and async resource providers are then registered through public
`context.add()`. Async fake providers use the same `lifetime` and `initialization` fields
as async multi overrides; resources require explicit runtime/scope ownership.

## Module Harnesses

Use `createModuleHarness()` for the common case: one module under test plus the smallest
set of support modules, fake modules and required-port overrides needed to compose it.

```ts
const clockSupportModule = fakeModule('test-clock', {
    provides: [
        {
            token: CLOCK,
            kind: 'shared-service',
            useValue: {
                now(): string {
                    return '2026-07-02'
                }
            }
        }
    ]
})

const harness = createModuleHarness({
    module: auditedContactRequestsModule,
    supportModules: [clockSupportModule],
    fakeModules: [fakeAuthModule]
})

assertDiagnosticReportOk(harness.validate())

const graph = harness.getGraph()
const runtime = await harness.compose()

await runtime.dispose()
```

The harness exposes:

- `module`, `supportModules`, `fakeModules` and `modules`;
- the underlying `composer`;
- `validate()`;
- `inspect()`;
- `getGraph()`;
- `prepare()`;
- `compose()`.

The harness does not weaken module privacy. Module-private providers stay private, public
resolution still goes through declared capabilities and scoped providers/resources keep the
same core lifecycle rules.

## Graph Assertions

Graph assertions read public inspection data only. They accept `ModuleGraph`,
`ComposerInspection` or `RuntimeInspection`.

```ts
assertGraphHasModule(harness.getGraph(), 'contact-requests')

assertGraphHasCapability(harness.inspect(), {
    moduleId: 'contact-requests',
    tokenId: CONTACT_REQUESTS_PUBLIC_API.id,
    kind: 'public-api'
})

assertGraphHasRequiredPort(harness.getGraph(), {
    moduleId: 'contact-requests',
    tokenId: CONTACT_REQUESTS_AUTH_READER.id,
    satisfiedBy: 'capability'
})

assertGraphHasBinding(harness.getGraph(), {
    tokenId: CLOCK.id,
    kind: 'value',
    providerKind: 'value'
})

assertGraphHasEdge(harness.getGraph(), {
    edgeKind: 'capability',
    consumerModuleId: 'contact-requests',
    requiredTokenId: CONTACT_REQUESTS_AUTH_READER.id,
    providerModuleId: 'test-auth',
    capabilityTokenId: CONTACT_REQUESTS_AUTH_READER.id
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
    adapterTargetTokenId: CONTACT_REQUESTS_AUTH_READER.id,
    adapterSourceTokenId: AUTH_PUBLIC_API.id
})
```

Failed graph assertions throw `GraphAssertionError` with deterministic plain-text messages
that include the available modules, capabilities, required ports, bindings or dependency
edges.

## Canonical Graph Export Snapshots

Use `assertGraphExportSnapshot()` when exact portable graph structure matters more than a
focused graph predicate:

```ts
assertGraphExportSnapshot(composer.getGraph(), expectedCanonicalJson)
```

The helper accepts `ModuleGraph`, `ComposerInspection`, `RuntimeInspection` or an existing
`GraphExportDocument`. It projects through the public graph export API and compares exact
canonical JSON bytes. A mismatch throws `GraphExportSnapshotAssertionError` with the first
differing line. The helper does not read or update files; snapshot I/O and explicit update
commands belong to the test runner or application edge. See the
[graph export workflow](graph-export.md).

## Child Scope Assertions

Child scope assertions use public scope APIs and dispose the temporary child scope created
for the assertion:

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

await assertChildScopeHasValues({
    parent: requestScope,
    token: AUDIT_EVENTS,
    options: {
        multiValues: [[AUDIT_EVENTS, 'child-event']]
    },
    expectedValues: ['parent-event', 'child-event'],
    expectedParentValues: ['parent-event']
})
```

## Diagnostic Assertions

Diagnostic assertions work with the core diagnostics model:

```ts
assertDiagnosticReportOk(composer.validate())

assertDiagnosticReportHasDiagnostic(composer.validate(), {
    code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
    severity: 'error',
    messageIncludes: CONTACT_REQUESTS_AUTH_READER.id
})

assertErrorDiagnostic(error, {
    code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_ID'
})
```

Use `assertDiagnosticReportOk()` when a report must be valid and empty. Use
`assertDiagnosticReportHasDiagnostic()` when the test expects a specific diagnostic code,
severity, message or details. Use `assertErrorDiagnostic()` when code under test throws a
typed IoC error and the test should assert the diagnostic derived from that error.

Failed diagnostic assertions throw `DiagnosticAssertionError`. Inputs are not mutated.

## Provider Graph And Lifetime Assertions

Pass `lifetimeValidation` to `createTestRuntime()`, `createTestComposer()` or
`createModuleHarness()` to exercise the same production policy. Factory overrides and fake
factory/resource providers accept `ProviderDependencyOptions`; async multi options additionally
accept `dependencies` beside their lifecycle fields.

```ts
const runtime = await createTestRuntime({
    lifetimeValidation: {
        mode: 'report',
        coverage: 'summary'
    },
    configure(container) {
        container.bind(REQUEST).toValue(request)
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

const inspection = runtime.inspect()

assertProviderGraphHasNode(inspection, {
    key: { visibility: 'public', tokenId: SERVICE.id },
    providerKind: 'factory'
})
assertProviderGraphHasDependencyEdge(inspection, {
    consumer: { visibility: 'public', tokenId: SERVICE.id },
    dependency: { visibility: 'public', tokenId: REQUEST.id }
})
assertProviderGraphHasCoverage(inspection, {
    provider: { visibility: 'public', tokenId: SERVICE.id },
    coverage: 'declared'
})
assertProviderGraphCoverage(inspection, 'complete')
assertLifetimeValidationReportHasDiagnostic(inspection.lifetimeValidation!, {
    code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE'
})
```

Ownership assertions inspect only derived `runtime | scope` edges. Scope wrappers call the public
`scope.inspect()` method. Private expectation keys use module ID and registration index; assertion
messages never reveal private token IDs. See
[lifetime dependency validation](lifetime-validation.md) for matrix, coverage and staged adoption.

## Runnable Example

See [`examples/testing-overrides`](../examples/testing-overrides/README.md) for a complete
workspace example that uses `createTestRuntime()`, `createTestComposer()`, `override()`,
`fakeModule()`, `createModuleHarness()` and graph/diagnostic assertions without mutating
frozen runtimes.

## Boundaries

`@sagifire/ioc-testing` depends on `@sagifire/ioc`, but the core package does not import
the testing package. The helpers create fresh test configuration and apply overrides before
runtime freeze or composition. They do not mutate frozen runtimes, monkey-patch core
internals, read private provider values, infer hidden dependencies by executing factories
for assertion setup or discover fixtures from the filesystem.

Next.js request context, route handler scopes and server action scopes belong to
`@sagifire/ioc-next`, not to the testing package.
