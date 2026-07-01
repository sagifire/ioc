# @sagifire/ioc-next

Next.js App Router adapter package for `@sagifire/ioc`.

Stage 13 currently provides the runtime foundation helper, explicit request context
declarations and a route handler scope helper:

```ts
import { token } from '@sagifire/ioc'
import {
    createNextRequestContext,
    createNextRuntime,
    nextRequestValue,
    withRouteScope
} from '@sagifire/ioc-next'

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

export function GET(request: Request, context: { params: { id: string } }) {
    return withRouteScope(
        appRuntime,
        {
            request,
            context,
            requestContext: createRequestContext(context.params.id)
        },
        async ({ scope }) => {
            const publicApi = scope.get(PUBLIC_API)

            return publicApi.handleRequest()
        }
    )
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

`withRouteScope()` obtains the cached runtime, creates one scope for a route invocation,
passes runtime, scope, request and route context explicitly to the callback and disposes
the scope after success or failure.

Server action scope helper is planned for a later Stage 13 task.
