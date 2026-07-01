# @sagifire/ioc-testing

Testing helpers for `@sagifire/ioc`.

Current public API:

- `createTestRuntime(configure?)`
- `createTestRuntime({ configure, overrides })`
- `override(token)`
- `createTestComposer(configure?)`
- `createTestComposer({ modules, configure, overrides })`

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

These helpers do not mutate existing frozen runtimes or composed runtimes. Fake modules,
module harnesses and graph/diagnostic assertions are planned for later Stage 12 tasks.
