# Вимоги прогону: RUN-001

Status: completed
Agent Role: Memory Migration Agent
Execution Mode: autonomous-implementation
Created: 2026-07-06

## Мета цього run

Виконати міграцію Project Memory з PDADM MVP 0.3 / Starter Kit 3.0 до PDADM MVP 0.4 / Starter Kit 4.0 за `from-0.3-to-0.4.md`, використовуючи `.tmp/memory_mvp_0.4.ua.zip` як reference.

## Уточнені вимоги

- Не розпаковувати Starter Kit поверх існуючої Project Memory.
- Зберегти project-specific product/domain/technical/task зміст.
- Не редагувати завершені task artifacts без прямої причини.
- Оновити starter-level rules, workflows, prompts, templates, reports structure і indexes.
- Оновити version marker у `AGENTS.md`.
- Перед завершенням перевірити міграційні acceptance criteria.

## Обсяг

- `memory/agent-start.md`, `memory/human-start.md`, `memory/README.md`, `memory/state.md`, `memory/memory-rules.md`.
- `memory/agents/*`.
- `memory/tasks/README.md`, `memory/tasks/plan/progress.md`, task migration artifacts.
- `memory/templates/*`.
- `memory/reports/*`.
- `memory/knowledge/package-index.md` і relevant package indexes.
- Starter-level `index.md`.
- Minimal technical memory guidance for architecture health.
- `AGENTS.md` version marker.

## Поза обсягом

- Code/runtime/package behavior changes.
- Historical source snapshot edits.
- Retrofitting completed task folder artifacts to MVP 0.4 format.
- Broad product/domain/technical rewrites unrelated to migration.

## Критерії приймання

- [x] Migration guide required checks pass or limitations are documented.
- [x] StarterKit reference was used only for comparison/selected starter files.
- [x] Migration task/result artifacts are present.
- [x] Memory sync is recorded.

## Зміни від попереднього run

Не застосовується для RUN-001.
