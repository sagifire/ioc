# TASK-07.05-0074: Multi-capability cardinality model

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Мета

Додати explicit `cardinality` model до module capability і dependency declarations без
зміни runtime behavior beyond type/normalization support.

## Phase

Phase 1: Multi-capability declaration foundation.

## Scope

- Додати public type для cardinality: `single | multi`.
- Додати `cardinality?: 'single' | 'multi'` до `ModuleCapabilityDefinition` /
  `ModuleCapabilityDefinitionInput` equivalent.
- Додати `cardinality?: 'single' | 'multi'` до `ModuleDependencyDefinitionInput` і
  normalized `ModuleDependencyDefinition`.
- Default cardinality: `single`.
- Зберегти `ModuleDependencyKind = 'external' | 'shared'` без semantic overload.
- Оновити normalization and validation для invalid cardinality values.
- Оновити exported types без breaking existing declarations.
- Додати unit/type tests для default `single`, explicit `multi` і invalid values.

## Out Of Scope

- Дозволяти duplicate multi providers across modules.
- Додавати runtime `get()` / `getAll()` gating.
- Додавати `composer.add()`.
- Додавати graph-aware adapters.
- Додавати `MultiToken` / `ContributionToken`.
- Оновлювати docs beyond minimal API references required by tests.

## Acceptance Criteria

- [x] Existing module declarations without `cardinality` still compile and normalize as
      `single`.
- [x] `provides` can declare `cardinality: 'multi'`.
- [x] `requires` can declare `cardinality: 'multi'`.
- [x] Invalid cardinality produces typed diagnostic-friendly module definition error.
- [x] `requires.kind` remains dependency kind and is not used for cardinality.
- [x] Public exports remain tree-shaking friendly.
- [x] Relevant tests and type tests pass.

## Dependencies

- Depends on human approval of `TASK-07.05-0073`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/research/RSCH-001.md`
- `memory/technical/rules.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for cardinality declaration foundation.
  - Result: approved
