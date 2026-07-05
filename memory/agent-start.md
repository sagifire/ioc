# Agent Start

Starter Kit Version: 3.0
PDADM MVP Version: 0.3

## Призначення

Цей файл є першою точкою входу агента в Project Memory.

Він обмежує стартове читання пам'яті, щоб агент швидко зрозумів правила роботи й перейшов до задачі без зайвого дослідження всього репозиторію пам'яті.

Усі шляхи в цьому файлі вказані від кореня проекту.

## Стандартний boot packet

За замовчуванням агент читає:

- `memory/README.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`

Після цього агент зупиняє стартове читання й переходить до задачі.

## Startup profiles

Startup profile є операційною підказкою для читання контексту. Це не task-level `Execution Mode`.

Якщо задача вказана, агент бере `Execution Mode` з `task.md`.

### discussion / task-preparation

Читати:

- `memory/README.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`

### autonomous-implementation

Читати:

- default boot packet;
- `memory/tasks/plan/progress.md`;
- task `task.md`;
- поточний run `requirements.md`;
- поточний run `context.md`.

### autonomous-research

Читати:

- default boot packet;
- `memory/tasks/plan/progress.md`;
- task `task.md`;
- поточний `research/RSCH-*.md`, якщо існує;
- `memory/knowledge/package-index.md`, якщо research може потребувати reusable knowledge;
- релевантні knowledge packages.

### interactive-memory-update

Читати:

- default boot packet;
- `memory/tasks/plan/progress.md`;
- task `task.md`;
- `worklog.md`, якщо існує;
- цільові memory files, які явно потрібні для фіксації.

### memory-migration

Читати:

- default boot packet;
- `memory/tasks/plan/progress.md`;
- task `task.md`;
- поточний run `requirements.md`;
- поточний run `context.md`;
- `memory/knowledge/package-index.md`;
- `memory/knowledge/packages/pdadm-mvp-reglament/package.md`;
- відповідний migration guide.

## Правило зупинки

Агент повинен зупинити стартове дослідження після boot packet або startup profile.

Додаткові документи читаються тільки якщо:

- task/run/fixation context прямо цього вимагає;
- `index.md` явно вказує на потрібний файл;
- `memory/knowledge/package-index.md` показує релевантний package;
- є конфлікт або неясність правил;
- без додаткового читання є ризик пошкодити Project Memory;
- користувач прямо просить дослідити глибше.

## Повний регламент є reference layer

Повний регламент `memory/knowledge/packages/pdadm-mvp-reglament/` не читається на старті звичайної сесії.

Його читати, коли:

- задача має тип `memory-migration`;
- задача змінює регламент, workflow або шаблони;
- треба уточнити конфлікт правил;
- користувач прямо просить читати регламент.
