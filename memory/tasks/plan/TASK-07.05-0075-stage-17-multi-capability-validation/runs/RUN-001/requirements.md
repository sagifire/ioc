# Run Requirements: RUN-001

Status: completed
Agent Role: Implementation Agent
Execution Mode: autonomous-implementation
Created: 2026-07-05

## Goal for This Run

Реалізувати Phase 1 validation rules для single/multi capability cardinality, включно зі
static declaration validation і post-setup validation реєстрацій `bind()` / `add()`.

## Clarified Requirements

- Duplicate `single` capability token across modules must fail deterministically.
- Multiple compatible `multi` capability declarations for same token must pass.
- A token cannot be `single` in one declaration/registration path and `multi` in another.
- Required single port satisfied only by multi capability must fail.
- Required multi port satisfied only by single capability must fail.
- Required multi port with `required: true` needs at least one contributor/provider.
- Optional multi port with `required: false` may have zero contributors.
- Declared multi capability must be registered with `add()` in module setup.
- Declared single capability must be registered with `bind()` in module setup.
- Validation and graph inference must not execute user factories.

## Scope for This Run

- Core composer/module validation for declaration-level cardinality conflicts.
- Core post-setup validation for setup registration cardinality mismatch.
- Diagnostics in the `SAGIFIRE_IOC_*` namespace with readable details.
- Focused Vitest coverage for static and post-setup phases.
- Task result memory and status handoff to review.

## Out of Scope for This Run

- Runtime public surface gating for `get()` / `getAll()`.
- Public inspection provider list shape.
- Graph-aware adapter API.
- Adapter-aware cycle detection.
- Docs/examples expansion.
- `MultiToken` / `ContributionToken` ergonomics.

## Acceptance Criteria for This Run

- [x] Duplicate single capability across modules fails with deterministic diagnostic.
- [x] Multiple compatible multi providers for same token pass validation.
- [x] Single/multi conflict fails across provides/requires/bindings/registrations where
      applicable.
- [x] Required multi dependency with `required: true` fails when no contributor exists.
- [x] Optional multi dependency with zero contributors is valid.
- [x] Declared multi plus `bind()` fails after setup.
- [x] Declared single plus `add()` fails after setup.
- [x] Validation does not execute user factories for graph inference.
- [x] Tests cover static and post-setup phases.

## Changes from Previous Run

Не застосовується для RUN-001.
