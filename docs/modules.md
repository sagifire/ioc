# Modules

Status: module definition, composer static validation and module setup preparation
foundation implemented.

Modules can now be described with the explicit object-configuration `defineModule()` API.
Composer configuration can register those definitions with `createComposer().use()`,
validate declared capabilities, required ports and explicit bindings with
`composer.validate()`, and execute setup/private provider registration with
`composer.prepare()`.

Composed runtime capability access and module inspection are planned for later Stage 9
tasks and are not implemented yet.
