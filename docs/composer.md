# Composer

Status: composer builder, static validation and module setup preparation foundation
implemented.

`defineModule()` is available for explicit module definitions, required port metadata and
capability metadata.

`createComposer()` is available for registering module definitions with `use()`, recording
composition-level single bindings with `bind()`, running static validation with
`validate()` and preparing module setup/private provider metadata with `prepare()`.

`compose()`, composed runtime capability access and inspection are planned for later Stage
9 tasks and are not implemented yet.
