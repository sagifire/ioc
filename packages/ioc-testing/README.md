# @sagifire/ioc-testing

Testing helpers for `@sagifire/ioc`.

Current public API:

- `createTestRuntime(configure?)`
- `createTestRuntime({ configure, overrides })`
- `override(token)`
- `createTestComposer(configure?)`
- `createTestComposer({ modules, configure, overrides })`
- `fakeModule(definition)` / `fakeModule(id, definition)`
- `createModuleHarness({ module, supportModules, fakeModules, overrides })`
- `assertGraphHasModule(graph, moduleId)`
- `assertGraphHasCapability(graph, expectation)`
- `assertGraphHasRequiredPort(graph, expectation)`
- `assertGraphHasBinding(graph, expectation)`
- `assertGraphHasEdge(graph, expectation)`
- `assertDiagnosticReportOk(report)`
- `assertDiagnosticReportHasDiagnostic(report, expectation)`
- `assertErrorDiagnostic(error, expectation)`

`createTestRuntime()` creates a fresh core container configuration, applies the explicit
test configuration callback and override declarations if provided, then returns a frozen
`ContainerRuntime`.

Example:

```ts
import { token } from '@sagifire/ioc'
import {
    assertDiagnosticReportOk,
    assertErrorDiagnostic,
    assertGraphHasEdge,
    assertGraphHasModule,
    createTestComposer,
    createTestRuntime,
    override
} from '@sagifire/ioc-testing'

const LOGGER = token<{ readonly name: string }>('test.logger')

const runtime = await createTestRuntime({
    overrides: [
        override(LOGGER).toValue({
            name: 'test'
        })
    ]
})

runtime.get(LOGGER)
await runtime.dispose()
```

`createTestComposer()` creates a fresh core composer configuration, applies modules,
explicit composer configuration and test overrides before validation, inspection or
composition:

```ts
const composer = createTestComposer({
    modules: [moduleUnderTest],
    overrides: [
        override(REQUIRED_PORT).toValue(fakePort)
    ]
})

const runtime = await composer.compose()
```

`fakeModule()` creates a normal explicit module definition for tests:

```ts
const fakeAuthModule = fakeModule('test-auth', {
    provides: [
        {
            token: REQUIRED_PORT,
            useValue: fakePort
        }
    ]
})
```

`createModuleHarness()` composes one module under test with support modules, fake modules
or explicit required-port overrides:

```ts
const harness = createModuleHarness({
    module: moduleUnderTest,
    fakeModules: [fakeAuthModule]
})

const runtime = await harness.compose()
```

These helpers do not mutate existing frozen runtimes or composed runtimes. Fake modules
remain visible through existing composer/runtime inspection APIs, and module-private
providers remain hidden behind normal composed runtime capability access.

Graph assertions read public `ModuleGraph`, `ComposerInspection` or `RuntimeInspection`
data:

```ts
assertGraphHasModule(harness.getGraph(), 'contact-requests')
assertGraphHasEdge(harness.getGraph(), {
    edgeKind: 'binding',
    requiredTokenId: AUTH_READER.id,
    bindingTokenId: AUTH_READER.id
})
```

Diagnostic assertions read public `DiagnosticReport` data or diagnostics derived from
typed errors:

```ts
assertDiagnosticReportOk(harness.validate())
assertErrorDiagnostic(error, {
    code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT'
})
```

Assertion failures throw plain deterministic `Error` subclasses, so they are usable from
Vitest without a runtime dependency on Vitest internals.
