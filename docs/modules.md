# Modules

Status: module definition, composer static validation, module setup preparation, composed
runtime capability access and safe inspection metadata implemented.

Modules can now be described with the explicit object-configuration `defineModule()` API.
Composer configuration can register those definitions with `createComposer().use()`,
validate declared capabilities, required ports and explicit bindings with
`composer.validate()`, and execute setup/private provider registration with
`composer.prepare()`. `composer.compose()` creates an immutable composed runtime that
exposes declared exported capabilities while hiding private module providers and
required-port-only bindings.

Module graph inspection is available through `composer.inspect()`, `composer.getGraph()`
and `runtime.inspect()`. It includes module IDs, versions, safe metadata summaries,
required port metadata, capability metadata, composition binding metadata, validation
status, dependency edge metadata and exported provider registration summaries.

Stage 10 dependency edge metadata is implemented for capability-satisfied and
binding-satisfied required ports. Module cycle detection is implemented over capability
dependency edges, and cycle diagnostics include module and token paths without exposing
provider values or private runtime internals.
