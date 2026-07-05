# RUN-001 Context

## Agent Role

Documentation Agent.

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
  - `index.md`.

## Relevant Decisions

- Stage 17 `0.0.2` features уже реалізовані попередніми задачами; ця задача не додає
  runtime behavior.
- `MultiToken` / `ContributionToken` є type-level helper API поверх existing token
  identity; docs/examples не мають обіцяти compile-time rejection для `bind()` або
  `get()`.
- DSL має два adapter helper paths:
  - compatibility `adapt(token, factory)` без inferred source edges;
  - graph-aware `adapter(target).from(source).using(factory)` з explicit source edges.
- Object API лишається canonical і fully usable без DSL.

## Current Risk

Main risk is documenting desired design instead of implemented public API. Before editing
docs/examples, inspect package exports, tests and existing examples to keep statements
grounded in code.
