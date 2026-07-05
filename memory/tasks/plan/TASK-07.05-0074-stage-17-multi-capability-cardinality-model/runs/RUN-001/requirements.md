# Run Requirements: RUN-001

Status: completed
Agent Role: Implementation Agent
Execution Mode: autonomous-implementation
Created: 2026-07-05

## Goal for This Run

Додати declaration-level `cardinality` model для module `provides` і `requires` без зміни
runtime semantics beyond type, normalization and validation support.

## Clarified Requirements

- Public cardinality type: `'single' | 'multi'`.
- `provides` declarations support optional `cardinality`.
- `requires` declarations support optional `cardinality`.
- Missing `cardinality` normalizes to `single`.
- Invalid `cardinality` values fail through typed, diagnostic-friendly module definition
  errors.
- `requires.kind` remains dependency kind (`external` або `shared`) and must not encode
  cardinality.
- Existing declaration shape remains source-compatible.

## Scope for This Run

- Core module definition types and normalization.
- Core module validation errors/diagnostics related to invalid declaration values.
- Public exports for the new cardinality type.
- Focused unit and type tests for default `single`, explicit `multi` and invalid values.
- Task result memory.

## Out of Scope for This Run

- Duplicate multi providers across modules.
- Runtime `get()` / `getAll()` gating.
- `composer.add()`.
- Graph-aware adapters.
- `MultiToken` / `ContributionToken`.
- Broad docs/examples updates beyond minimal API references required by tests.

## Acceptance Criteria for This Run

- [x] Existing module declarations without `cardinality` still compile and normalize as
      `single`.
- [x] `provides` can declare `cardinality: 'multi'`.
- [x] `requires` can declare `cardinality: 'multi'`.
- [x] Invalid cardinality produces typed diagnostic-friendly module definition error.
- [x] `requires.kind` remains dependency kind and is not used for cardinality.
- [x] Public exports remain tree-shaking friendly.
- [x] Relevant tests and type tests pass.

## Changes from Previous Run

Не застосовується для RUN-001.
