# RUN-001 Context

Task: `TASK-07.05-0080-stage-17-adapter-cycle-diagnostics`

## Джерела

- `task.md` цієї задачі.
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`.
- `memory/tasks/plan/TASK-07.05-0079-stage-17-adapter-source-validation-inspection/runs/RUN-001/result.md`.
- `memory/technical/rules.md`.

## Рішення, які треба зберегти

- Graph-aware adapter API лишається additive object API.
- Adapter `using()` не отримує generic resolver context.
- Adapter source validation and inspection rely on metadata, not factory execution.
- First adapter slice supports single source tokens only.
- Adapter target token має лишатися external required port target.

## Межі run

Цей run додає adapter-aware cycle diagnostics on existing graph metadata. Він не додає
новий adapter API, multi-source semantics, testing package helpers або docs/examples.
