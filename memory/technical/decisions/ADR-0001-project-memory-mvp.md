# ADR-0001: Стартова Project Memory

Status: accepted
Date: YYYY-MM-DD

## Context

Проекту потрібна стартова файлова Project Memory на основі PDADM MVP 0.3 / Starter Kit 3.0.

## Decision

Використовувати `memory/` як кореневу папку Project Memory.

Структура містить:

- `agent-start.md`;
- product memory;
- domain memory з `current/` і `target/`;
- technical memory;
- task memory з `tasks/plan/progress.md`;
- knowledge memory;
- agent rules/workflows/prompts;
- templates;
- reports.

## Consequences

- Усі подальші зміни пам'яті мають підтримувати актуальні `index.md`.
- Канонічна мова пам'яті - українська.
- Регламент PDADM MVP 0.3 зберігається як knowledge package.
- Повний регламент є reference layer, а не startup layer.

## Alternatives

- Використати назву `project-memory/`. Можливо, але цей Starter Kit очікує кореневу папку `memory/`.
