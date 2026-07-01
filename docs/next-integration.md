# Next.js Integration

Status: Stage 13 runtime foundation and request context.

`@sagifire/ioc-next` currently provides `createNextRuntime()` for application-boundary
runtime caching and `createNextRequestContext()` for explicit request or operation scope
values:

```ts
import { token } from '@sagifire/ioc'
import {
    createNextRequestContext,
    createNextRuntime,
    nextRequestMultiValue,
    nextRequestValue
} from '@sagifire/ioc-next'

interface RequestPlugin {
    readonly name: string
}

const REQUEST_ID = token<string>('app.request-id')
const REQUEST_PLUGIN = token<RequestPlugin>('app.request-plugin')

const appRuntime = createNextRuntime(() => app.compose())

export async function getRuntime() {
    return appRuntime.getRuntime()
}

export function createRequestContext(requestId: string, plugin: RequestPlugin) {
    return createNextRequestContext({
        values: [nextRequestValue(REQUEST_ID, requestId)],
        multiValues: [nextRequestMultiValue(REQUEST_PLUGIN, plugin)]
    })
}
```

The helper owns an instance-local cache, shares in-flight initialization, retries after
failed initialization and exposes `reset()` to clear the helper cache without mutating or
disposing a frozen runtime.

Request context is explicit token/value data. Call `context.toScopeOptions()` at a
framework boundary and pass the result to existing core `runtime.createScope()` or
`runtime.withScope()`.

Route handler scope and server action scope helpers are still planned Stage 13 follow-up
work.
