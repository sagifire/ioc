# Next.js Integration

Status: Stage 13 runtime foundation, request context, route handler scope and server
action scope.

`@sagifire/ioc-next` currently provides `createNextRuntime()` for application-boundary
runtime caching, `createNextRequestContext()` for explicit request or operation scope
values, `withRouteScope()` for route handler invocation scopes and
`withServerActionScope()` for server action invocation scopes:

```ts
import { token } from '@sagifire/ioc'
import {
    createNextRequestContext,
    createNextRuntime,
    nextRequestMultiValue,
    nextRequestValue,
    withRouteScope,
    withServerActionScope
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

export function GET(request: Request, context: { params: { id: string } }) {
    return withRouteScope(
        appRuntime,
        {
            request,
            context,
            requestContext: createRequestContext(context.params.id, {
                name: 'route'
            })
        },
        async ({ scope }) => {
            const publicApi = scope.get(PUBLIC_API)

            return publicApi.handleRequest()
        }
    )
}

export const submitContact = withServerActionScope(
    appRuntime,
    (formData: FormData) => ({
        context: {
            actionName: 'submit-contact'
        },
        actionContext: createRequestContext(String(formData.get('requestId') ?? 'unknown'), {
            name: 'action'
        })
    }),
    async ({ scope }, formData) => {
        const publicApi = scope.get(PUBLIC_API)

        return publicApi.submitContact(formData)
    }
)
```

The helper owns an instance-local cache, shares in-flight initialization, retries after
failed initialization and exposes `reset()` to clear the helper cache without mutating or
disposing a frozen runtime.

Request context is explicit token/value data. Call `context.toScopeOptions()` at a
framework boundary, pass it to `withRouteScope()` as `requestContext` or pass it to
`withServerActionScope()` as `actionContext`.

`withRouteScope()` gets the runtime through the cached helper, creates exactly one scope
for the route invocation, passes runtime, scope, request and route context explicitly to
the callback and disposes the scope on success or failure.

`withServerActionScope()` returns an action function. Each invocation gets the runtime
through the cached helper, creates exactly one scope, passes runtime, scope and explicit
action context to the callback and disposes the scope on success or failure. The helper is
independent from route request/response semantics and preserves action argument and return
type inference.
