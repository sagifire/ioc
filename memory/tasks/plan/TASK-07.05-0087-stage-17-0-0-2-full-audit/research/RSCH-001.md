# Дослідження: RSCH-001

Статус: review-ready
Створено: 2026-07-05
Оновлено: 2026-07-05
Роль агента: Audit Agent
Режим виконання: autonomous-research
Task Status After Research: review
Task Status After Human Review: done
Мова звіту: українська

## Дослідницьке питання

Чи готовий проект після Stage 17 implementation/docs phases до `0.0.2` stabilization
handoff, якщо перевірити public API, implementation decisions з `FIX-001`, tests,
type tests, docs, examples, diagnostics і package exports.

## Обсяг

Перевірено:

- `@sagifire/ioc`, `@sagifire/ioc-testing`, `@sagifire/ioc-next`;
- accepted decisions з
  `TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`;
- Stage 17 phases 1-7;
- source code, tests, package manifests, package exports, docs and examples;
- adapter-aware cycle detection before release handoff;
- локальні quality gates and package dry-run.

Не виконувалось:

- fixing audit findings;
- package version/changelog changes;
- actual npm publish;
- редагування historical source snapshots.

## Джерела

- `memory/tasks/plan/TASK-07.05-0087-stage-17-0-0-2-full-audit/task.md`
- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/technical/rules.md`
- `memory/technical/definition-of-done.md`
- `packages/ioc/src/*`
- `packages/ioc-testing/src/index.ts`
- `packages/ioc-next/src/index.ts`
- `packages/*/test/*`
- `test/package-exports.test.ts`
- `test/package-boundaries.test.ts`
- `README.md`, `docs/`, `packages/*/README.md`, `examples/`
- `scripts/pack-dry-run.mjs`

## Висновок

Core implementation для `0.0.2` загалом відповідає accepted decisions: cardinality model,
runtime gating, graph-aware adapters, adapter-source cycle diagnostics, child scopes,
testing helpers, token helpers and DSL ergonomics реалізовані й покриті tests.

Знайдено один `high` release blocker: `examples/next-app-router` компілюється, але direct
Node run, який описаний у README прикладу, падає через stale single/multi cardinality
declaration для `REQUEST_TAGS`.

Критичних знахідок немає. Є один `low` test coverage gap для packed/export smoke coverage
нових `0.0.2` entrypoints.

## Покриття Stage 17 phases

### Phase 1: multi-capability declaration foundation

Статус: covered, blocking issues not found.

Підтверджено:

- `ModuleCardinality = 'single' | 'multi'` є в `packages/ioc/src/composer.ts`.
- `provides` and `requires` мають `cardinality`, default is `single`.
- Validation reports:
  - `SAGIFIRE_IOC_DUPLICATE_SINGLE_CAPABILITY`;
  - `SAGIFIRE_IOC_CAPABILITY_CARDINALITY_CONFLICT`;
  - `SAGIFIRE_IOC_CAPABILITY_REGISTRATION_CARDINALITY_MISMATCH`.
- Tests cover invalid cardinality, duplicate single capabilities, single/multi conflicts,
  registration mismatch and required multi missing behavior.

### Phase 2: multi-capability runtime and inspection

Статус: covered, blocking issues not found.

Підтверджено:

- Composed runtime rejects `get()` for public multi capabilities with
  `SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN`.
- Composed runtime rejects `getAll()` for public single capabilities with
  `SAGIFIRE_IOC_GET_ALL_USED_FOR_SINGLE_TOKEN`.
- Optional missing multi dependencies resolve to `[]` inside valid provider code.
- `composer.add()` composition-root multi contributions append after module contributions.
- `runtime.inspect().providerRegistrations` exposes actual exported provider registrations
  without private values.

### Phase 3: graph-aware adapters

Статус: covered, blocking issues not found.

Підтверджено:

- Object API supports `composer.adapt(target).from(source).using(factory)`.
- `using()` receives only declared source value/object, not `{ get }` or generic resolver
  context.
- Adapter validation covers missing, private, multi-cardinality and invalid-target sources.
- Adapter factories are not executed during validation or graph inspection.
- Adapter-source edges are visible in `graph.edges`.
- Adapter-aware cycle detection participates in `SAGIFIRE_IOC_MODULE_CYCLE` when the source
  provider is a single module public capability.
- Binding edges and composition-root adapter sources do not create module-to-module cycle
  traversal by themselves.

### Phase 4: child / derived scopes

Статус: covered, blocking issues not found.

Підтверджено:

- Child scopes inherit parent scope-local single values.
- Child single values shadow inherited parent values.
- Child scope-local multi values append after runtime multi providers and inherited parent
  multi values.
- Child scope creation rejects inherited single/multi kind conflicts.
- Child scoped provider cache is separate from parent cache.
- Child disposal does not dispose parent; parent disposal disposes active children in reverse
  creation order and continues through disposer failures.

### Phase 5: testing and API ergonomics

Статус: covered, non-blocking export-smoke gap recorded as `L-001`.

Підтверджено:

- `@sagifire/ioc-testing` exposes multi capability assertions, adapter-source edge
  assertions, `multiOverride()`, fake module multi providers and child scope assertions.
- `multiToken()` / `contributionToken()` are additive type-level helper markers over normal
  token identity.
- Ordinary `token()` remains usable for multi capability declarations.
- DSL exposes `add(token)` and graph-aware `adapter(target).from(source).using(factory)`.
- Compatibility `adapt(token, factory)` remains a factory-binding helper and does not infer
  adapter-source graph edges.

### Phase 6: documentation and examples

Статус: mostly covered, `H-001` blocks release handoff.

Підтверджено:

- README and deep docs describe implemented `0.0.2` public behavior: cardinality,
  `composer.add()`, graph-aware adapters, explicit `adapt()` compatibility path, child
  scopes, testing helpers and token helpers.
- `examples/basic-node`, `examples/module-composition`, `examples/async-db-resource` and
  `examples/testing-overrides` compile and run.
- `examples/next-app-router` compiles but runtime execution fails; see `H-001`.

### Phase 7: full audit and stabilization

Статус: audit complete, handoff should close `H-001`.

Підтверджено:

- `pnpm release:validate` passes.
- Package dry-run and packed runtime/type smoke checks pass.
- Package manifests remain at `0.0.1`, which is expected before a separate stabilization
  handoff/versioning decision. This audit did not change versions or changelogs.

## Findings

### Critical

No critical findings.

### High

#### H-001: `examples/next-app-router` runtime fails under finalized `0.0.2` cardinality validation

Severity: `high`
Release blocker: yes

Affected files:

- `examples/next-app-router/src/contact-requests.ts`
- `examples/next-app-router/README.md`
- indirectly `docs/next-integration.md` as reference context for request multi values

Evidence:

- `examples/next-app-router/src/contact-requests.ts` defines
  `REQUEST_TAGS = examplesNext.token<string>('request-tags')`.
- The same module declares `REQUEST_TAGS` in `provides` without `cardinality: 'multi'`,
  so it defaults to `single`.
- `requestContextModule.setup()` registers `REQUEST_TAGS` through
  `context.add(REQUEST_TAGS).toValue('runtime:next-app-router')`.
- `contactRequestsModule.requires` declares `REQUEST_TAGS` without `cardinality: 'multi'`,
  while provider code resolves it through `resolutionContext.getAll(REQUEST_TAGS)`.
- Command result:
  - `.\node_modules\.bin\tsc.cmd -p examples/next-app-router/tsconfig.run.json --pretty false`
    passed.
  - `node .tmp/examples/next-app-router/src/main.js` failed with
    `SAGIFIRE_IOC_CAPABILITY_REGISTRATION_CARDINALITY_MISMATCH`.
- Error message:
  - `Module "examples-next-request-context" declares capability "examples.next.request-tags" as single but registered it with multi provider API`.

Impact:

- The example README documents `node .tmp/examples/next-app-router/src/main.js` as a
  successful run command, but the command currently throws.
- This is exactly the kind of stale docs/example behavior Stage 17 Phase 6 was meant to
  eliminate.
- The failure proves `0.0.2` cardinality validation is working, but the example has not been
  fully migrated to the implemented public API.

Recommended stabilization scope:

- Update `REQUEST_TAGS` declaration to explicit multi semantics. Conservative fix:
  - use `examplesNext.multiToken<string>('request-tags')` or keep `token()` and add explicit
    `cardinality: 'multi'`;
  - set `provides` entry for `REQUEST_TAGS` to `cardinality: 'multi'`;
  - set `requires` entry for `REQUEST_TAGS` to `cardinality: 'multi'`;
  - keep `context.add()` and `nextRequestMultiValue()` usage.
- Add or extend automated example coverage so this direct run cannot regress silently.
- Rerun:
  - `pnpm release:validate`;
  - `.\node_modules\.bin\tsc.cmd -p examples/next-app-router/tsconfig.run.json --pretty false`;
  - `node .tmp/examples/next-app-router/src/main.js`.

### Medium

No medium findings.

### Low

#### L-001: packed/export smoke checks do not explicitly exercise new `0.0.2` public helpers

Severity: `low`
Release blocker: no

Affected files:

- `test/package-exports.test.ts`
- `scripts/pack-dry-run.mjs`

Evidence:

- `pnpm release:validate` and `pnpm pack:dry-run` passed.
- Existing package export tests and packed smoke checks import many root/subpath APIs, but
  the packed smoke path does not explicitly import and execute the new Stage 17 helpers:
  - `multiToken()`;
  - `contributionToken()`;
  - DSL `add()`;
  - DSL `adapter()`;
  - new `0.0.2` cardinality/adapter error exports.
- Unit tests cover those helpers through source path aliases, and package manifests export
  the relevant subpaths, so this is a coverage gap rather than a known runtime failure.

Impact:

- A future packaging/export regression in new `0.0.2` helpers could pass the tarball smoke
  project while failing for consumers.

Recommended stabilization scope:

- Extend `test/package-exports.test.ts` and/or `scripts/pack-dry-run.mjs` smoke sources to
  import and minimally use the new Stage 17 public helpers from packed artifacts.

## Release blockers

Blocking before `TASK-07.05-0088` can complete release handoff:

- `H-001` must be fixed, reclassified with rationale or split into an explicit blocking
  follow-up task.

Not classified as blockers in this audit:

- `L-001` is recommended hardening, not a release blocker.
- Package manifests and package changelogs still show `0.0.1`; this is expected before
  `TASK-07.05-0088` decides and applies accepted release/versioning scope. It remains a
  handoff prerequisite for any actual `0.0.2` publish, not a code/runtime defect found by
  this audit.

## Validation commands

Successful:

- `pnpm build`
- `pnpm typecheck`
- `pnpm format`
- `pnpm lint`
- `pnpm test:unit`
  - 21 test files passed.
  - 266 tests passed.
- `pnpm pack:dry-run`
- `pnpm release:validate`
- `.\node_modules\.bin\tsc.cmd -p examples/basic-node/tsconfig.run.json --pretty false`
- `.\node_modules\.bin\tsc.cmd -p examples/module-composition/tsconfig.run.json --pretty false`
- `.\node_modules\.bin\tsc.cmd -p examples/async-db-resource/tsconfig.run.json --pretty false`
- `.\node_modules\.bin\tsc.cmd -p examples/testing-overrides/tsconfig.run.json --pretty false`
- `.\node_modules\.bin\tsc.cmd -p examples/next-app-router/tsconfig.run.json --pretty false`
- `node .tmp/examples/basic-node/main.js`
- `node .tmp/examples/module-composition/main.js`
- `node .tmp/examples/async-db-resource/main.js`
- `node .tmp/examples/testing-overrides/main.js`

Failed or constrained:

- `pnpm exec tsc -p examples/*/tsconfig.run.json --pretty false` failed in this local
  PowerShell environment with `'tsc' is not recognized`; direct local
  `.\node_modules\.bin\tsc.cmd` succeeded.
- `node .tmp/examples/next-app-router/src/main.js` failed with `H-001`.
- Plain `git status --short` is blocked by local Git safe-directory ownership; read-only
  `git -c safe.directory='D:/work/ioc' status --short` was used.

## Memory fixation proposal

Status: not-needed
Related Fixation: n/a
General-Level Memory Impact: updated

This research task does not need a separate fixation package. The audit result is an
execution artifact and the task/status memory is updated directly as required by the
research workflow.

## Memory sync

- Product memory: not needed.
- Domain memory: not needed.
- Technical memory: not needed.
- Knowledge memory: not needed.
- Task memory: updated.
- Wiki indexes: updated for new `research/`.
- `memory/tasks/plan/progress.md`: updated.
- `memory/state.md`: updated.
- General-level memory documents: checked.
- Follow-up task: existing `TASK-07.05-0088` should close or reclassify `H-001`.

## Agent self-review

- [x] Research question відповідає task scope.
- [x] Audit covers all `0.0.2` phases from `FIX-001`.
- [x] Public API consistency across all three packages checked.
- [x] Accepted decisions from `FIX-001` verified against source/tests/docs/examples.
- [x] Findings classified by severity.
- [x] Release blockers identified.
- [x] Code/runtime/package source changes were not performed during audit.
- [x] Quality gates and examples verification recorded.
- [x] General-level memory impact checked.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat / System Engineer Hat
Reviewed: 2026-07-05
Approval Scope: research-report-only
Approval Source: user message: "Я зробив ревю. ... Поточну задачу можеш завершувати."

## Follow-up

- Start `TASK-07.05-0088-stage-17-0-0-2-stabilization-handoff`.
- In that task, close `H-001` before final `0.0.2` stabilization handoff.
- In that task, close or explicitly defer `L-001` as lightweight package export smoke
  hardening.
