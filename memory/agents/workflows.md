# Agent Workflows

## Assistant

Для обговорення ідей, уточнення вимог, аналізу ризиків, підготовки задач і controlled memory updates.

## Task Preparation

Для створення або уточнення `task.md`, scope, acceptance criteria, `Execution Mode` і потрібних execution artifacts.

`Execution Mode` фіксується в `task.md`. Workflow агента в сесії може змінюватися залежно від контексту, але це не змінює task-level `Execution Mode`.

## Autonomous Implementation

Для автономного виконання task run у межах `requirements.md` і `context.md`.

Основні артефакти:

- `runs/RUN-*/requirements.md`
- `runs/RUN-*/context.md`
- `runs/RUN-*/result.md`

Після виконання агент виконує self-review і переводить задачу в `review`, а не в `done`.

## Autonomous Research

Для автономного дослідження технічних, продуктових, архітектурних або процесних питань без імплементації.

Основні артефакти:

- `research/RSCH-*.md`
- `fixations/FIX-*.md`, якщо research пропонує фіксацію інформації в Project Memory

Після дослідження агент виконує self-review, переводить задачу в `review` і окремо просить approval на memory fixation, якщо вона потрібна.

## Interactive Memory Update

Для інтерактивного обговорення з людиною й контрольованої фіксації змін у Project Memory.

Основні артефакти:

- `worklog.md`
- `fixations/FIX-*.md`

Після застосування погодженої фіксації агент не закриває задачу самостійно. Він переводить задачу в `review` і просить task-level human review decision.

## Memory Migration

Для міграції Project Memory між версіями PDADM MVP.

Перед основними змінами агент має прочитати відповідний migration guide у `knowledge/packages/pdadm-mvp-reglament/migrations/`.

## Review

Для перевірки результату, acceptance criteria, out-of-scope змін, ризиків, memory sync і upward consistency check.

## Knowledge Update

Для створення або оновлення knowledge packages, examples, anti-examples і package index.

## Research

Для збору інформації, пошуку суперечностей і підготовки висновків без прийняття їх як canonical memory.
