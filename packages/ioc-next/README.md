# @sagifire/ioc-next

Next.js App Router boundary helpers for `@sagifire/ioc`.

This package keeps framework integration outside the core package. It owns cached runtime
creation, explicit request/action context values, route handler scopes and server action
scopes. It does not add route scanning, filesystem discovery, hidden current-request APIs
or business logic inside framework handlers.

The package is currently used from the workspace. The manifest is `0.0.1` and
`Apache-2.0` with npm publish metadata, Changesets versioning, package dry-run validation
and a manual npm publish workflow. It has not been published to npm from this repository
yet.

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

The package currently exposes a root export only and depends on `@sagifire/ioc`. Its source
does not import Next.js or React types.

## Public Surface

- `createNextRuntime(factory)` - creates an instance-local cached runtime helper.
- `runtimeHelper.getRuntime()` - returns the cached runtime, deduplicating in-flight
  initialization.
- `runtimeHelper.reset()` - clears that helper cache without mutating or disposing the
  cached runtime.
- `createNextRequestContext(options)` - stores explicit token/value declarations and
  converts them to core `CreateScopeOptions`.
- `nextRequestValue(token, value)` - single scope-local value declaration.
- `nextRequestMultiValue(token, value)` - multi scope-local value declaration.
- `withRouteScope(runtimeHelper, options, callback)` - creates one scope for a route
  invocation and disposes it on success or failure.
- `withServerActionScope(runtimeHelper, setup, callback)` - returns an action function
  that creates one scope per invocation and disposes it on success or failure.

## Cached Runtime

```ts
import { createNextRuntime } from '@sagifire/ioc-next'

const appRuntime = createNextRuntime(() => app.compose())

const runtime = await appRuntime.getRuntime()
```

The helper owns only its own cache instance. It is not a core global container or service
locator. Failed initialization remains retryable.

## Request Context

Request and action data is explicit scope-local data:

```ts
const requestContext = createNextRequestContext({
    values: [nextRequestValue(REQUEST_ID, 'request-1')],
    multiValues: [nextRequestMultiValue(TAGS, 'app-router')]
})
```

When the helper wraps a composed runtime, every scope-local context token must be visible
through that composed runtime's public capability surface. A small context module can
declare the token as a public/shared capability and let each route/action invocation
override it through scope-local values.

## Route Handler Scope

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
            const api = scope.get(CONTACT_REQUESTS_API)

            return api.getContact(context.params.id)
        }
    )
}
```

The callback receives runtime, scope, request, route context and optional request context
explicitly. The helper disposes the scope in a `finally` path.

## Server Action Scope

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
        const api = scope.get(CONTACT_REQUESTS_API)

        return api.submitContact(formData)
    }
)
```

The helper preserves action argument and return type inference. It does not use route
request/response semantics and does not expose hidden current action or current scope APIs.

## Boundaries

- Business logic should live behind module public APIs.
- Route/action files should create adapter scopes and call those public APIs.
- The helper does not mutate frozen `ContainerRuntime` or `ComposedRuntime` instances.
- The helper does not import or configure Next.js, React or a full application runtime.

## Governance

- [License](LICENSE) - Apache License, Version 2.0.
- [Notices](NOTICE) - package notices and attribution.
- [Contributing](../../CONTRIBUTING.md) - contribution flow and GitHub Issues support
  channel.
- [Security](../../SECURITY.md) - security-sensitive reporting policy.
- [Trademarks](../../TRADEMARKS.md) - `@sagifire/ioc` product mark usage guidance.
- [Changelog](CHANGELOG.md) - package release history.
- [Release workflow](../../docs/release.md) - release PRs, validation, manual publish and
  provenance notes.

## More Documentation

- [Next.js integration guide](../../docs/next-integration.md)
- [Architecture](../../docs/architecture.md)
- [Next App Router example](../../examples/next-app-router/README.md)
