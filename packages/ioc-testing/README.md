# @sagifire/ioc-testing

Testing helpers for `@sagifire/ioc`.

This package creates fresh test-only container/composer configuration before
`freeze()` or `compose()`. It never patches an existing frozen `ContainerRuntime` or
`ComposedRuntime`.

The package is currently used from the workspace. The manifest is `0.0.0` and
`Apache-2.0` with npm publish metadata, Changesets versioning, package dry-run validation
and a manual npm publish workflow.

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

The package exposes a root export only and depends on `@sagifire/ioc`.

## Public Surface

- Runtime helpers: `createTestRuntime(configure?)` and
  `createTestRuntime({ configure, overrides })`.
- Override declarations: `override(token).toValue()`, `toFactory()`, `toClass()` and
  `toAsyncFactory()`.
- Composer helpers: `createTestComposer(configure?)` and
  `createTestComposer({ modules, configure, overrides })`.
- Fake modules: `fakeModule(definition)` and `fakeModule(id, definition)`.
- Module harnesses: `createModuleHarness({ module, supportModules, fakeModules, overrides })`.
- Graph assertions: `assertGraphHasModule()`, `assertGraphHasCapability()`,
  `assertGraphHasRequiredPort()`, `assertGraphHasBinding()` and `assertGraphHasEdge()`.
- Diagnostic assertions: `assertDiagnosticReportOk()`,
  `assertDiagnosticReportHasDiagnostic()` and `assertErrorDiagnostic()`.
- Error classes: `DuplicateTestOverrideError`, `GraphAssertionError` and
  `DiagnosticAssertionError`.

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

Graph assertions read `ModuleGraph`, `ComposerInspection` or `RuntimeInspection` data:

```ts
assertGraphHasModule(harness.getGraph(), 'contact-requests')
assertGraphHasEdge(harness.inspect(), {
    edgeKind: 'binding',
    requiredTokenId: CONTACT_AUTH_READER.id,
    bindingTokenId: CONTACT_AUTH_READER.id
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

## More Documentation

- [Testing guide](../../docs/testing.md)
- [Testing overrides example](../../examples/testing-overrides/README.md)
- [Diagnostics](../../docs/diagnostics.md)
- [Composer](../../docs/composer.md)
