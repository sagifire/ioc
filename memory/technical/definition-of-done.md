# Definition of done

Source trace: `SPEC.md` sections 51-53.

## Project-level definition of done

Проект вважається завершеним, коли `@sagifire/ioc` реалізує:

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

Проект вважається завершеним, коли `@sagifire/ioc-next` реалізує:

- Next.js runtime helper;
- request context helper;
- route scope helper;
- server action scope helper;
- App Router examples.

Проект вважається завершеним, коли `@sagifire/ioc-testing` реалізує:

- test runtime;
- test composer;
- overrides;
- module harness;
- graph assertions.

Repository має надати:

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
- release workflow;
- pre-`0.0.1` stabilization audit;
- critical audit finding closure;
- `0.0.1` version fixation for publishable packages;
- аудит `0.0.2` feature proposals перед перетворенням їх на implementation scope.

## Architectural definition of done

Архітектура валідна, коли:

- core package незалежний від Next.js;
- runtime immutable після `compose()` / `freeze()`;
- `get()` завжди синхронний;
- async initialization підтримується безпечно;
- modules не мають доступу до internals інших modules;
- required ports належать consumer modules;
- public APIs/capabilities експортуються явно;
- bindings з'єднують required ports з providers/adapters;
- dependency graph можна інспектувати й валідовувати;
- diagnostics зрозуміло пояснюють проблеми;
- DSL лишається optional;
- testing overrides не мутують production runtime.

## Safety definition of done

Implementation безпечна, коли:

- кожен stage має tests;
- кожен stage має clear acceptance criteria;
- public API changes є intentional;
- errors typed and documented;
- resources disposed correctly;
- у core немає global runtime state;
- package boundaries не порушені;
- hidden framework-specific dependency не протікає в core;
- release workflows не commit secrets і не publish без explicit human approval;
- version `0.0.1` не фіксується, доки critical stabilization audit findings лишаються open;
- `0.0.2` feature implementation не стартує з unaudited monolithic feature request.
