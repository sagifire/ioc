# TASK-07.13-0101: [EXTREME AGENT COMPLEXITY] Stage 18 async multi core factory resolution

Task Status: backlog
Type: implementation
Created: 2026-07-13
Agent Complexity: extreme
Owner Role: Implementation Agent
Current Run: RUN-001

## Поточний стан

Run Status: prepared
Progress: Task package prepared; predecessor pending.
Acceptance: 0/12
Blockers: TASK-0100 and TASK-0107 must be done
Blocked Phase: activation
Pending Decisions: exact public async collection accessor name, signatures and overloads
Next Action: Активувати лише після human-approved completion TASK-0100 і TASK-0107.

## Мета

Додати core object API async factory contributions і explicit async collection resolution
на approved identity/cycle foundation, зберігши sync `getAll()` contract і per-provider lifecycle.

## Попередники

- [TASK-0100](../TASK-07.13-0100-stage-18-extreme-agent-complexity-async-multi-identity-cycle-foundation/task.md)
  має бути `done` після human review.
- [TASK-0107](../TASK-07.13-0107-stage-18-extreme-agent-complexity-lifetime-static-validation-coverage-diagnostics/task.md)
  має бути `done` після human review; його metadata/edge validation contract є input.

## Вимоги

- Спроєктувати, задокументувати й review-нути exact public accessor name/signatures.
- Додати object API async factory contributions до core `add()`.
- Провести accessor через container runtime, `Scope` і `ResolutionContext`.
- Зберегти sync `getAll()` із lifecycle/cardinality/local-kind → scope → sync eligibility precedence.
- Ініціалізувати eager singleton async multi contributions під час `freeze()`.
- Резолвити sequential fail-fast у per-token contribution order.
- Повертати fresh full array або rejection без partial array/collection cache.
- Зберегти singleton/scoped cache, in-flight deduplication, retry та transient reexecution per provider.
- Повернути resolved fresh `[]` для valid missing multi collection.
- Використати approved collection/provider frames і typed private-safe diagnostics.
- Провести dependency options через async factory contributions із one-to-one parity
  normalized provider edges, coverage та invalid-metadata gates із TASK-0106/0107.
- Додати compile/type tests та behavioral truth-table tests.

## Обсяг

- Core container builder/runtime, scope і resolution context object API.
- Async factory lifetime/initialization options, eager multi freeze і typed errors.
- Sync preflight, sequential resolution, retry/concurrency і cycle tests.
- Public core exports, якщо вони прямо потрібні погодженому accessor contract.

## Поза обсягом

- Async multi resources та resource ownership/disposal.
- Composer/module/composed runtime integration.
- `@sagifire/ioc-testing`, DSL, docs/examples окрім minimal API contract notes.
- Parallel/configurable collection scheduler або aggregate errors.

## Критерії приймання

- [ ] Exact accessor name/signatures/overloads мають explicit review decision і type contract.
- [ ] Core `add()` підтримує async factory contributions з approved lifetime/initialization options.
- [ ] Container runtime, Scope і ResolutionContext expose one consistent async collection operation.
- [ ] Sync `getAll()` eligibility precedence виконується до earlier transient contribution execution.
- [ ] Eager singleton async multi contributions init-яться під час freeze і sync-readable після нього.
- [ ] Explicit async resolution sequential fail-fast у per-token order і не запускає later contributions after failure.
- [ ] Caller отримує fresh full array або rejection; partial array і collection cache відсутні.
- [ ] Singleton/scoped in-flight, cache reset/reuse і transient retry лишаються per-provider.
- [ ] Missing valid multi повертає fresh resolved empty array; single/multi mismatch typed.
- [ ] Cycle/private-safe diagnostics reuse TASK-0100 foundation і preserve/sanitize cause correctly.
- [ ] Compile/type, truth-table, focused і full core quality gates passed.
- [ ] Resources, composer, DSL/testing helpers і parallel scheduler не реалізовані; independent audit passed.

## Пов'язана пам'ять

- [Approved TASK-0098](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/task.md)
- [TASK-0098 result](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/RUN-001/result.md)
- [Detailed design report](../../../reports/research/2026-07-12-stage-18-async-multi-provider-semantics-design.md)
- [TASK-0098 FIX-001](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-001.md)
- [TASK-0098 FIX-002](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-002.md)
- [Predecessor TASK-0100](../TASK-07.13-0100-stage-18-extreme-agent-complexity-async-multi-identity-cycle-foundation/task.md)
- [Predecessor TASK-0107](../TASK-07.13-0107-stage-18-extreme-agent-complexity-lifetime-static-validation-coverage-diagnostics/task.md)
- [Approved lifetime implementation report](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Core async multi factory resolution.

## Дослідження

- API naming/signature decision фіксується в run result; formal research лише за потреби.

## Фіксації

- Не очікуються; canonical зміни потребують окремого approved `FIX-*`.

## Запити на рішення

- Exact public accessor contract має бути explicitly reviewed у межах task до human review.

## Human Review

Status: not-requested
Requested: n/a
Reviewed: n/a
Approval Source: n/a

## Фінальний результат

Completed: pending
Final Run: pending
Summary: pending
Residual Risks: pending
