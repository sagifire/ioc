# Next App Router Integration

This example is shaped like a Next.js App Router application boundary without installing
`next` or `react` in the workspace. It demonstrates how `@sagifire/ioc-next` fits around an
explicit module graph while keeping framework files thin.

The example covers:

- `createNextRuntime()` for an application-owned cached composed runtime;
- `createNextRequestContext()`, `nextRequestValue()` and `nextRequestMultiValue()` for
  request/action scope-local values;
- `withRouteScope()` for one route invocation scope with automatic disposal;
- `withServerActionScope()` for one server action invocation scope with automatic disposal;
- core child scopes can still be created inside those callbacks for nested preview or
  transaction overlays when needed;
- route/action files that resolve `CONTACT_REQUESTS_PUBLIC_API` and delegate business
  behavior to the module public API.

It is intentionally not a standalone Next.js app. The `RouteRequest`, `JsonResponse` and
direct Node harness are small stand-ins that let the boundary pattern be typechecked and
executed without framework dependencies.

## File Map

- `src/contact-requests.ts` defines the single `REQUEST_ID`, multi `REQUEST_TAGS`, contact
  request module and public API capability.
- `src/app-runtime.ts` builds the explicit composer and owns one `createNextRuntime()`
  helper instance.
- `src/request-context.ts` converts route/action input into explicit single and multi
  scope-local context values.
- `app/api/contacts/[id]/route.ts` mirrors an App Router route handler and uses
  `withRouteScope()`.
- `app/contact/actions.ts` mirrors a server action file and uses `withServerActionScope()`.
- `src/main.ts` simulates route and action invocations, checks runtime cache reuse, checks
  graph visibility and disposes the cached runtime.

## Commands

Typecheck the example source:

```sh
.\node_modules\.bin\tsc.cmd -p examples/next-app-router/tsconfig.json --pretty false
```

Compile it for a direct Node run:

```sh
pnpm build
.\node_modules\.bin\tsc.cmd -p examples/next-app-router/tsconfig.run.json --pretty false
node .tmp/examples/next-app-router/src/main.js
```

The run command exits successfully when the route/action flow, explicit graph checks,
request/action context values, cache reuse and disposal path all behave as expected. It
throws an error if any assertion fails.

## Real App Router Mapping

In a real Next.js app:

- `RouteRequest` maps to `Request` or `NextRequest`.
- `JsonResponse` maps to `Response.json()` or `NextResponse.json()`.
- `app/api/contacts/[id]/route.ts` remains the route boundary.
- `app/contact/actions.ts` remains the server action boundary.
- Business logic stays in `src/contact-requests.ts` behind `CONTACT_REQUESTS_PUBLIC_API`.

The adapter package does not scan routes, discover modules or expose hidden current
request/action access. Request and action data enters the graph only through explicit
token/value declarations supplied to the invocation scope.

When the cached helper wraps a composed runtime, scope-local context tokens must be part of
the explicit public capability surface. The `requestContextModule` provides `REQUEST_ID` as
a single capability and `REQUEST_TAGS` as a multi capability; route/action invocations
override or extend them with scope-local values.
