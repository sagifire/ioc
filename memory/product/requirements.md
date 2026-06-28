# Product Requirements

Source trace: `SPEC.md` sections 1-54 and `AGENTS.md` architecture/workflow rules.

## Requirements

| ID | Requirement | Status |
|---|---|---|
| REQ-PROD-001 | Provide a TypeScript-native, JavaScript-friendly modular IoC and dependency composition library. | accepted |
| REQ-PKG-001 | Maintain a `pnpm` monorepo with `@sagifire/ioc`, `@sagifire/ioc-next` and `@sagifire/ioc-testing`. | accepted |
| REQ-CORE-001 | Keep `@sagifire/ioc` runtime-agnostic and free of Next.js, React, Node-only APIs, filesystem access, decorators as required API and `reflect-metadata`. | accepted |
| REQ-TOKEN-001 | Support typed tokens, token namespaces, stable token IDs and token ID validation. | accepted |
| REQ-CONTAINER-001 | Support container configuration/runtime phases, provider registration, singleton/transient/scoped lifetimes, multi-providers, cycle detection and immutable frozen runtime. | accepted |
| REQ-RESOLUTION-001 | Keep `runtime.get()` synchronous and provide explicit async resolution through `getAsync()` / `tryGetAsync()`. | accepted |
| REQ-ASYNC-001 | Support async eager providers, async lazy providers, async resources, retry behavior for failed lazy initialization and typed async access errors. | accepted |
| REQ-SCOPE-001 | Support request/operation scopes, scoped values, scoped lifetime, `withScope()` and idempotent scope disposal. | accepted |
| REQ-COMPOSER-001 | Support modules, capabilities, required ports, bindings, module graph validation, runtime inspection and module isolation. | accepted |
| REQ-DSL-001 | Provide optional DSL configurators over explicit object-configuration API without hiding the dependency graph. | accepted |
| REQ-DIAG-001 | Provide typed errors, diagnostic reports, readable formatting and graph-aware validation details. | accepted |
| REQ-TESTING-001 | Provide `@sagifire/ioc-testing` helpers for isolated test runtimes, overrides, fake modules, module harnesses and graph assertions without mutating frozen production runtime. | accepted |
| REQ-NEXT-001 | Provide `@sagifire/ioc-next` helpers for cached runtime creation, request context, route handler scope, server action scope and App Router examples without affecting core API. | accepted |
| REQ-PACKAGING-001 | Ship ESM-first packages with generated JavaScript, `.d.ts`, source maps where reasonable, subpath exports and `sideEffects: false`. | accepted |
| REQ-TREESHAKE-001 | Keep package exports tree-shaking friendly and verify that core subpath imports do not pull unrelated layers or Next.js adapters. | accepted |
| REQ-DOCS-001 | Document architecture, container, async model, composer, modules, Next.js integration, testing, diagnostics and migration from typical DI containers. | accepted |
| REQ-QUALITY-001 | Implement by stages with acceptance criteria, tests, verification commands and no stage skipping. | accepted |
| REQ-RELEASE-001 | Add release automation with versioning, changelog generation, CI, npm publish dry-run and provenance support if chosen. | planned |

## Requirement Status Rule

`accepted` means the requirement is canonical for this project. It does not mean it has been
implemented in code. Implementation status is tracked through roadmap stages and tasks.
