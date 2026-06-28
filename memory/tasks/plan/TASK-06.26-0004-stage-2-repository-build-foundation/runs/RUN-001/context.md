# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.26-0004-stage-2-repository-build-foundation/task.md`
- `memory/tasks/plan/TASK-06.26-0004-stage-2-repository-build-foundation/runs/RUN-001/requirements.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

`@sagifire/ioc` має бути TypeScript-native, JavaScript-friendly бібліотекою для
модульної композиції залежностей. Stage 2 не реалізує цю поведінку, а створює foundation,
на якому наступні stages зможуть будувати й перевіряти packages.

## Relevant Domain Context

Stage 2 працює з repository/package/build доменом. Доменні поняття runtime graph,
container, scopes, modules і adapters мають лишатися documented future surface, але не
реалізовуватись.

## Relevant Technical Context

- Core package `@sagifire/ioc` має бути runtime-agnostic.
- Next.js/React можуть належати тільки adapter package і тільки на відповідному stage.
- Object-configuration API, container logic і tokens починаються пізніше.
- Stage 2 allowed scope обмежений workspace, package structure, TypeScript, ESLint,
  Prettier, Vitest, build scripts, package export placeholders, README/docs skeleton і
  CI-ready scripts.
- Planned build tool: `tsup`.

## Relevant Knowledge Packages

Немає обов'язкових reusable knowledge packages. Якщо під час implementation виникне
процесний конфлікт, перевірити `memory/knowledge/package-index.md`.

## Files / Modules to Inspect

- Root repository files.
- Existing `AGENTS.md`.
- Existing `SPEC.md` only як source reference, не як operational source of truth.
- `memory/` only through required reading and task-level needs.

## Known Risks

- Непомітно реалізувати Stage 3+ behavior через placeholder exports.
- Додати Node-only або framework-specific dependency у core package.
- Заявити в README/docs, що runtime API вже працює, хоча Stage 2 створює тільки skeleton.
- Спробувати інсталювати dependencies без дозволу, якщо команда потребує мережі.

## Assumptions

- Human review `TASK-06.26-0003` завершено або користувач явно попросив запускати
  `TASK-06.26-0004`.
- Якщо dependency installation потребує мережі, агент попросить дозвіл.
- Якщо `tsup` виявиться непридатним, агент зафіксує blocker або task-level decision перед
  заміною tool.
