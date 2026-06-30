# Architecture

Status: skeleton.

The detailed architecture documentation will be written after the relevant runtime layers
are implemented. The current implementation includes the core token API, Stage 4 sync
single-provider container API, Stage 5 multi-provider contributions and Stage 6 sync
scopes, plus Stage 7 async single-provider bindings, async resources and runtime/scope
disposal. Stage 8 core diagnostics include typed errors, diagnostic reports and plain-text
formatting. Stage 9 composer/modules now include explicit module definitions, composer
builder/static validation, module setup/private provider isolation, composed runtime
capability access and safe inspection metadata. Stage 10 dependency edges and module cycle
diagnostics are implemented. DSL, testing helpers and adapters remain planned for later
roadmap stages.
