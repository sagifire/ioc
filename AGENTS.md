# AGENTS.md

## Базові принципи роботи

- Архітектура систем не терпить рішень "в лоб" та зрізань кутів.
- Якщо щось не очевидно, краще уточнити, ніж вгадати.
- Коли щось виправляєш, виправляй причини, а не лікуй наслідки.
- Мати власну думку та відстоювати позицію за допомогою логіки й аргументів - добре;
  змінити бачення під час дискусії на більш логічне - ще краще.

## Project Memory

У цьому проекті використовується Project Memory у папці:

```text
memory/
```

Фактична версія пам'яті:

```text
Starter Kit Version: 3.0
PDADM MVP Version: 0.3
```

Project Memory є operational source of truth для продуктового контексту, вимог, задач,
архітектури, правил, staged roadmap, доменної пам'яті, reusable knowledge packages і
агентських workflow.

## Agent Startup

Для документів пам'яті використовуй UTF-8 по замовчуванню
Перед будь-якою змістовною роботою агент починає з:

```text
memory/agent-start.md
```

Після startup boot packet агент працює за:

```text
memory/memory-rules.md
memory/agents/rules.md
```

Агент не читає всю `memory/`, повний `pdadm-mvp-reglament` або історичні source snapshots
без task-level потреби.

## Agent Role

Кожна агентська сесія повинна мати явну `Agent Role`.

Якщо роль не вказана, агент працює як `Agent Assistant` у режимі clarification:

- уточнює намір користувача;
- допомагає підготувати або знайти задачу;
- не змінює canonical Project Memory або код без достатнього контексту й підтвердженого
  режиму роботи.

## Project Context

Репозиторій призначений для `@sagifire/ioc`: TypeScript-native, JavaScript-friendly
бібліотеки для модульної композиції залежностей, IoC-контейнера, контекстних scope-ів,
module composer, typed tokens, capabilities, required ports, diagnostics та
DSL-конфігураторів.

Canonical project context:

- `memory/product/vision.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/technical/specification-trace.md`

## Historical Source References

Root `SPEC.md` є історичним source reference. Його snapshot у Project Memory:

```text
memory/sources/SPEC.md
```

`memory/sources/SPEC.md` є historical immutable source snapshot. Його не можна редагувати
під час реалізаційних або memory-update задач. Якщо специфікація уточнюється, треба
оновлювати canonical Project Memory files або створювати новий source snapshot через окрему
human-reviewed задачу.

`SPEC.md` і `memory/sources/SPEC.md` не є operational source of truth після
`TASK-06.26-0002`. Для реалізації використовувати `memory/product/roadmap.md` і canonical
technical/product/domain memory.

## Архітектурні межі

Canonical rules живуть у:

```text
memory/technical/rules.md
```

Ключові межі:

- `@sagifire/ioc` є core-пакетом і не імпортує Next.js, React, Node-only API, `fs`,
  `path`, `process`, `Buffer`, decorators або `reflect-metadata`.
- `@sagifire/ioc-next` містить тільки Next.js App Router adapters/helpers і не впливає на
  core API.
- `@sagifire/ioc-testing` містить test utilities, overrides, fake modules, graph assertions
  і не мутує frozen production runtime.
- Container не знає про modules.
- Context не знає про Next.js.
- Composer використовує container/context для збірки application graph.
- DSL є опціональним шаром над explicit object-configuration API.
- Next.js adapter живе окремо від core.

## Непорушні правила реалізації

- Не додавати decorators як required API.
- Не додавати `reflect-metadata`.
- Не створювати global mutable container або service locator.
- Не імпортувати Next.js або React з `@sagifire/ioc`.
- Не використовувати Node-only API у `@sagifire/ioc`.
- `get()` завжди синхронний і ніколи не повертає `Promise`.
- Runtime immutable після `freeze()` / `compose()`.
- Не робити filesystem auto-discovery.
- Не ховати dependency graph за DSL magic.
- Не експортувати private providers модулів через runtime.
- Уникати `any`; якщо він неминучий, причина має бути локально зрозуміла.
- Помилки мають бути typed, readable і diagnostic-friendly.
- Кожна поведінкова зміна має супроводжуватися тестами.
- Package exports мають залишатися tree-shaking friendly.
- Object-configuration API має залишатися повністю usable без DSL.

## Стиль коду

- TypeScript, ESM.
- 4 spaces indent.
- Single quotes.
- No semicolons.
- No trailing commas.
- Уникати `any`.
- Явно обробляти `undefined`.
- Завжди використовувати braces.
- Орієнтовний print width: 100.

## Робочий процес

- Реалізовуй поетапно відповідно до `memory/product/roadmap.md`.
- Не перескакуй на наступну стадію без виконання acceptance criteria поточної.
- Stage 2 створює лише foundation монорепи: workspace, package structure, TypeScript,
  ESLint, Prettier, Vitest, build scripts, package export placeholders, README/docs
  skeleton і CI-ready scripts.
- Не реалізовувати container logic під час Stage 2.
- Після змін запускати релевантні перевірки (`pnpm build`, `pnpm test`, typecheck/lint,
  якщо доступні).
- Якщо залежності ще не встановлені або команда потребує мережі, не обходити це прихованими
  способами: попросити дозвіл на інсталяцію.
- Не робити широкі рефактори без потреби. Міняти тільки те, що потрібно для поточної
  задачі.
