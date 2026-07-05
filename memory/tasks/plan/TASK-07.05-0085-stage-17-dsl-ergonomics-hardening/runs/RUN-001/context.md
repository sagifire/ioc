# RUN-001 Context

## Agent Role

Implementation Agent.

## Startup

- Прочитано `memory/agent-start.md`.
- Прочитано default boot packet:
  - `memory/README.md`;
  - `memory/state.md`;
  - `memory/memory-rules.md`;
  - `memory/agents/rules.md`.
- Прочитано `memory/tasks/plan/progress.md`.
- Прочитано task context:
  - `task.md`;
  - `index.md`;
  - `memory/technical/rules.md`;
  - `TASK-07.05-0073` fixation;
  - dependency result from `TASK-07.05-0084`.

## Relevant Decisions

- DSL is optional and must compile to existing object configuration.
- Object API remains canonical and fully usable without DSL.
- Cardinality is declaration/registration behavior, not token runtime metadata.
- Graph-aware adapter object API exists as additive `adapt(target).from(source).using(...)`
  shape and must not execute factories for validation or inspection.
- Existing DSL `adapt(token, factory)` behavior must remain backward compatible.

## Current Risk

The main design risk is adding DSL shortcuts that obscure module graph semantics. Safe
ergonomics should stay explicit: DSL declarations should map directly to object
configuration fields and adapter source edges should be declared, not inferred from
factory bodies.
