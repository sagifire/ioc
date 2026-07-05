# TASK-07.05-0086: `0.0.2` docs and examples

Status: done
Type: docs
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Documentation Agent
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Мета

Актуалізувати README, deep docs і examples під усі implemented `0.0.2` features перед
final audit/stabilization phase.

## Phase

Phase 6: Documentation and examples. Це передостання фаза.

## Scope

- Update root and package README files where public API changed.
- Update composer/modules docs for:
  - `cardinality` in `provides` and `requires`;
  - multi dependency `required: true | false` semantics;
  - runtime `get()` / `getAll()` public surface rules;
  - graph-aware adapters and source declarations;
  - adapter-aware cycle diagnostics.
- Update container/context docs for child scopes if public APIs were added.
- Update testing docs for new helpers.
- Update Next docs only where thin adapter usage examples need child-scope mention.
- Add or update examples for:
  - multi contributions catalog;
  - graph-aware auth adapter;
  - child scope transaction/preview-style overlay without domain APIs in core.
- Verify examples compile/run through existing scripts where available.

## Out Of Scope

- Implementing missing runtime features.
- Adding site-engine business APIs to core or Next package.
- Actual release/publish work.

## Acceptance Criteria

- [x] Docs describe only implemented public API.
- [x] Multi-capability examples cover providers, consumers and optional empty collection.
- [x] Adapter docs показують `using()` без resolver context.
- [x] Child scope docs explain separate scoped provider cache.
- [x] Testing docs use public helpers and avoid private internals.
- [x] Existing examples continue to pass.
- [x] New/updated docs preserve Ukrainian Project Memory and English package docs style as
      appropriate for repository docs.

## Dependencies

- Depends on `TASK-07.05-0085`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Runs

- [RUN-001](runs/RUN-001/result.md)
