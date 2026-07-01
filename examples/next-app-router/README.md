# Minimal Next App Router Integration

This is a narrow Stage 13 example skeleton. It is not a standalone Next.js application and
does not add `next` or `react` dependencies to the workspace.

The example shows the adapter boundary pattern:

- `src/app-runtime.ts` owns one `createNextRuntime()` helper for the application runtime.
- `src/request-context.ts` converts explicit request/action values to scope-local values.
- `app/api/contacts/[id]/route.ts` creates one route scope through `withRouteScope()`.
- `app/contact/actions.ts` creates one server action scope through `withServerActionScope()`.
- Route and action files resolve `CONTACT_REQUESTS_PUBLIC_API` and delegate business
  behavior to the module public API.

When the cached helper wraps a composed runtime, scope-local context tokens must be part of
the explicit public capability surface. The `requestContextModule` provides `REQUEST_ID`,
and each route/action invocation overrides it with a request-local value.
