# Run Requirements: RUN-001

Status: completed
Agent Role: Implementation Agent
Execution Mode: autonomous-implementation
Created: 2026-07-05

## Goal for This Run

Реалізувати Phase 2 public inspection metadata для multi-capabilities так, щоб
`composer.getGraph()`, `composer.inspect()` і `runtime.inspect()` явно показували
cardinality, contributor/provider identity, registration kind and deterministic ordering.

## Clarified Requirements

- `RequiredPortMetadata` exposes dependency cardinality and existing satisfaction state.
- `CapabilityMetadata` exposes capability cardinality.
- Public graph capability metadata exposes provider/contributor declarations without
  виконання user factories.
- Runtime inspection exposes actual exported provider registrations with stable
  `registrationKind` and deterministic `registrationIndex`.
- Provider/contributor ordering in inspection matches runtime resolution ordering:
  composer module order and setup registration order inside a module.
- Optional and required multi dependency satisfaction state remains visible through public
  inspection.
- Inspection must not expose module-private provider tokens, values or private token IDs.

## Scope for This Run

- Core composer/runtime public inspection types and graph construction.
- Provider registration metadata needed by future `@sagifire/ioc-testing` helpers.
- Focused Vitest coverage for graph inspection, runtime inspection and readable diagnostic
  formatting where current formatter output needs cardinality fields.
- Task result memory and status handoff to review.

## Out of Scope for This Run

- Graph-aware adapter API and adapter edges.
- `composer.add()` composition-root multi contributions.
- Testing package helper APIs.
- Documentation examples.
- Runtime behavior changes not required by inspection correctness.
- `MultiToken` / `ContributionToken` ergonomics.

## Acceptance Criteria for This Run

- [x] `composer.getGraph()` and `composer.inspect()` expose cardinality.
- [x] `runtime.inspect()` exposes provider/contributor metadata after composition.
- [x] Provider ordering in inspection matches resolution ordering.
- [x] Optional and required multi dependency satisfaction state is visible.
- [x] Public inspection exposes enough data for testing helpers.
- [x] No private provider details leak through inspection.

## Changes from Previous Run

Не застосовується для RUN-001.
