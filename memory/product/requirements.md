# Продуктові вимоги

Source trace: `SPEC.md` sections 1-54 і `AGENTS.md` architecture/workflow rules.

## Вимоги

| ID | Вимога | Статус |
|---|---|---|
| REQ-PROD-001 | Надати TypeScript-native, JavaScript-friendly бібліотеку для модульної IoC та dependency composition. | accepted |
| REQ-PKG-001 | Підтримувати `pnpm` monorepo з `@sagifire/ioc`, `@sagifire/ioc-next` і `@sagifire/ioc-testing`. | accepted |
| REQ-CORE-001 | Тримати `@sagifire/ioc` runtime-agnostic і без Next.js, React, Node-only APIs, filesystem access, decorators as required API та `reflect-metadata`. | accepted |
| REQ-TOKEN-001 | Підтримувати typed tokens, token namespaces, stable token IDs і token ID validation. | accepted |
| REQ-CONTAINER-001 | Підтримувати container configuration/runtime phases, provider registration, singleton/transient/scoped lifetimes, multi-providers, cycle detection і immutable frozen runtime. | accepted |
| REQ-RESOLUTION-001 | Зберігати `runtime.get()` синхронним і надавати explicit async resolution через `getAsync()` / `tryGetAsync()`. | accepted |
| REQ-ASYNC-001 | Підтримувати async eager providers, async lazy providers, async resources, retry behavior для failed lazy initialization і typed async access errors. | accepted |
| REQ-SCOPE-001 | Підтримувати request/operation scopes, scoped values, scoped lifetime, `withScope()` і idempotent scope disposal. | accepted |
| REQ-COMPOSER-001 | Підтримувати modules, capabilities, required ports, bindings, module graph validation, runtime inspection і module isolation. | accepted |
| REQ-DSL-001 | Надати optional DSL configurators поверх explicit object-configuration API без приховування dependency graph. | accepted |
| REQ-DIAG-001 | Надати typed errors, diagnostic reports, readable formatting і graph-aware validation details. | accepted |
| REQ-TESTING-001 | Надати `@sagifire/ioc-testing` helpers для isolated test runtimes, overrides, fake modules, module harnesses і graph assertions без мутації frozen production runtime. | accepted |
| REQ-NEXT-001 | Надати `@sagifire/ioc-next` helpers для cached runtime creation, request context, route handler scope, server action scope і App Router examples без впливу на core API. | accepted |
| REQ-PACKAGING-001 | Постачати ESM-first packages з generated JavaScript, `.d.ts`, source maps where reasonable, subpath exports і `sideEffects: false`. | accepted |
| REQ-TREESHAKE-001 | Тримати package exports tree-shaking friendly і перевіряти, що core subpath imports не тягнуть unrelated layers або Next.js adapters. | accepted |
| REQ-DOCS-001 | Документувати architecture, container, async model, composer, modules, Next.js integration, testing, diagnostics і migration from typical DI containers. | accepted |
| REQ-QUALITY-001 | Реалізовувати поетапно з acceptance criteria, tests, verification commands і без stage skipping. | accepted |
| REQ-GOV-001 | Використовувати Apache License 2.0 для repository і publishable packages. | accepted |
| REQ-GOV-002 | Захищати `@sagifire/ioc` як product mark через repository trademark guidance. | accepted |
| REQ-GOV-003 | Надати repository governance artifacts: `LICENSE`, `NOTICE`, `CONTRIBUTING.md`, `SECURITY.md` і `TRADEMARKS.md`. | accepted |
| REQ-SUPPORT-001 | Використовувати GitHub Issues як primary ordinary project contact/support channel. | accepted |
| REQ-RELEASE-001 | Додати release automation з versioning, changelog generation, CI, npm package dry-run validation, npm publish workflow і provenance support where practical. | accepted |
| REQ-STABILIZATION-001 | Перед фіксацією version `0.0.1` провести codebase audit, який покриває errors, deviations from stated functionality, expected behavior і risks, а audit report має бути повністю українською. | accepted |
| REQ-STABILIZATION-002 | Закрити кожну critical finding зі Stage 16 audit перед фіксацією publishable package versions at `0.0.1`. | accepted |
| REQ-RELEASE-002 | Фіксувати publishable package versions і changelogs at `0.0.1` тільки після audit and critical-fix closure, зберігаючи existing no-unapproved-publish rule. | accepted |
| REQ-FEATURE-AUDIT-001 | Перед прийняттям `0.0.2` feature proposals як implementation scope провести аудит щодо project goals, philosophy, architecture, implementation risks і conflicts with existing functionality. | accepted |
| REQ-FEATURE-AUDIT-002 | Вважати attached `0.0.2` feature request proposals implementation candidates, доки Stage 17 audit review не затвердить concrete follow-up tasks. | accepted |
| REQ-FEATURE-PORTFOLIO-001 | Перед реалізацією `0.0.3` провести formal research async multi-providers, lifetime dependency validation і graph export, відділяючи marketing input від canonical specification. | accepted |
| REQ-GRAPH-EXPORT-001 | Розвивати graph export як versioned deterministic safe projection normalized inspection graph; JSON є canonical representation, DOT/Mermaid — похідні text renderers без Node-only залежностей у core. | accepted |
| REQ-LIFETIME-VALIDATION-001 | Lifetime dependency validation реалізується phased на explicit provider metadata `instance | deferred`, derived managed-resource ownership, explicit handle/target для deferred edges і concrete expansion multi registrations, єдиній normalized provider-edge foundation, proven-capture severity, explicit coverage і private-safe identity; implementation потребує окремих human-approved tasks. | design-approved |
| REQ-ASYNC-MULTI-001 | Async multi-providers допускаються до реалізації лише після design ordering, concurrency, failure/retry, eager/lazy, scope/resource ownership і disposal semantics; `getAll()` лишається synchronous. | design-first |

## Правило статусу вимог

`accepted` означає, що вимога є канонічною для цього проекту. Це не означає, що вона вже
реалізована в коді. Implementation status відстежується через roadmap stages і tasks.

`design-first` означає, що product fit підтверджено, але implementation scope не прийнято
до окремого human-reviewed design decision.
