# @sagifire/ioc-testing

Testing helpers for `@sagifire/ioc`.

Current public API:

- `createTestRuntime(configure?)`
- `createTestRuntime({ configure })`

`createTestRuntime()` creates a fresh core container configuration, applies the explicit
test configuration callback if provided and returns a frozen `ContainerRuntime`.

Example:

```ts
import { token } from '@sagifire/ioc'
import { createTestRuntime } from '@sagifire/ioc-testing'

const LOGGER = token<{ readonly name: string }>('test.logger')

const runtime = await createTestRuntime((container) => {
    container.bind(LOGGER).toValue({
        name: 'test'
    })
})

runtime.get(LOGGER)
await runtime.dispose()
```

The helper does not mutate existing frozen runtimes. Overrides, test composers, fake
modules, module harnesses and graph/diagnostic assertions are planned for later Stage 12
tasks.
