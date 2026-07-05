# TASK-07.05-0074: Multi-capability cardinality model

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: n/a
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

- [ ] Existing module declarations without `cardinality` still compile and normalize as
      `single`.
- [ ] `provides` can declare `cardinality: 'multi'`.
- [ ] `requires` can declare `cardinality: 'multi'`.
- [ ] Invalid cardinality produces typed diagnostic-friendly module definition error.
- [ ] `requires.kind` remains dependency kind and is not used for cardinality.
- [ ] Public exports remain tree-shaking friendly.
- [ ] Relevant tests and type tests pass.

## Dependencies

- Depends on human approval of `TASK-07.05-0073`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/research/RSCH-001.md`
- `memory/technical/rules.md`

## Runs

Run artifacts треба створити під час запуску задачі.
