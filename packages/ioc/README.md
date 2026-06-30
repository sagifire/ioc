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

DSL, testing helpers and framework adapters are planned for later roadmap stages.
