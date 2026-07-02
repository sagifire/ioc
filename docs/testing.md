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
    assertGraphHasEdge,
    assertGraphHasModule,
    assertGraphHasRequiredPort,
    createModuleHarness,
    createTestComposer,
    createTestRuntime,
    fakeModule,
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

Duplicate overrides for the same token fail with `DuplicateTestOverrideError` before the
configuration callback runs. A test runtime is independent from every other runtime created
by the helper.

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
```

Failed graph assertions throw `GraphAssertionError` with deterministic plain-text messages
that include the available modules, capabilities, required ports, bindings or dependency
edges.

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
