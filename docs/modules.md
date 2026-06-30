# Modules

Status: module definition, composer static validation, module setup preparation and
composed runtime capability access implemented.

Modules can now be described with the explicit object-configuration `defineModule()` API.
Composer configuration can register those definitions with `createComposer().use()`,
validate declared capabilities, required ports and explicit bindings with
`composer.validate()`, and execute setup/private provider registration with
`composer.prepare()`. `composer.compose()` creates an immutable composed runtime that
exposes declared exported capabilities while hiding private module providers and
required-port-only bindings.

Module inspection is planned for a later Stage 9 task and is not implemented yet.
