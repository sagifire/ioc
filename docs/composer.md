# Composer

Status: composer builder, static validation, module setup preparation, composed runtime
capability access and safe inspection metadata implemented.

`defineModule()` is available for explicit module definitions, required port metadata and
capability metadata.

`createComposer()` is available for registering module definitions with `use()`, recording
composition-level single bindings with `bind()`, running static validation with
`validate()`, preparing module setup/private provider metadata with `prepare()` and
creating a capability-gated runtime with `compose()`.

`composer.inspect()` and `composer.getGraph()` expose deterministic safe metadata for
registered modules, required ports, declared capabilities, composition bindings,
dependency edges and validation status.

`composer.validate()` reports module cycles over capability dependency edges with
`ModuleCycleError` diagnostics. `composer.prepare()` and `composer.compose()` reject cyclic
module graphs through `ComposerValidationError`.

Composed runtimes expose `runtime.inspect()` with the same graph shape plus exported
provider registration summaries. Inspection does not expose provider values, resource
instances, scope-local values or private runtime internals.

Dependency edges are inspection metadata only. Capability dependency edges connect a
consumer module required port to the module capability that satisfies it. Binding
dependency edges connect a consumer module required port to an explicit composition-level
binding. Binding edges do not create module-level cycle diagnostics by themselves.
