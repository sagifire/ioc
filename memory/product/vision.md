# Product Vision

## Product

`@sagifire/ioc` - TypeScript-native, JavaScript-friendly бібліотека для контрольованої
модульної композиції залежностей у TypeScript-додатках.

Проект складається з трьох пов'язаних пакетів:

- `@sagifire/ioc` - runtime-agnostic core package.
- `@sagifire/ioc-next` - адаптери й helpers для Next.js App Router.
- `@sagifire/ioc-testing` - тестові утиліти, overrides, fake modules і graph assertions.

## Product Governance

- Project and publishable packages use Apache License 2.0.
- `@sagifire/ioc` is protected as the product mark for this library family.
- Primary ordinary contact/support channel is GitHub Issues.
- Security policy must avoid asking users to disclose secrets or sensitive vulnerability
  details in public issues.

Root source trace:

- `AGENTS.md` - project governance, architecture boundaries, style і workflow.
- `SPEC.md` sections 1-8 - product goal, architecture idea, package boundaries,
  runtime/build requirements і core principles.

## Audience

- TypeScript application engineers, які будують модульні backend, frontend або full-stack
  application graphs.
- Команди або solo-розробники, які хочуть explicit dependency composition без decorators,
  `reflect-metadata`, global mutable containers або framework-specific magic.
- Next.js App Router користувачі, яким потрібна ізольована runtime/request scope інтеграція
  без перенесення business logic у routes, pages або server actions.
- Maintainers бібліотеки, яким потрібні typed diagnostics, testability і контроль package
  boundaries на кожному implementation stage.

## Problem

У модульних TypeScript-додатках dependency composition часто стає неявною:

- залежності ховаються за service locator, constructor metadata або auto-discovery;
- runtime graph важко інспектувати й тестувати;
- framework-specific code протікає в core application logic;
- testing overrides мутують production runtime або обходять реальний graph;
- async initialization випадково робить normal resolution async;
- DSL приховує dependency graph замість того, щоб бути ergonomic layer над явною
  конфігурацією.

## Value

`@sagifire/ioc` має дати контрольований composition kernel:

- typed tokens як стабільна runtime identity залежностей;
- sync `get()` із явним `getAsync()` для async providers;
- immutable runtime після `freeze()` / `compose()`;
- scopes для request/operation lifecycle;
- modules, capabilities, required ports і bindings для явної композиції application graph;
- graph validation і diagnostic-friendly typed errors;
- optional DSL без втрати object-configuration API;
- окремі пакети для Next.js integration і testing support.

## Product Principles

- Explicit over magical.
- Typed tokens over string service names.
- Composition over filesystem discovery or constructor metadata.
- Runtime immutability after compose/freeze.
- Module isolation by default.
- No hidden dependency access across module boundaries.
- Async initialization is supported, but normal `get()` remains synchronous.
- DSL is optional and built over explicit object configuration.
- Diagnostics must be readable and actionable.
- Core package must stay independent from Next.js, React and Node-only APIs.
