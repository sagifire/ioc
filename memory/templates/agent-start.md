# Agent Start

Starter Kit Version: 3.0
PDADM MVP Version: 0.3

## Purpose

Коротко: як агент має входити в Project Memory.

Усі шляхи в цьому файлі вказані від кореня проекту.

## Default Boot Packet

- `memory/README.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`

## Startup Profiles

Startup profile є операційною підказкою для читання контексту. Якщо задача вказана, `Execution Mode` береться з `task.md`.

### discussion / task-preparation

- default boot packet

### autonomous-implementation

- default boot packet
- `memory/tasks/plan/progress.md`
- task `task.md`
- current run `requirements.md`
- current run `context.md`

### autonomous-research

- default boot packet
- `memory/tasks/plan/progress.md`
- task `task.md`
- current `research/RSCH-*.md`, якщо існує
- `memory/knowledge/package-index.md`, якщо research може потребувати reusable knowledge
- relevant knowledge packages

### interactive-memory-update

- default boot packet
- `memory/tasks/plan/progress.md`
- task `task.md`
- `worklog.md`
- relevant target memory files

### memory-migration

- default boot packet
- task/run context
- `memory/knowledge/package-index.md`
- `memory/knowledge/packages/pdadm-mvp-reglament/package.md`
- relevant migration guide

## Stop Rule

Після boot packet або startup profile агент переходить до задачі.

Додаткові документи читати тільки за явною потребою.

## When To Read Full Reglament

- `memory-migration`
- зміна регламенту, workflow або шаблонів
- конфлікт правил
- пряма вказівка користувача
