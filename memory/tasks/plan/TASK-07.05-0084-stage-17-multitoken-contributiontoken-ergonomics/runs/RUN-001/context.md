# RUN-001 Context

## Agent Role

Agent Implementer.

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
  - relevant Phase 5 lines from `TASK-07.05-0073` fixation;
  - previous dependency result from `TASK-07.05-0083`.

## Relevant Decisions

- Stage 17 helper API is optional and must be accepted only if it improves type-level
  ergonomics without complicating ordinary `token()` use cases.
- `token()` must remain the ordinary and fully supported token factory for both single and
  multi capabilities.
- Cardinality is declaration/registration behavior, not token runtime identity behavior.
- Runtime identity remains based on token ID; helper branding may provide compile-time
  signal only.

## Current Risk

Adding separate runtime token classes or hidden cardinality metadata would conflict with the
existing cardinality model. A safe implementation, if accepted, should be a typed additive
helper around the existing token factory rather than a parallel token identity system.
