# RSCH-001: Lifetime validation implementation planning

Status: completed
Related Task: [TASK-07.13-0099](task.md)
Related Run: [RUN-001](RUN-001/index.md)
Created: 2026-07-13
Disposition: final-result

## Питання

Як розкласти approved lifetime validation design на bounded implementation tasks і
узгодити provider identity, inspection, resource ownership та testing surfaces із
підготовленим async multi-provider backlog без parallel graph model?

## Висновок

Рекомендовано п'ять tasks `TASK-0106`..`0110` у спільному serialized chain з
`TASK-0100`..`0105`. `TASK-0100` стає єдиним shared provider identity foundation:
canonical private key є `moduleId + module-wide registrationIndex`, а private collection
cycle coordinate окремо мапиться на цей key. Lifetime metadata/edges повторно
використовують foundation, async factory/resource tasks проводять той самий dependency
contract, а scope/export integration виконується після async resource ownership.

Rollout лишається additive: default validation `off`; `report` і `enforce` не змінюють
stable severity, а керують лише blocking proven unsafe capture; incomplete coverage не є
unsafe. Graph export v1 лишається default/byte-stable, provider dependency graph
додається opt-in schema v2.

## Результати

- Current-code impact map для core/composer/scope/diagnostics/inspection/export/testing/DSL.
- Shared identity reconciliation contract із async multi tasks.
- Normalized provider-edge, coverage та ownership foundation.
- П'ять bounded implementation task contracts з predecessors, scope, acceptance і gates.
- Compatibility/adoption/enforcement policy та cross-feature stabilization implications.
- Required canonical `FIX-001` proposal і окремий operational task reconciliation follow-up.

## Detailed report

[2026-07-13-stage-18-lifetime-validation-implementation-planning.md](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)
