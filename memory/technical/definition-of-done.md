# Definition Of Done

Source trace: `SPEC.md` sections 51-53.

## Project-Level Definition Of Done

The project is complete when `@sagifire/ioc` implements:

- typed tokens;
- namespaces;
- container;
- sync providers;
- async eager providers;
- async lazy providers;
- resources and disposal;
- singleton/transient/scoped lifetimes;
- scopes;
- multi-provider;
- composer;
- modules;
- capabilities;
- required ports;
- bindings;
- graph validation;
- diagnostics;
- runtime inspection;
- DSL.

The project is complete when `@sagifire/ioc-next` implements:

- Next.js runtime helper;
- request context helper;
- route scope helper;
- server action scope helper;
- App Router examples.

The project is complete when `@sagifire/ioc-testing` implements:

- test runtime;
- test composer;
- overrides;
- module harness;
- graph assertions.

The repository must provide:

- `pnpm` monorepo;
- build scripts;
- tests;
- type tests;
- CI;
- package exports;
- documentation;
- examples;
- Apache 2.0 licensing;
- repository governance docs;
- security and contribution policy;
- product mark guidance;
- release workflow.

## Architectural Definition Of Done

The architecture is valid when:

- core package is independent from Next.js;
- runtime is immutable after compose/freeze;
- `get()` is always synchronous;
- async initialization is supported safely;
- modules cannot access internals of other modules;
- required ports are owned by consumer modules;
- public APIs/capabilities are exported explicitly;
- bindings connect required ports to providers/adapters;
- dependency graph can be inspected and validated;
- diagnostics explain problems clearly;
- DSL remains optional;
- testing overrides do not mutate production runtime.

## Safety Definition Of Done

The implementation is safe when:

- every stage has tests;
- every stage has clear acceptance criteria;
- public API changes are intentional;
- errors are typed and documented;
- resources are disposed correctly;
- no global runtime state exists in core;
- no package boundary is violated;
- no hidden framework-specific dependency leaks into core.
- release workflows do not commit secrets or publish without explicit human approval.
