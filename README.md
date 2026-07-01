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
Overrides, module harnesses, graph assertions and framework adapter behavior are planned
for later roadmap stages.

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

## License

License selection is pending.
