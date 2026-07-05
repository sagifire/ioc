# Продуктове бачення

## Продукт

`@sagifire/ioc` - TypeScript-native, JavaScript-friendly бібліотека для контрольованої
модульної композиції залежностей у TypeScript-додатках.

Проект складається з трьох пов'язаних пакетів:

- `@sagifire/ioc` - runtime-agnostic core package.
- `@sagifire/ioc-next` - адаптери й helpers для Next.js App Router.
- `@sagifire/ioc-testing` - тестові утиліти, overrides, fake modules і graph assertions.

## Product Governance

- Проект і publishable packages використовують Apache License 2.0.
- `@sagifire/ioc` захищається як product mark цієї сім'ї бібліотек.
- Основний звичайний канал contact/support - GitHub Issues.
- Security policy не повинна просити користувачів розкривати secrets або sensitive
  vulnerability details у public issues.

Trace до root sources:

- `AGENTS.md` - project governance, architecture boundaries, style і workflow.
- `SPEC.md` sections 1-8 - product goal, architecture idea, package boundaries,
  runtime/build requirements і core principles.

## Аудиторія

- TypeScript application engineers, які будують модульні backend, frontend або full-stack
  application graphs.
- Команди або solo-розробники, які хочуть explicit dependency composition без decorators,
  `reflect-metadata`, global mutable containers або framework-specific magic.
- Next.js App Router користувачі, яким потрібна ізольована runtime/request scope інтеграція
  без перенесення business logic у routes, pages або server actions.
- Maintainers бібліотеки, яким потрібні typed diagnostics, testability і контроль package
  boundaries на кожному implementation stage.

## Проблема

У модульних TypeScript-додатках dependency composition часто стає неявною:

- залежності ховаються за service locator, constructor metadata або auto-discovery;
- runtime graph важко інспектувати й тестувати;
- framework-specific code протікає в core application logic;
- testing overrides мутують production runtime або обходять реальний graph;
- async initialization випадково робить normal resolution async;
- DSL приховує dependency graph замість того, щоб бути ergonomic layer над явною
  конфігурацією.

## Цінність

`@sagifire/ioc` має дати контрольований composition kernel:

- typed tokens як стабільна runtime identity залежностей;
- sync `get()` із явним `getAsync()` для async providers;
- immutable runtime після `freeze()` / `compose()`;
- scopes для request/operation lifecycle;
- modules, capabilities, required ports і bindings для явної композиції application graph;
- graph validation і diagnostic-friendly typed errors;
- optional DSL без втрати object-configuration API;
- окремі пакети для Next.js integration і testing support.

## Продуктові принципи

- Явність замість magic.
- Typed tokens замість string service names.
- Composition замість filesystem discovery або constructor metadata.
- Runtime immutable після `compose()` / `freeze()`.
- Module isolation за замовчуванням.
- Без hidden dependency access через module boundaries.
- Async initialization підтримується, але normal `get()` лишається синхронним.
- DSL є optional і побудований поверх explicit object configuration.
- Diagnostics мають бути readable and actionable.
- Core package має лишатися незалежним від Next.js, React і Node-only APIs.
