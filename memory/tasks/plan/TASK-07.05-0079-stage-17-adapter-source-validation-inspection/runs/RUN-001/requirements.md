# RUN-001 Requirements

Task: `TASK-07.05-0079-stage-17-adapter-source-validation-inspection`
Agent Role: Implementation Agent
Started: 2026-07-05

## Мета run

Додати validation and public inspection visibility для graph-aware adapters, які були
додані у `TASK-07.05-0078`.

## Functional Requirements

- Adapter target token має бути declared required port / external dependency token.
- Missing adapter source має давати deterministic diagnostic
  `SAGIFIRE_IOC_ADAPTER_SOURCE_MISSING`.
- Adapter source, який відповідає module-private provider, має давати diagnostic
  `SAGIFIRE_IOC_ADAPTER_SOURCE_PRIVATE`.
- Multi source token має відхилятися у цьому slice з diagnostic
  `SAGIFIRE_IOC_ADAPTER_SOURCE_CARDINALITY_MISMATCH`.
- Invalid adapter target має давати diagnostic `SAGIFIRE_IOC_ADAPTER_TARGET_INVALID`.
- Graph inspection має показувати adapter-source edges без виконання adapter factory.
- Public inspection має показувати adapter target, source tokens and source provider info
  without leaking private provider values.
- Existing non-graph-aware `bind().toFactory()` behavior має лишитися unchanged.

## Test Requirements

- Додати diagnostic tests для invalid target, missing source, private source and multi source.
- Додати inspection/graph tests для adapter-source edge visibility.
- Додати regression, що validation, inspection and graph building do not execute adapter
  factory.
- Запустити relevant core checks: package tests/build and broader checks if feasible.

## Out Of Scope

- Adapter-aware cycle detection.
- Multi-source `fromAll()`.
- Deprecated warnings for low-level `bind().toFactory()`.
- DSL migration docs.
