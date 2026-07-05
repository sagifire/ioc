# TASK-07.05-0077: Multi-capability inspection and diagnostics

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Мета

Оновити public inspection model так, щоб graph явно показував cardinality, providers,
registration kind and ordering для multi-capabilities.

## Phase

Phase 2: Multi-capability runtime and inspection.

## Scope

- Додати `cardinality` до capability/required-port inspection metadata.
- Додати provider/contributor list для multi-capabilities.
- Provider metadata має включати:
  - module identity for module contributions;
  - composition-root identity for composition additions if supported;
  - `registrationKind: 'bind' | 'add'` or equivalent stable public wording;
  - deterministic `registrationIndex`.
- Expose satisfaction state for required multi ports.
- Update `formatDiagnostics()` coverage where new details need readable output.
- Add tests that inspection can be used by future testing helpers without private internals.

## Target Shape

```ts
interface GraphCapabilityNode {
    readonly tokenId: string
    readonly kind: string
    readonly cardinality: 'single' | 'multi'
    readonly providers: readonly GraphCapabilityProvider[]
}

interface GraphCapabilityProvider {
    readonly moduleId: string
    readonly registrationKind: 'bind' | 'add'
    readonly registrationIndex: number
}
```

The final implementation may adapt names to existing `ModuleGraph` conventions, but it must
preserve the same information.

## Out Of Scope

- Graph-aware adapter edges.
- Testing package helpers.
- Documentation examples.
- Runtime behavior changes not required by inspection correctness.

## Acceptance Criteria

- [x] `composer.getGraph()` and `composer.inspect()` expose cardinality.
- [x] `runtime.inspect()` exposes provider/contributor metadata after composition.
- [x] Provider ordering in inspection matches resolution ordering.
- [x] Optional and required multi dependency satisfaction state is visible.
- [x] Public inspection exposes enough data for testing helpers.
- [x] No private provider details leak through inspection.

## Dependencies

- Depends on `TASK-07.05-0076`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/technical/rules.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
