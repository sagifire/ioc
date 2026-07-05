# Research: RSCH-001

Статус: complete
Створено: 2026-07-04
Agent Role: Research Agent
Task: `TASK-07.04-0071-stage-17-feature-request-audit`

## Призначення

Оцінити feature request для `@sagifire/ioc` `0.0.2` перед implementation planning.
Дослідження має визначити:

- які пропозиції відповідають current Project Memory і codebase state;
- які пропозиції мають architectural risks;
- які пропозиції мають logical conflicts або mismatch з existing functionality;
- як розкласти potential implementation на малі reviewable tasks.

Research не змінює code, runtime behavior, package exports або source snapshots.

## Джерело

Attached feature request:

```text
memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md
```

Source file є imported source snapshot для Stage 17. Його не треба редагувати в межах audit.

## Executive conclusion

Feature request містить цінні implementation candidates, але також має semantic conflicts
з current API. Рекомендація: не приймати scope wholesale. Треба розкласти роботу на
послідовні tasks і почати з найменших public contracts.

Найбільш перспективні напрями:

- first-class multi-capability semantics на composer level;
- explicit graph-aware adapter source declarations;
- child/derived scopes після рішення щодо lifecycle ownership;
- diagnostics/inspection improvements для нових graph concepts;
- testing helpers, які працюють тільки через public inspection і explicit overrides;
- documentation/examples після стабілізації object API.

Найважливіші ризики:

- `requires.kind` у source examples конфліктує з current `ModuleDependencyKind`;
- diagnostic codes у source examples не відповідають namespace `SAGIFIRE_IOC_*`;
- multi-capability model зачіпає core composer invariants;
- graph-aware adapters потребують precise edge model;
- child scope disposal policy не очевидна;
- `MultiToken` / `ContributionToken` може ускладнити API before semantics are stable.

## Що відповідає current architecture

### Multi-capability semantics

Project already supports container-level multi-provider collections через `add()` і
`getAll()`. Feature request розширює цю ідею до semantics public capabilities на рівні
composer.
Це відповідає product value: explicit modular composition, inspectable graph metadata і
diagnostic-friendly detection для mismatch cases.

Прийнятний напрям: додати cardinality metadata для capabilities і required ports, а потім
дозволити кільком provider modules робити contribution до одного public capability token.

### Graph-aware adapters

Current DSL `adapt()` дозволяє створити factory binding, але не записує source capabilities
у graph metadata. Feature request правильно вимагає explicit adapter source declarations,
щоб adapter dependencies були видимими без execution factories.

Прийнятний напрям: спочатку додати object API, а DSL expansion робити later або additively.

### Child scopes

Current scopes already model explicit request/operation context. Child scopes для
transaction, preview, impersonation або tenant overlay можуть бути natural extension, якщо
core лишається domain-agnostic і не створює hidden service locator на AsyncLocalStorage.

Прийнятний напрям: спочатку вирішити parent/child disposal policy, потім реалізовувати
`createChildScope()` / `withChildScope()`.

### Diagnostics and inspection

Project already treats diagnostics and graph assertions як first-class product value. New
graph concepts мають бути observable через public inspection і typed diagnostics.

Прийнятний напрям: додати structured details для cardinality, contributors,
adapter-source edges і child scope lifecycle failures.

## Logical conflicts

### LC-001: `requires.kind` конфліктує з current dependency kind

Current model:

- `ModuleDependencyDefinition.kind` є dependency kind: `external | shared`.
- `ModuleCapabilityDefinition.kind` є capability kind: `public-api`, а related current
  values відокремлені від dependency kind.

Feature request examples використовують `requires.kind` для single/multi cardinality. Це
конфліктує з existing semantics і може зламати backward compatibility.

Рекомендація:

- лишити `requires.kind` як dependency kind;
- додати окреме `cardinality`, `mode` або equivalent field для single/multi semantics;
- перевірити, чи `ModuleDependencyKind` still useful до розширення його meaning.

### LC-002: Diagnostic code namespace mismatch

Current convention uses:

```text
SAGIFIRE_IOC_<AREA>_<REASON>
```

Feature request пропонує codes like `IOC_*`. Це треба змінити before implementation.

Рекомендація:

- preserve `SAGIFIRE_IOC_*`;
- map any new codes into existing diagnostic namespace;
- уникати short aliases у public API.

### LC-003: Multi-provider support не дорівнює composer capability support

Current system already has container-level `add()` / `getAll()` and public capability
gating. Missing piece не в тому, що "multi providers exist"; missing piece - composer-level
cardinality semantics і contributor semantics.

Required additions:

- cardinality для capability declaration;
- cardinality для required port;
- multiple module contributors for one capability token;
- deterministic contributor order;
- duplicate single-capability validation;
- mixed cardinality validation;
- contributor module IDs in inspection;
- post-setup validation для `bind()` / `add()` mismatch.

Рекомендація: описувати Stage 17 як first-class composer-level multi-capability semantics,
а не як generic multi-provider support.

### LC-004: Existing `adapt()` DSL name не є graph-aware

Current DSL `adapt()` повертає normal factory binding declaration і не записує source
capabilities. New fluent API може виглядати так:

```ts
composer.adapt(TARGET).from(SOURCE).using(factory)
```

Це може бути compatible if implemented additively, але створює naming collision risk у docs
і developer expectations.

Рекомендація:

- спершу додати object API, likely on `Composer`;
- зберегти existing DSL `adapt(token, factory)`;
- додати new DSL overload/helper тільки після stabilization object API semantics;
- чітко задокументувати migration path.

### LC-005: Source premise about `0.0.1` release не підтверджений locally

Feature request assumes, що `@sagifire/ioc 0.0.1` stabilized and released. Local Project
Memory каже, що versions fixed at `0.0.1`, але actual npm publish лишається pending і
потребує explicit approval і external settings.

Рекомендація:

- розглядати Stage 17 як allowed after local stabilization handoff;
- не стверджувати npm-released state без external confirmation;
- створити separate release-status verification task, якщо `0.0.2` depends on real npm
  release baseline.

## Risks

### R-001: Monolithic `0.0.2` scope занадто широкий

Request touches module metadata types, composer validation, post-setup validation, composed
runtime gating, graph edge model, cycle detection, diagnostics, DSL, scope lifecycle,
testing helpers and docs/examples.

Рекомендація: розкласти scope на sequential tasks із малими public contracts і validation
після кожного step.

### R-002: Multi-capability cardinality впливає на core composer invariants

Поточна duplicate capability validation припускає один provider module на provided token.
Multi-capabilities навмисно ламають це припущення. New model має зберегти:

- duplicate single-capability errors;
- deterministic contributor order;
- module isolation;
- private provider hiding;
- required-port validation;
- runtime `get()` / `getAll()` mismatch errors.

Рекомендація: почати з metadata і static validation до runtime exposure changes.

### R-003: Adapter-aware cycles потребують precise graph model

Stage 10 cycle detection зараз працює над capability dependency edges. Binding edges не
створюють module-level cycles. Adapter source edges додають new relation:

```text
consumer required port -> adapter binding -> source capability provider module
```

Без precise semantics real adapter cycles можуть бути missed, а valid composition-root
adaptations можуть бути over-rejected.

Рекомендація:

- визначити adapter edge semantics окремо від provider execution;
- реалізувати missing source validation перед adapter cycle validation;
- зробити adapter cycle diagnostics dedicated task або explicit non-goal для першої adapter
  source task.

### R-004: Child scope disposal потребує ownership policy

Feature request пропонує два options: auto-dispose active children on parent dispose або
відхиляти parent disposal, якщо children active. Безпечніший варіант не очевидний.
Auto-dispose reduces leaks, але requires parent to track children. Reject-parent-disposal
keeps lifecycle explicit, але може make route/action cleanup brittle.

Рекомендація:

- вирішити parent/child disposal policy before implementation;
- тримати child registry local to parent scope, а не в global runtime state;
- ретельно тестувати async failure paths і resource disposal order.

### R-005: `MultiToken` nominal typing може overcomplicate API

Separate `MultiToken<T>` type can help TypeScript, але runtime identity лишається token ID,
а JavaScript callers не отримують compile-time protection. Це також створює overload
pressure для `bind()`, `add()`, `get()`, `getAll()`, scope APIs, module APIs і testing
helpers.

Рекомендація:

- відкласти helper до stabilization core cardinality semantics;
- лишити його additive, якщо він буде implemented;
- не робити ordinary `token()` unusable для multi-capability use cases.

### R-006: Testing helpers не повинні залежати від private graph internals

Proposed assertion and override helpers корисні, але вони мають читати тільки public
inspection metadata і застосовувати overrides до compose/freeze.

Рекомендація:

- додавати testing helpers тільки після stabilization public `ModuleGraph` /
  `RuntimeInspection` fields;
- уникати hidden execution або private provider access у assertions.

## Рекомендована decomposition Stage 17

1. Multi-capability metadata model: додати cardinality до capability/required-port metadata
   без runtime behavior changes поза static validation.
2. Validation multi-capability і composed runtime: підтримати multiple contributor modules,
   deterministic order, public `getAll()` semantics і post-setup registration mismatch
   validation.
3. Multi-capability inspection: expose contributors, cardinality і satisfaction state у
   public inspection.
4. Graph-aware adapter object API: додати explicit source declarations і
   missing/source/private/cardinality validation без factory execution.
5. Graph adapter sources і cycle diagnostics: додати `adapter-source` edges і вирішити, чи
   реалізовувати adapter-aware cycles.
6. Child/derived scopes: додати `createChildScope()` / `withChildScope()` після рішення
   щодо parent/child disposal policy.
7. Testing helpers: додати multi-capability, adapter-source і child-scope helpers on public
   inspection surfaces.
8. DSL/docs/examples hardening: розширювати DSL тільки після stabilization object API; після
   цього оновити docs and examples.

`MultiToken` / `ContributionToken` має бути окремою task after tasks 1-3, якщо human
review не вирішить, що type-level ergonomics має входити в first implementation slice.

## Suggested guardrails

- Не реалізовувати весь feature request як одну велику task.
- Не додавати domain-specific admin, permission, settings, transaction, health check,
  sitemap або Next.js business APIs у core.
- Не додавати async multi-provider support, якщо task explicitly не приймає `getAllAsync()`
  і `fromAll()`.
- Не дозволяти composer validation виконувати user factories.
- Не робити graph-aware adapter API єдиним binding path; зберегти low-level bindings.
- Не expose module-private providers через adapter source validation.
- Не мутувати frozen runtime/composed runtime у testing helpers.
- Зберегти `get()` як always synchronous.
- Зберегти parity object-configuration API з DSL.

## Acceptance check

- [x] Audit відповідає на чотири requested dimensions.
- [x] Feature proposals оцінені against canonical Project Memory і current code.
- [x] Major logical conflicts identified.
- [x] Recommended changes зберігають architecture boundaries.
- [x] Code/runtime/package changes не виконувалися.
- [x] Follow-up implementation розкладений на частини, а не monolithic.
- [x] Memory impact checked.

## Memory impact

- Product memory: updated by Stage 17 planning fixation.
- Domain memory: reusable terminology package не був потрібен.
- Technical memory: updated by Stage 17 planning fixation.
- Knowledge memory: not needed.
- Task memory: research result recorded in `TASK-07.04-0071`.
- General-level memory documents: checked.

## Human review

Task completed після explicit human review approval на рівні задачі.
