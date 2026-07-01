# Testing

Status: Stage 12 final testing package hardening.

`@sagifire/ioc-testing` currently exposes isolated runtime helpers, explicit overrides, a
test composer helper, fake modules, a module harness helper and assertion helpers:

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

Runtime helpers create a fresh `@sagifire/ioc` container configuration per call, apply
explicit test configuration and override declarations before `freeze()` and return a
frozen `ContainerRuntime`. Overrides are explicit token-level declarations and are never
applied to an existing frozen runtime.

```ts
const runtime = await createTestRuntime({
    overrides: [
        override(LOGGER).toValue(testLogger)
    ]
})
```

Test composer helpers create a fresh `createComposer()` configuration per call, apply
modules, explicit composer configuration and overrides before `compose()`, and keep
validation and graph inspection visible through the existing composer APIs.

```ts
const composer = createTestComposer({
    modules: [moduleUnderTest],
    overrides: [
        override(REQUIRED_PORT).toFactory((context) => {
            const dependency = context.get(TEST_DEPENDENCY)

            return createFakePort(dependency)
        })
    ]
})

const runtime = await composer.compose()
```

Fake modules are normal explicit module definitions. They declare provided capabilities and
generate setup that binds fake values, factories or async factories through the existing
module setup API:

```ts
const fakeAuthModule = fakeModule('test-auth', {
    provides: [
        {
            token: AUTH_READER,
            useValue: fakeAuthReader
        }
    ]
})
```

Module harnesses compose one module under test with optional support modules, fake modules
and explicit required-port overrides:

```ts
const harness = createModuleHarness({
    module: contactRequestsModule,
    fakeModules: [fakeAuthModule]
})

const runtime = await harness.compose()
```

These helpers reuse core container/composer APIs and do not mutate existing frozen
`ContainerRuntime` or `ComposedRuntime` instances. Duplicate override declarations fail
deterministically. Fake modules remain visible through existing composer/runtime
inspection APIs and module-private providers remain hidden behind normal composed runtime
capability access. If a test needs to replace a public capability, prefer an explicit fake
module or support module; overrides are intended for required ports and test wiring before
composition.

Graph assertions read public `ModuleGraph`, `ComposerInspection` or `RuntimeInspection`
data only:

```ts
assertGraphHasModule(harness.getGraph(), 'contact-requests')
assertGraphHasRequiredPort(harness.inspect(), {
    moduleId: 'contact-requests',
    tokenId: AUTH_READER.id,
    satisfiedBy: 'binding'
})
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
assertDiagnosticReportHasDiagnostic(harness.validate(), {
    code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT'
})
assertErrorDiagnostic(error, {
    code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_ID'
})
```

Assertion failures throw deterministic plain `Error` subclasses and do not require a
runtime dependency on Vitest internals.

Boundary rules:

- `@sagifire/ioc-testing` may depend on `@sagifire/ioc`.
- `@sagifire/ioc` must not import `@sagifire/ioc-testing`.
- The testing package must not import or implement Next.js, React, route handler or server
  action adapters.
- Testing helpers must not use filesystem or fixture auto-discovery.
