# Next.js Integration

Status: Stage 13 runtime foundation, request context, route handler scope, server action
scope and minimal App Router snippets.

`@sagifire/ioc-next` provides framework-boundary helpers only. Business behavior should
stay behind module public APIs:

- `createNextRuntime()` owns an instance-local cached runtime helper.
- `createNextRequestContext()` stores explicit request/action token values.
- `nextRequestValue()` and `nextRequestMultiValue()` create scope-local declarations.
- `withRouteScope()` creates and disposes one route scope per invocation.
- `withServerActionScope()` creates and disposes one action scope per invocation.

The helper owns an instance-local cache, shares in-flight initialization, retries after
failed initialization and exposes `reset()` to clear the helper cache without mutating or
disposing a frozen runtime.

Request context is explicit token/value data. Call `context.toScopeOptions()` directly for
core runtime usage, pass it to `withRouteScope()` as `requestContext` or pass it to
`withServerActionScope()` as `actionContext`.

When the helper wraps a `ComposedRuntime`, every scope-local context token must be visible
through the composed runtime public capability surface. A small context module can declare
that token and provide a fallback provider; each route/action invocation then overrides it
through scope-local values.

```ts
import { defineModule, token } from '@sagifire/ioc'

export const REQUEST_ID = token<string>('app.request-id')

export const requestContextModule = defineModule({
    id: 'request-context',
    provides: [
        {
            token: REQUEST_ID,
            kind: 'shared-service'
        }
    ],
    setup(context) {
        context.bind(REQUEST_ID).toFactory(() => {
            throw new Error('REQUEST_ID must be supplied by the route or action scope')
        })
    }
})
```

Minimal App Router-shaped integration:

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

`withRouteScope()` gets the runtime through the cached helper, creates exactly one scope
for the route invocation, passes runtime, scope, request and route context explicitly to
the callback and disposes the scope on success or failure.

`withServerActionScope()` returns an action function. Each invocation gets the runtime
through the cached helper, creates exactly one scope, passes runtime, scope and explicit
action context to the callback and disposes the scope on success or failure. The helper is
independent from route request/response semantics and preserves action argument and return
type inference.

See `examples/next-app-router` for a narrow Stage 13 skeleton. It intentionally avoids a
full Next.js dependency install and keeps route/action files limited to framework-boundary
scope creation plus calls into `CONTACT_REQUESTS_PUBLIC_API`.
