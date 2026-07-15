# RSCH-001: Runtime/composition state-machine decomposition decision

Status: completed
Type: research
Related Task: [TASK-07.15-0112](task.md)
Related Run: [RUN-001](RUN-001/index.md)
Detailed Report: [2026-07-15-stage-18-runtime-composition-state-machine-decomposition-research](../../../reports/research/2026-07-15-stage-18-runtime-composition-state-machine-decomposition-research.md)
Created: 2026-07-15
Disposition: final-result
Review Status: findings-resolved
Review Record: [RUN-001 result](RUN-001/result.md)

## Дослідницьке питання

Чи слід зараз виконувати structural refactor великих integration state machines у
`container.ts` і `composer.ts`, чи безпечніше лишити реалізацію без refactor до появи
сильніших evidence і characterization coverage?

## Рішення

Рекомендація: `no refactor` зараз.

- `APR-002` підтверджено як maintainability/change-risk pressure, не behavioral defect.
- `container.ts` має material hotspot `createRuntime()`; його valuable seams поки мають
  високу shared-state, cache, scope та resource-ownership coupling.
- `composer.ts` великий, але orchestration уже decomposed into named top-level helpers;
  найчистіша P1 validation seam сама по собі не зменшує runtime state-machine risk.
- Git churn не є достатнім evidence через коротку initial-delivery history.
- Focused baseline 240/240 green, але material exact-preservation gaps лишаються.
- Big-bang rewrite відхилено; conditional staged option має characterization і go/no-go gates.

## Evidence summary

| Evidence | Result |
|---|---|
| AST metrics | container 3198/219/169; composer 5709/322/329 |
| Container hotspot | `createRuntime`: 1198 lines, 121 subtree decisions, 69 nested functions |
| Composer hotspot | `createLiveModuleSetupContext`: 172 lines, 13 nested functions |
| Coupling indicators | import fan-out 7/6; tracked shared-state fan-out 16/70 і 7/14 bodies |
| History | container 14 commits/3840 churn; composer 22/6267; 7 shared commits |
| Behavioral baseline | 11 focused files, 240/240 tests passed |
| Незалежний аудит | closure `PASS`; open findings none |

Формат AST metrics: `lines / decision sites / function-like bodies`. Exact script, SHA-256,
commands, limitations, maps, seams, test gaps і preservation matrix містяться у detailed report.

## State/ownership conclusion

- Candidate runtime clone owns provider records and singleton cache/resource ledger.
- Scope owns local values, scoped cache/resource ledger and child scope disposal ordering.
- Collection owns no cache, in-flight state, resource або disposer.
- Composer build owns snapshots, internal container, access model, private mappings and setup
  activation; composed facade only gates/delegates.
- Any extraction must keep one canonical identity/graph/cache/owner model and current dependency
  direction `composer -> container`, never the reverse.

## Characterization gates

Перед будь-якою structural extraction обраний seam потребує precise tests для:

- concurrent/repeated freeze and mutation boundary;
- lifecycle/kind/missing/async/cycle error precedence;
- disposal failure idempotency and dual callback/disposal failures;
- repeated prepare/compose snapshots and setup re-execution;
- failed-build context/index freshness;
- explicit human decision for `prepare()` eager resource ownership;
- ordered diagnostic golden if static validation is extracted.

## Options

- `no refactor + monitoring`: recommended.
- bounded staged internal refactor: conditional only after trigger and characterization gate.
- big-bang rewrite: rejected.

## Рішення щодо продовження

- Негайна task: none.
- Optional `FUP-0112-A`: trigger-gated characterization-only task.
- Optional `FUP-0112-B`: one extraction seam after successful A; P1 or C1, not both.
- Actual task creation remains separately human-approval-gated.

## Canonical impact

- Operational artifacts: included.
- Product/domain/technical/roadmap/state/knowledge: not-needed.
- `FIX-*`: none.
- `0.0.3` release: non-blocking, no change.

## Disposition

`final-result`; task-level acceptance лишається reviewed proposal до human approval.
