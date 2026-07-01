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

`createTestRuntime()` creates a fresh core container configuration, applies the explicit
test configuration callback and override declarations if provided, then returns a frozen
`ContainerRuntime`.

Example:

```ts
import { token } from '@sagifire/ioc'
import { createTestComposer, createTestRuntime, override } from '@sagifire/ioc-testing'

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
providers remain hidden behind normal composed runtime capability access. Graph/diagnostic
assertions are planned for later Stage 12 tasks.
