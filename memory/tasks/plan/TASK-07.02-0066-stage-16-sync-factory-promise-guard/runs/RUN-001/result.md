# Result: RUN-001

Status: completed
Prepared For Review: yes
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Task Status After Run: review
Task Status After Human Review: done

## Summary

RUN-001 закрив pre-`0.0.1` audit finding `H-001` на рівні runtime policy, tests і public
docs без зміни package versions і без actual npm publish.

Обрана політика: sync `toFactory()` має повертати фінальне синхронне значення. Якщо
JavaScript caller або type escape передає фабрику, що повертає `Promise` або thenable,
resolution падає typed diagnostic-friendly `SyncFactoryPromiseError` з кодом
`SAGIFIRE_IOC_SYNC_FACTORY_PROMISE`. Promise-producing factories мають використовувати
`toAsyncFactory()` і `getAsync()`.

Guard додано у single-provider і multi-provider `toFactory()` wrappers, тому поведінка
однакова для `runtime.get()`, `runtime.tryGet()`, `runtime.getAll()`, scoped resolution,
factory context resolution і `getAsync()` / `tryGetAsync()` over sync providers.

Легітимний `toValue()` для token value, який сам є `Promise`, не змінювався: `toValue()`
лишається exact value storage і повертає передане значення як є.

## Audit Finding Closure Mapping

- `H-001`: closed by code/test/docs fix.
  - Fix: `packages/ioc/src/container.ts` now throws `SyncFactoryPromiseError` when sync
    `toFactory()` returns a `Promise` or thenable.
  - Guarded paths: sync single-provider factories, sync multi-provider factories, scoped
    sync factories and async runtime APIs resolving sync providers.
  - Public API: `SyncFactoryPromiseError` is exported from root `@sagifire/ioc` and
    `@sagifire/ioc/container`.
  - Docs: root README, package README, `docs/container.md` and `docs/async-model.md`
    explicitly describe the sync factory policy and async factory alternative.
  - Rationale: this fixes the root cause from the audit while preserving the intended
    sync/async boundary and not breaking explicit `toValue(Promise)` storage.

## Changed Files

- `README.md`
- `docs/async-model.md`
- `docs/container.md`
- `packages/ioc/README.md`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/test/async-providers.test.ts`
- `packages/ioc/test/container.test.ts`
- `packages/ioc/test/diagnostics.test.ts`
- `packages/ioc/test/scope.test.ts`
- `test/package-exports.test.ts`
- `memory/state.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0066-stage-16-sync-factory-promise-guard/task.md`
- `memory/tasks/plan/TASK-07.02-0066-stage-16-sync-factory-promise-guard/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0066-stage-16-sync-factory-promise-guard/runs/RUN-001/result.md`

## Verification

Successful:

- `.\node_modules\.bin\vitest.cmd run packages/ioc/test/container.test.ts packages/ioc/test/scope.test.ts packages/ioc/test/async-providers.test.ts packages/ioc/test/diagnostics.test.ts test/package-exports.test.ts`
- `pnpm build`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm format`
- `pnpm test`
- `pnpm release:validate`

Notes:

- Focused regression run passed with 5 test files and 85 tests after rebuilding `dist`.
- Full `pnpm test` passed with 20 test files and 218 tests.
- `pnpm release:validate` passed and included build, typecheck, format, lint, tests and
  package dry-run validation.
- Package dry-run still packed publishable packages as `0.0.0`; package versions were not
  changed.
- An initial focused package export smoke run failed before `pnpm build` because package
  export tests import built `dist`; after rebuilding, the same focused command passed.

## Acceptance Criteria Check

- [x] `H-001` closure is recorded.
- [x] Runtime/docs policy is explicit.
- [x] Regression coverage exists for JavaScript/untyped-like misuse.
- [x] Relevant verification is recorded.
- [x] Package versions remain unchanged.

## Self-Review

- [x] Guard is attached to sync `toFactory()` wrappers instead of only one public
      resolution method, so runtime/scoped/multi/async-over-sync paths stay consistent.
- [x] `toValue(Promise)` behavior is preserved as required by task scope.
- [x] Error is typed, exported and diagnostic-friendly.
- [x] Tests cover Promise-returning and thenable-returning factory misuse, singleton,
      transient, scoped, multi-provider and async-over-sync paths.
- [x] Docs describe the public policy without weakening async provider boundaries.
- [x] No package versions, changelogs, npm publish workflow or credentials were changed.
- [x] `memory/sources/SPEC.md` was not edited.
- [x] General-level memory impact was checked.

## Memory Sync

- Product memory: not needed
- Domain memory: not needed
- Technical memory: not needed
- Knowledge memory: not needed
- Task memory: updated
- Wiki indexes: not needed, memory structure unchanged
- State file: updated
- General-level memory documents: checked

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-07-02
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачу."

Задачу переведено в `done` після explicit task-level human review approval.
