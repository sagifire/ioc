# RUN-001 Requirements

Task: `TASK-07.05-0080-stage-17-adapter-cycle-diagnostics`
Agent Role: Implementation Agent
Started: 2026-07-05

## Мета run

Розширити module graph cycle diagnostics так, щоб cycle detection враховував
`adapter-source` edges, додані попереднім adapter slice.

## Functional Requirements

- Adapter-source edges мають брати участь у module graph cycle detection.
- Cycle graph semantics мають явно покривати:
  - `capability` edges;
  - `binding` edges;
  - `adapter-source` edges.
- Valid non-cyclic composition-root adapters мають продовжити проходити validation.
- Cycle diagnostics мають показувати deterministic path, token IDs and edge kinds,
  включно з `adapter-source`.
- Cycle validation не має виконувати adapter factories або інші user factories.
- Diagnostic code choice має бути зафіксований у result з аргументацією.

## Test Requirements

- Додати regression tests для cycles, які проходять через `adapter-source` relationships.
- Додати regression tests для valid non-cyclic adapter composition.
- Перевірити, що adapter factory не виконується для cycle detection.
- Запустити relevant core checks and broader quality gates if feasible.

## Out Of Scope

- Новий adapter API surface.
- `fromAll()` або multi-source adapter support.
- Testing package helpers.
- Docs/examples expansion.
