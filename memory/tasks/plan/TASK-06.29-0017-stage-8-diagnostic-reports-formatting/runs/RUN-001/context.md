# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.29-0017-stage-8-diagnostic-reports-formatting/task.md`
- `memory/tasks/plan/TASK-06.29-0017-stage-8-diagnostic-reports-formatting/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/task.md`
- `memory/tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Stage 8 diagnostics should make failures readable and actionable for humans and Codex.
Reports and formatting are the user-facing presentation layer over the typed errors from
`TASK-06.29-0016`.

## Relevant Domain Context

- Diagnostic - structured error or report that explains validation or runtime failure with
  actionable details.
- Diagnostic reports should preserve codes, severity, message and useful details.
- Formatting should make token IDs and dependency paths easy to read.

## Relevant Technical Context

- `TASK-06.29-0016` owns `SagifireIocError` and typed error migration.
- This task owns report interfaces and formatting.
- `formatDiagnostics()` should work in Node, browser, Edge-compatible and Workers-like
  runtimes.
- No composer/module graph exists yet; graph-aware module reports start in Stage 9+.
- Details rendering should be stable but not a general-purpose object serializer.

## Relevant Knowledge Packages

Немає обов'язкових reusable knowledge packages. Якщо під час implementation виникне
процесний конфлікт, перевірити `memory/knowledge/package-index.md`.

## Files / Modules to Inspect

- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/test/*`
- `test/package-exports.test.ts`
- `memory/tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/runs/RUN-001/result.md`
- Existing README/docs only if public diagnostics API text becomes misleading.

## Known Risks

- Build formatter around assumptions that do not match the actual `SagifireIocError`
  implementation from `TASK-06.29-0016`.
- Overbuild formatting into a terminal/markdown renderer instead of plain deterministic
  text.
- Use Node-only formatting helpers.
- Produce unreadable details for token paths or provider kind mismatches.
- Expose private provider values or runtime internals.
- Add composer/module graph diagnostics before composer exists.
- Make formatter output unstable, causing brittle tests and poor Codex usability.

## Assumptions

- `TASK-06.29-0016` has been completed and approved before this task starts.
- If `TASK-06.29-0016` changed the public API baseline, this task should follow its
  approved result and document any adaptation.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
