# Composer

Status: composer builder, static validation, module setup preparation and composed
runtime capability access implemented.

`defineModule()` is available for explicit module definitions, required port metadata and
capability metadata.

`createComposer()` is available for registering module definitions with `use()`, recording
composition-level single bindings with `bind()`, running static validation with
`validate()`, preparing module setup/private provider metadata with `prepare()` and
creating a capability-gated runtime with `compose()`.

Inspection APIs are planned for a later Stage 9 task and are not implemented yet.
