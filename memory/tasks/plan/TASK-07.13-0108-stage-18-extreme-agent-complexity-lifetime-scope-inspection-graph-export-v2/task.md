# TASK-07.13-0108: [EXTREME AGENT COMPLEXITY] Stage 18 lifetime scope, inspection and graph export v2

Task Status: done
Type: implementation
Created: 2026-07-13
Agent Complexity: extreme
Owner Role: Implementation Agent
Current Run: RUN-001

## Поточний стан

Run Status: completed
Progress: Human review approved; task and RUN-001 finalized.
Acceptance: 12/12
Blockers: none
Blocked Phase: n/a
Pending Decisions: none
Next Action: Proceed to successor only by explicit user command.

## Мета

Додати deterministic scope-effective lifetime validation, immutable provider inspection
і opt-in graph export v2 після стабілізації async factory/resource kinds та ownership,
зберігши graph v1 byte-stable і не переприв'язуючи singleton до child targets.

## Попередники

- [TASK-0103](../TASK-07.13-0103-stage-18-extreme-agent-complexity-async-multi-resource-ownership-disposal/task.md)
  має бути `done` після human review.
- Final results TASK-0101, TASK-0102 і TASK-0103 мають бути прочитані та incorporated у
  activation evidence до code changes.

## Вимоги

- Виконувати effective validation після local/inherited normalization і до child linking/return.
- Не виконувати factories та не публікувати child scope при validation failure.
- Підставляти targets за consumer resolution domain, а не cache readiness.
- Ready і uninitialized singleton завжди використовують base runtime targets.
- Scoped consumer використовує effective scope targets; transient залежить від runtime/scope call domain.
- Моделювати local values як scope-owned registrations без retroactive singleton rebinding.
- Додати immutable provider graph/coverage/diagnostics до safe runtime/scope inspection.
- Інтегрувати async factory/resource kinds і derived owner edges TASK-0101..0103.
- Додати opt-in JSON schema v2 та pure DOT/Mermaid projections.
- Зберегти v1 default/byte-stable; у v1 заборонити provider nodes/edges/coverage.

## Обсяг

- `createScope()`/child insertion point, effective snapshots, cache-isolation semantics.
- Container/composed runtime/scope inspection provider projection.
- Graph export v2 provider/dependency/ownership/coverage schema і renderers.
- Async provider/resource integration, private-safe projection, golden parity tests.

## Поза обсягом

- Testing helpers, DSL, adoption docs/examples.
- Default schema v2, default enforcement, version bump або publish.
- Readiness/in-flight/value/disposer exposure або graph v1 provider extension.

## Критерії приймання

- [x] TASK-0101..0103 final contracts traced та incorporation evidence recorded before changes.
- [x] Scope validation runs after normalization and before child publication/factory execution.
- [x] Nested inherited/override multi order і separate scoped caches covered.
- [x] Ready і uninitialized singleton use base targets and never bind child overrides.
- [x] Scoped/transient substitution follows explicit consumer resolution domain.
- [x] Local values are scope-owned targets without retrospective singleton rebinding.
- [x] Runtime/scope inspection is immutable and omits values/readiness/in-flight/disposers.
- [x] Validator, inspection and export consume identical provider keys/edge snapshot.
- [x] Async factory/resource kinds and derived ownership edges have inspection/export parity.
- [x] Existing v1 inputs remain byte-stable; v1 contains no provider nodes/edges/coverage.
- [x] v2 JSON/DOT/Mermaid deterministic and private sentinel-free; full gates pass.
- [x] DSL/testing/docs/default v2/enforcement not implemented; independent audit passed.

## Пов'язана пам'ять

- [Approved TASK-0097](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/task.md)
- [TASK-0097 result](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RUN-001/result.md)
- [TASK-0097 design report](../../../reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md)
- [Approved TASK-0099 planning](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md)
- [TASK-0099 result](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/result.md)
- [TASK-0099 planning report](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)
- [Predecessor TASK-0103](../TASK-07.13-0103-stage-18-extreme-agent-complexity-async-multi-resource-ownership-disposal/task.md)

## Прогони

- [RUN-001](RUN-001/index.md) - completed - Scope/inspection/graph v2 integration.

## Дослідження

Не очікується; schema або scope blocker потребує explicit design decision.

## Фіксації

Не очікуються; canonical changes потребують окремого approved `FIX-*`.

## Запити на рішення

Немає; v1/v2 і scope target contracts approved planning report визначає exact.

## Human Review

Status: approved
Requested: 2026-07-14
Reviewed: approved 2026-07-14
Approval Source: user message: `approve`

## Фінальний результат

Completed: 2026-07-14
Final Run: RUN-001
Summary: Scope-effective lifetime validation, immutable provider inspection and opt-in graph export v2 implemented and approved while preserving graph v1 compatibility.
Residual Risks: Declarative metadata cannot prove hidden factory-body lookups; schema v2 remains opt-in and future incompatible evolution requires another schema version.
