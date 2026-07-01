# @sagifire/ioc-next

Next.js App Router adapter package for `@sagifire/ioc`.

Stage 13 currently provides the runtime foundation helper and explicit request context
declarations:

```ts
import { token } from '@sagifire/ioc'
import { createNextRequestContext, createNextRuntime, nextRequestValue } from '@sagifire/ioc-next'

const REQUEST_ID = token<string>('app.request-id')

const appRuntime = createNextRuntime(() => app.compose())

export async function getRuntime() {
    return appRuntime.getRuntime()
}

export function createRequestContext(requestId: string) {
    return createNextRequestContext({
        values: [nextRequestValue(REQUEST_ID, requestId)]
    })
}
```

`createNextRuntime()` owns an instance-local cache, reuses successful runtime
initialization, de-duplicates concurrent initialization and retries after failed
initialization. `reset()` clears the helper cache without disposing or mutating the cached
runtime.

`createNextRequestContext()` keeps request or operation data explicit as token/value
declarations and converts them to core `CreateScopeOptions` through `toScopeOptions()`.
Use `nextRequestValue()` for single scope-local values and `nextRequestMultiValue()` for
multi scope-local values.

Route handler scope and server action scope helpers are planned for later Stage 13 tasks.
