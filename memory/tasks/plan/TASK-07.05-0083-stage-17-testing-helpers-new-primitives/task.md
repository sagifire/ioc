# TASK-07.05-0083: Testing helpers for new primitives

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: n/a
Current Research: n/a
Current Fixation: n/a

## Мета

Додати `@sagifire/ioc-testing` helpers для multi-capabilities, graph-aware adapters і child
scopes, використовуючи тільки public inspection and override surfaces.

## Phase

Phase 5: Testing and API ergonomics.

## Scope

- Add graph assertions for:
  - multi capability exists;
  - contributor/provider module exists;
  - adapter source edge exists;
  - child scope behavior can be asserted through public APIs where appropriate.
- Add test override helpers for multi contributions:
  - replace all test contributions for token;
  - append test contribution without mutating frozen runtime.
- Ensure helpers read public `getGraph()` / `inspect()` output only.
- Ensure helpers apply overrides before compose/freeze.
- Add tests for fake modules and test composer integration.

## Out Of Scope

- Reading private graph internals.
- Mutating frozen production runtime.
- Adding docs examples beyond minimal testing docs sync.
- Adding `MultiToken` / `ContributionToken`.

## Acceptance Criteria

- [ ] Testing helpers can assert multi capability contributors.
- [ ] Testing helpers can assert adapter source edges.
- [ ] Multi override helpers work through test composer before compose.
- [ ] Helpers do not depend on private core internals.
- [ ] Frozen production runtime is never mutated.
- [ ] Package exports remain tree-shaking friendly.

## Dependencies

- Depends on `TASK-07.05-0082`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Runs

Run artifacts треба створити під час запуску задачі.
