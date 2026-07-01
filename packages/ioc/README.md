# @sagifire/ioc

Core package for `@sagifire/ioc`.

Implemented in the current stage:

- typed tokens;
- token namespaces;
- token ID validation;
- sync single-provider container bindings;
- sync multi-provider container contributions;
- singleton, transient and scoped provider lifetimes;
- immutable runtime `get()` / `tryGet()` / `getAll()`;
- sync scope API: `createScope()`, `withScope()`, `Scope.get()`, `Scope.tryGet()`,
  `Scope.getAll()` and `Scope.dispose()`;
- async single-provider bindings through `toAsyncFactory()` and `toAsyncResource()`;
- explicit async resolution through `runtime.getAsync()`, `runtime.tryGetAsync()` and
  `Scope.getAsync()`;
- async resource lifecycle through `runtime.dispose()` and scoped resource disposal.
- diagnostics foundation through `SagifireIocError` and `isSagifireIocError()`;
- diagnostic reports and plain-text formatting through `Diagnostic`, `DiagnosticReport`,
  `diagnosticFromError()` and `formatDiagnostics()`.
- module definition foundation through `defineModule()` and explicit
  `ModuleDefinition` metadata.
- composer builder and static validation through `createComposer()`, `composer.use()`,
  `composer.bind()` and `composer.validate()`.
- module setup and private provider preparation through `composer.prepare()`.
- composed runtime capability access through `composer.compose()`.
- safe inspection metadata through `composer.inspect()`, `composer.getGraph()` and
  `runtime.inspect()`, including dependency edge metadata.
- module cycle diagnostics through `ModuleCycleError` and `ComposerValidationError`
  reports.
- module DSL foundation through `module()` over existing `defineModule()` semantics.
- app DSL composition through `defineApp()` over existing `createComposer()`, `use()` and
  `bind()` semantics.
- bind helper DSL and `adapt()` declarations over existing composition binding semantics.

Testing helpers live in `@sagifire/ioc-testing`, including isolated test runtimes,
explicit overrides and a test composer helper. Framework adapters remain planned for later
roadmap stages.

## Optional DSL

The DSL is an ergonomic layer, not a replacement for the object API. Applications can use
`defineModule()` and `createComposer()` directly, or use the DSL helpers and get the same
composer validation, graph inspection and runtime composition semantics.

Available DSL helpers:

- `module()` for module definitions compatible with `defineModule()`.
- `defineApp()` for declared modules and composition bindings.
- `bind(token)` for value, factory, class and async-factory binding declarations.
- `adapt(token, factory)` for explicit required-port adapters.

Example:

```ts
const app = defineApp({
    modules: [authModule, contactRequestsModule],
    bindings: [
        adapt(CONTACT_REQUESTS_AUTH_READER, (context) => {
            const auth = context.get(AUTH_PUBLIC_API)

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })
    ]
})
```

DSL declarations are converted to existing composer configuration. They do not add
decorators, `reflect-metadata`, filesystem auto-discovery, service locator behavior,
global mutable registries or hidden dependency inference.
