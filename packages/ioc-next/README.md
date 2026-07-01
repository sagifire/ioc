# @sagifire/ioc-next

Next.js App Router adapter package for `@sagifire/ioc`.

Stage 13 provides the runtime foundation helper, explicit request/operation context
declarations, a route handler scope helper, a server action scope helper and minimal App
Router snippets:

- `createNextRuntime()`
- `createNextRequestContext()`
- `nextRequestValue()`
- `nextRequestMultiValue()`
- `withRouteScope()`
- `withServerActionScope()`

When `createNextRuntime()` wraps a composed runtime, scope-local context tokens must be
part of the composed runtime public capability surface. The route/action invocation still
supplies the actual request-local value through `createNextRequestContext()`.

Assume `REQUEST_ID`, `PUBLIC_API` and `app` are exported by application modules and
composition code:

```ts
import {
    createNextRequestContext,
    createNextRuntime,
    nextRequestValue,
    withRouteScope,
    withServerActionScope
} from '@sagifire/ioc-next'

const appRuntime = createNextRuntime(() => app.compose())

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

            return publicApi.getContact(context.params.id)
        }
    )
}

export const submitContact = withServerActionScope(
    appRuntime,
    (formData: FormData) => ({
        context: {
            actionName: 'submit-contact'
        },
        actionContext: createRequestContext(String(formData.get('requestId') ?? 'unknown'))
    }),
    async ({ scope }, formData) => {
        const publicApi = scope.get(PUBLIC_API)

        return publicApi.submitContact(formData)
    }
)
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

`withServerActionScope()` returns an action function. Each invocation obtains the cached
runtime, creates one scope, passes runtime, scope and explicit action context to the
callback and disposes the scope after success or failure. The helper preserves action
argument and return type inference and does not use route request/response semantics.

`examples/next-app-router` contains a narrow App Router-shaped skeleton. It does not add
Next.js or React dependencies and keeps route/action files thin: they create adapter scopes
and call a module public API instead of holding business logic in framework handlers.
