# Next.js Integration

`@sagifire/ioc-next` contains framework-boundary helpers for Next.js App Router shaped
code. The package keeps the core runtime framework-agnostic: `@sagifire/ioc` does not
import Next.js or React, and the adapter package does not add route scanning, filesystem
discovery or hidden current-request/current-action APIs.

Use the helpers at the edge of the application:

- create or reuse the application runtime through `createNextRuntime()`;
- convert request/action values to explicit scope-local context with
  `createNextRequestContext()`;
- create one scope per route invocation with `withRouteScope()`;
- create one scope per server action invocation with `withServerActionScope()`;
- resolve a module public API from that scope and delegate business behavior to it.

Route handlers and server actions should stay thin. They should translate framework input
into explicit context, call module public APIs and return framework responses. Domain and
application behavior belongs behind those module public APIs.

## Imports

```ts
import {
    createNextRequestContext,
    createNextRuntime,
    nextRequestMultiValue,
    nextRequestValue,
    withRouteScope,
    withServerActionScope
} from '@sagifire/ioc-next'
```

The current adapter source does not import Next.js or React types. The examples below are
App Router shaped, but this repository does not require a full Next.js dependency install
to use or verify the helper APIs.

## Cached Runtime

`createNextRuntime(factory)` creates an instance-local runtime helper:

```ts
const appRuntime = createNextRuntime(() => app.compose())

const runtime = await appRuntime.getRuntime()
```

The helper:

- calls the factory on first `getRuntime()`;
- caches a successful runtime for later calls on the same helper instance;
- shares an in-flight initialization promise between concurrent callers;
- does not cache a failed initialization, so a later call can retry;
- exposes `reset()` to clear this helper's cache.

`reset()` does not mutate or dispose the previously returned frozen runtime. Runtime
ownership is still explicit: if a test or application creates a runtime that needs
disposal, dispose that runtime through the core `runtime.dispose()` API.

The cache belongs to the helper instance, not to the core package. Creating two helpers
means two independent caches.

## Request And Action Context

Request/action context is explicit token/value data. The adapter does not expose a hidden
current request, current action, current scope or AsyncLocalStorage service locator.

```ts
import { token } from '@sagifire/ioc'
import {
    createNextRequestContext,
    nextRequestMultiValue,
    nextRequestValue
} from '@sagifire/ioc-next'

const REQUEST_ID = token<string>('app.request-id')
const REQUEST_TAGS = token<string>('app.request-tags')

const requestContext = createNextRequestContext({
    values: [nextRequestValue(REQUEST_ID, 'request-1')],
    multiValues: [nextRequestMultiValue(REQUEST_TAGS, 'app-router')]
})

const scopeOptions = requestContext.toScopeOptions()
```

`createNextRequestContext()` stores immutable declarations and converts them to the core
`CreateScopeOptions` shape. Duplicate local values and single/multi conflicts are
validated by the core scope rules when the scope is created.

When the cached helper wraps a `ComposedRuntime`, every scope-local token that route/action
code resolves through `scope.get()` must be visible through the composed runtime public
capability surface. A small context module can declare the token and bind a fallback
provider; each route/action invocation then overrides it with scope-local values.

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
            throw new Error('REQUEST_ID must be supplied by a route or action scope')
        })
    }
})
```

The fallback protects direct runtime usage without a request/action scope while keeping the
token explicit in graph inspection.

## Route Handler Scope

`withRouteScope(runtimeHelper, options, callback)` awaits the cached runtime, creates one
scope for that route invocation, passes runtime/scope/request/context data explicitly to
the callback and disposes the scope in a `finally` path on success or failure.

```ts
export function GET(request: Request, context: { params: { id: string } }) {
    return withRouteScope(
        appRuntime,
        {
            request,
            context,
            requestContext: createNextRequestContext({
                values: [nextRequestValue(REQUEST_ID, context.params.id)]
            })
        },
        async ({ scope }) => {
            const contactRequests = scope.get(CONTACT_REQUESTS_PUBLIC_API)

            return contactRequests.getContact(context.params.id)
        }
    )
}
```

The callback receives:

- `runtime` - the cached `ContainerRuntime` or `ComposedRuntime`;
- `scope` - the per-invocation core scope;
- `request` - the request value passed in options;
- `context` - the route context passed in options;
- `requestContext` - the optional explicit request context.

The route helper does not decide how to build a `Response`; it only owns runtime lookup,
scope creation, callback execution and scope disposal.

## Server Action Scope

`withServerActionScope(runtimeHelper, setup, callback)` returns an action function. Each
action invocation resolves setup, gets the cached runtime, creates one scope, passes
runtime/scope/context data explicitly to the callback and disposes the scope in a `finally`
path on success or failure.

```ts
export const submitContact = withServerActionScope(
    appRuntime,
    (formData: FormData) => ({
        context: {
            actionName: 'submit-contact'
        },
        actionContext: createNextRequestContext({
            values: [nextRequestValue(REQUEST_ID, String(formData.get('requestId') ?? 'unknown'))]
        })
    }),
    async ({ scope }, formData) => {
        const contactRequests = scope.get(CONTACT_REQUESTS_PUBLIC_API)

        return contactRequests.submitContact(formData)
    }
)
```

The setup argument may be a static object or a factory that receives the action arguments.
The helper preserves action argument and return type inference. It is independent from
route request/response semantics and does not expose hidden current-action or current-scope
APIs.

The callback receives:

- `runtime` - the cached runtime;
- `scope` - the per-invocation core scope;
- `context` - the explicit action context returned from setup;
- `actionContext` - the optional explicit token/value context.

## Thin Framework Boundary

A typical App Router boundary should look like this:

1. Read route params, request headers, cookies or form data.
2. Build a `NextRequestContext` with token/value declarations that the module graph knows
   how to resolve.
3. Enter `withRouteScope()` or `withServerActionScope()`.
4. Resolve one module public API from `scope`.
5. Call that public API and translate its result to the framework response shape.

Keep validation, persistence, authorization, business decisions and orchestration behind
module public APIs. This keeps route/action files small, keeps the dependency graph
inspectable and lets tests exercise the module API without a full Next.js runtime.

## Disposal And Immutability

The adapter helpers do not mutate frozen `ContainerRuntime` or `ComposedRuntime`
instances. Request/action data is modeled as scope-local values, and scopes are created
from the existing runtime per invocation.

`withRouteScope()` and `withServerActionScope()` dispose the invocation scope on both
successful completion and thrown errors. Scoped resources initialized during the callback
are disposed by the core scope disposal path.

The helpers do not dispose the cached application runtime automatically. Runtime disposal
is an application or test ownership decision.

## Example

See `examples/next-app-router` for the repository App Router boundary example. It
intentionally avoids adding Next.js or React dependencies to the workspace and focuses on
the adapter boundary pattern:

- `src/app-runtime.ts` owns the `createNextRuntime()` helper and explicit composer setup;
- `src/request-context.ts` creates single and multi request/action context values;
- route files use `withRouteScope()`;
- server action files use `withServerActionScope()`;
- route/action callbacks resolve `CONTACT_REQUESTS_PUBLIC_API` and delegate behavior;
- `src/main.ts` typechecks and runs the simulated route/action flow without framework
  dependencies.
