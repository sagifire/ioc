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
registered modules, required ports, declared capabilities, composition bindings and
validation status.

Composed runtimes expose `runtime.inspect()` with the same graph shape plus exported
provider registration summaries. Inspection does not expose provider values, resource
instances, scope-local values or private runtime internals.
