# @sagifire/ioc

Staged implementation of the planned `@sagifire/ioc` package family.

This repository currently provides workspace structure, package manifests, TypeScript
configuration, build/test/lint/format tooling, documentation skeletons and the Stage 3 core
token API plus the Stage 4/5/6 sync container API for single-provider registrations,
multi-provider contributions and scopes. Stage 7 async single-provider bindings, explicit
`getAsync()` resolution, async resources and runtime/scope disposal are implemented. Stage
8 core diagnostics now include typed errors, diagnostic reports and plain-text formatting.
Stage 9 composer/modules are implemented with `defineModule()`, `createComposer()`,
`use()`, `bind()`, `validate()`, `prepare()`, `compose()` and safe inspection through
`composer.inspect()`, `composer.getGraph()` and `runtime.inspect()`. Stage 10 dependency
edges, binding edges and module cycle diagnostics are implemented. Stage 11 DSL now
includes `module()`, `defineApp()`, bind helper declarations and `adapt()` over existing
module/composer semantics, with final export and inspection-parity hardening. Testing
package foundation now includes `createTestRuntime()` for isolated core container runtimes.
Stage 12 testing helpers now also include explicit `override(token)` declarations and
`createTestComposer()` for fresh composer configuration with test-only required-port
bindings, plus explicit `fakeModule()` definitions and `createModuleHarness()` for
isolated single-module tests. Stage 12 graph and diagnostic assertion helpers are
implemented over public inspection/diagnostic data. Stage 13 Next adapter foundation now
includes `createNextRuntime()` for instance-local cached runtime creation and
`createNextRequestContext()` for explicit request/operation-scoped values,
`withRouteScope()` for route handler invocation scopes and `withServerActionScope()` for
server action invocation scopes.

## Packages

- `@sagifire/ioc`
- `@sagifire/ioc-next`
- `@sagifire/ioc-testing`

## Current Commands

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm format
```

## Documentation

The files in `docs/` are minimal stage-tracking documentation. They intentionally do not
describe unimplemented testing-helper or adapter APIs before those layers are implemented.

The current DSL documentation is intentionally minimal: it documents `module()`,
`defineApp()`, bind helper declarations and `adapt()` as optional helpers over the object
API, while keeping `defineModule()` and `createComposer()` first-class.

Testing documentation covers isolated runtimes, overrides, test composers, fake modules,
module harnesses and graph/diagnostic assertions. Overrides are applied before
`freeze()` / `compose()` and never mutate frozen runtimes.

Next integration documentation currently covers `createNextRuntime()` runtime caching,
`createNextRequestContext()` request/operation-scoped value declarations,
`withRouteScope()` route handler scopes and `withServerActionScope()` server action
scopes. A narrow `examples/next-app-router` skeleton demonstrates App Router-shaped route
and action boundaries without adding a full Next.js example suite.

## License

License selection is pending.
