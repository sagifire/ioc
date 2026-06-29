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
  `Scope.getAll()` and `Scope.dispose()`.

Async providers/resources, composer, DSL, diagnostics and lifecycle APIs are planned for
later roadmap stages.
