# Деталізований звіт: Stage 18 `0.0.3` feature portfolio

Status: completed
Type: research
Related Task: `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/task.md`
Related Run: `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/RUN-001/index.md`
Related Research: `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/RSCH-001.md`
Created: 2026-07-12

## Питання або мета

Який малий взаємопов'язаний portfolio варто рекомендувати для `@sagifire/ioc 0.0.3` із
трьох кандидатів: async multi-providers, lifetime dependency validation і graph export у
JSON, DOT та Mermaid?

Результат має розвивати власну модель Sagifire, не копіювати конкурентні API, не починати
implementation і відділяти факти від висновків та рекомендацій.

## Executive summary

Рекомендований portfolio неоднорідний:

1. **Graph export — `accept`.** Це найменший і найкраще підготовлений slice. Він має бути
   pure deterministic projection чинного `ModuleGraph`, із versioned JSON envelope як
   canonical representation та DOT/Mermaid як похідними renderers.
2. **Lifetime dependency validation — `design-first`.** Цінність висока, але чинна модель
   бачить metadata provider-ів і module edges, а не повний provider dependency graph.
   Потрібно спочатку визначити explicit dependency declarations та відрізнити resolution
   від небезпечного instance capture.
3. **Async multi-providers — `design-first`.** Це природне продовження cardinality model,
   але не малий mechanical API addition. Потрібен окремий design slice для collection
   initialization, ordering, concurrency, failure, retry, resource ownership і disposal.

Bounded `0.0.3` recommendation: реалізовувати graph export першим; async multi-providers і
lifetime validation допустити до implementation лише після окремих design gates. Якщо
design gates не закриті в межах release budget, їх треба defer без блокування graph export.

## Контекст і джерела

### Project sources

- `memory/sources/sagifire_ioc_0_0_3_market_research_uk.md` — immutable marketing input,
  не operational specification.
- Canonical product/domain/technical memory, перелічена в RUN-001 context.
- `packages/ioc/src/container.ts`, `composer.ts`, `dsl.ts`, `context.ts` — фактична public
  та internal model.
- `packages/ioc/test/*`, `packages/ioc-testing/*`, `docs/*` — behavioral evidence.

### Primary competitive sources

- InversifyJS 8.x Container API:
  <https://inversify.io/docs/api/container/>.
- Awilix strict mode і resolver options:
  <https://github.com/jeffijoe/awilix#strict-mode>,
  <https://github.com/jeffijoe/awilix#resolver-options>.
- NestJS Devtools graph overview:
  <https://docs.nestjs.com/devtools/overview>.
- JSON Schema Core 2020-12:
  <https://json-schema.org/draft/2020-12/json-schema-core>.
- Graphviz DOT grammar:
  <https://graphviz.org/doc/info/lang.html>.
- Mermaid flowchart syntax:
  <https://mermaid.js.org/syntax/flowchart.html>.

### Evidence classification

- **Fact** — прямо підтверджено project source або official primary source.
- **Inference** — висновок із чинної структури, але не реалізований contract.
- **Recommendation** — пропонований target state, що потребує human decision.

## Поточна Sagifire surface

### Факти

- `MultiBindingBuilder` має лише `toValue()` і `toFactory()`; `ContainerRuntime`, `Scope`,
  `ComposedRuntime` і `ResolutionContext` не мають `getAllAsync()`.
- Async single providers мають `toAsyncFactory()` / `toAsyncResource()`, eager/lazy mode,
  singleton/transient/scoped lifetime там, де це допустимо, in-flight deduplication,
  retry after failed lazy initialization і managed disposal.
- `ModuleGraph` уже нормалізує modules, required ports, capabilities, bindings та edges.
- `RuntimeInspection` додає public provider registration summaries без provider values.
- Inspection metadata містить provider kind, lifetime, initialization, cardinality,
  registration index та safe adapter-source metadata.
- Validation та inspection не виконують user factories.
- Provider dependency cycle detection спирається на runtime resolution stack; module graph
  edges будуються з explicit module/composer declarations.

### Висновок

Graph export може перевикористати готовий normalized graph. Інші два кандидати потребують
нової semantic information або нового resolution behavior і тому мають більший blast
radius.

## Candidate matrix

| Критерій | Async multi-providers | Lifetime validation | Graph export |
|---|---|---|---|
| User problem | Async plugin/catalog contributions не можна зібрати first-class | Long-lived provider може утримувати short-lived instance | Graph важко зберігати, diff-ити й передавати tools/agents |
| Product fit | Високий | Високий | Дуже високий |
| Architecture readiness | Низько-середня | Низька без dependency metadata | Висока |
| Semantic risk | Високий | Високий, false positives/negatives | Середній, schema/privacy stability |
| Blast radius | Container, scope, composer, DSL, testing, docs | Provider declarations, graph, validation, diagnostics, docs | Inspection/export module, exports, testing, docs |
| Compatibility | Additive API, але змінює collection lifecycle | Additive metadata/diagnostics; severity може ламати compose | Additive API/schema |
| Implementation cost | Високий | Високий після design | Середній |
| Maintenance cost | Високий | Середньо-високий | Низько-середній |
| Agent/workflow value | Середня | Висока | Дуже висока |
| Рішення | `design-first` | `design-first` | `accept` |

## Кандидат 1: async multi-providers

### User problem і fit

Multi-capabilities уже є сильним architectural contract. Async contributions потрібні для
plugin catalogs, remote metadata loaders, adapters або resources, які природно формують
ordered collection. InversifyJS підтверджує життєздатність окремого `getAllAsync()`:
official 8.x API розділяє sync `getAll()` і async `getAllAsync()` та дозволяє async і sync
bindings в async collection resolution.

Це конкурентний факт, а не причина копіювати API. Sagifire повинна зберегти власні
cardinality, immutable runtime, eager/lazy і ownership rules.

### Рекомендована semantic model для design gate

1. `getAll()` залишається строго synchronous і ніколи не запускає async contribution.
2. Async collection resolution має окремий explicit API; робоча назва `getAllAsync()` не є
   затвердженим API до design review.
3. Async collection може містити sync та async contributions у єдиному deterministic
   registration order.
4. Async eager contributions ініціалізуються під час `freeze()` / `compose()` і після
   успіху доступні sync шляхом лише якщо весь collection contract це явно дозволяє. Design
   має вирішити, чи mixed collection робить `getAll()` завжди invalid, або повертає лише
   повністю ready collection; часткове повернення заборонене.
5. Lazy contributions ініціалізуються через async collection resolution; concurrent
   resolution дедуплікується per provider, не одним opaque collection promise.
6. Результат зберігає registration order незалежно від completion order.
7. Failed lazy contribution не кешується назавжди; retry policy має бути узгоджена з
   async single provider policy.
8. Partial failure не повертає partial array. Помилка повинна містити token ID,
   registration/provider index і safe failure context.
9. Успішно створені managed resources під час failed collection resolution не можна
   автоматично dispose-ити, якщо вони singleton і вже належать runtime; transient
   resources лишаються забороненими, а scoped resources належать scope. Design мусить
   визначити rollback boundary окремо для eager freeze і lazy resolution.
10. Scope-local multi-values лишаються sync values; async scope-local factories не
    додаються цим slice.
11. Composer/module declarations не отримують другу cardinality model: async є provider
    execution kind, multi — cardinality.
12. Object API проектується першим; DSL лише компілює його без inference.

### Open questions

- Чи має `getAll()` повертати eager-ready async collection після freeze, як `get()` для
  eager async single provider, чи multi token із будь-яким async contributor завжди
  вимагає async API?
- Чи дозволяти `toAsyncResource()` для multi contributions у першому slice, чи спочатку
  лише `toAsyncFactory()`?
- Яка failure aggregate model: first failure з contribution identity чи structured
  aggregate diagnostics?
- Чи потрібне eager/lazy налаштування per contribution, і як mixed mode відображати в
  inspection?

### Architecture pressure і blast radius

Найбільший pressure — чинні sync multi loops, scope inheritance, per-provider caches,
resource disposer ordering та composer wrappers. Mechanical додавання методів створить
неузгоджені partial failure/disposal semantics. Потрібен design-first, а потім phased
container → scope → composer → testing/DSL/docs implementation.

### Docs, migration, testing і adoption

- Окремий async collection guide з truth table sync/eager/lazy/mixed.
- Migration guidance: sync `add()` не змінюється; async contributions opt-in.
- Tests: ordering vs completion order, deduplication, retry, cycles, mixed providers,
  scope ownership, disposal, partial eager failure, composer cardinality gating.
- Testing package: async append/replace override semantics не можна додавати до визначення
  production semantics.
- Adoption risk високий, якщо `getAll()` інколи повертає incomplete/ready-only subset.

### Рішення

`design-first`. Не реалізовувати до закриття наведених semantic gates.

## Кандидат 2: lifetime dependency validation

### User problem і competitive fact

Awilix strict mode показує практичну потребу: opt-in runtime check відхиляє lifetime leaks,
зокрема коли singleton/scoped registration залежить від transient non-value registration,
і має `isLeakSafe` escape hatch. Це не compile-time proof і не статичний compose graph.

Sagifire може дати сильнішу diagnostic UX, але лише якщо не називатиме кожне короткочасне
resolution небезпечним capture.

### Ключове розрізнення

`A` резолвить `B` не означає, що `A` утримує instance `B` довше за його owner lifetime.

- **Небезпечний instance capture:** singleton factory отримує scoped instance й зберігає
  його в поверненому singleton value.
- **Допустимий resolution edge:** singleton отримує stateless transient value, immutable
  value або explicit factory/handle, який створює short-lived instance пізніше в scope.
- **Невизначений edge:** generic resolver context дозволяє lookup, але metadata не описує,
  що саме утримано.

Runtime tracing lookup calls бачить resolution, але не JavaScript object retention. Отже
без explicit dependency declarations static validation неминуче має false positives або
false negatives.

### Рекомендована design direction

1. Спочатку додати explicit provider dependency metadata для object API; не аналізувати
   factory source, constructor parameters або decorators.
2. Metadata edge має відрізняти direct instance dependency від deferred provider/factory
   handle. Назви API не фіксуються цим research.
3. Lifetime order не є просто `singleton > scoped > transient`: transient resource і
   ordinary transient мають різний leak risk; value provider завжди stable; scoped
   dependency потребує active scope.
4. Static compose/freeze validation працює лише для declared edges.
5. Undeclared generic context access лишається runtime-resolved і не породжує хибної
   заяви про повне static coverage.
6. Перший severity contract має бути warning/report для incomplete metadata і error лише
   для доведеного unsafe direct capture.
7. Diagnostic details: consumer token/provider identity/lifetime, dependency token/provider
   identity/lifetime, edge mode, module/source і remediation hint.
8. Suppression/escape hatch має бути локальним, documented і inspectable; глобальне
   вимкнення знищує governance value.
9. Private providers можуть брати участь у validation, але export/inspection не повинні
   розкривати їх token IDs без окремої safe identity policy.

### Candidate unsafe matrix

| Consumer | Dependency | Direct instance capture | Default design severity |
|---|---|---|---|
| singleton | scoped | доведено unsafe | error |
| singleton | transient managed resource | потенційна втрата ownership | error після explicit ownership model |
| singleton | ordinary transient | може бути intentional immutable collaborator | warning або allowed за declaration |
| scoped | narrower child-scope instance | unsafe поза owner scope | error, якщо metadata доводить edge |
| transient | singleton | safe | none |
| singleton | value | safe | none |
| singleton | deferred scope-aware factory/handle | safe за explicit contract | none |

### Open questions

- Яка public declaration shape описує direct/deferred dependencies без DSL magic?
- Чи включати container-level providers, composer bindings і adapters в один graph schema?
- Як ідентифікувати private providers у safe diagnostics/export?
- Чи є ordinary transient capture помилкою, warning або дозволеним default?
- Коли validation запускається: builder inspection, `freeze()`, composer validate/compose?

### Architecture pressure і blast radius

Чинний `ResolutionContext` є generic service-locator-like factory context усередині explicit
provider factory. Він потрібний runtime resolution, але не дає статичного declared graph.
Спроба inference з function body порушить explicitness і non-execution rules. Тому
потрібна design task, а ймовірно окремий provider dependency-edge foundation до власне
validation.

### Docs, testing і agent workflows

- Документація повинна чесно описувати coverage boundary.
- Testing package може assert-ити declared provider edges і diagnostics.
- Coding agents отримують найбільшу користь, якщо edge metadata доступна у normalized
  export; warning без machine-readable evidence менш корисний.
- Migration має бути additive: existing factories працюють, але мають incomplete static
  coverage, доки dependency metadata не додано.

### Рішення

`design-first`. Спочатку dependency metadata та severity ADR/design, потім validation.

## Кандидат 3: graph export JSON/DOT/Mermaid

### User problem і fit

`getGraph()` та `inspect()` вже допомагають in-process. Але architecture review, CI, pull
request diff, Project Memory і coding agents потребують portable deterministic artifact.
Це прямо підсилює product positioning як inspectable composition kernel.

NestJS official Devtools docs підтверджують попит на graph visualization і serialization:
graph можна snapshot-ити, візуалізувати, export-ити як PNG, а serialized graph отримати з
core API. Primary source не підтверджує stable schema, deterministic output, diff workflow,
DOT або Mermaid; такі твердження про NestJS робити не можна.

### Нормалізована модель

`ModuleGraph` є єдиним semantic source. Export layer не збирає graph повторно, не читає
container internals і не виконує factories.

Рекомендована pipeline:

```text
ModuleGraph / safe RuntimeInspection
    -> normalize + validate safe projection
    -> GraphExportDocument v1
        -> canonical JSON
        -> DOT renderer
        -> Mermaid renderer
```

DOT і Mermaid не мають окремих graph semantics. Вони можуть втрачати частину metadata для
читабельності, але не можуть вигадувати edges або provider state.

### Versioned JSON schema

Рекомендований conceptual envelope:

```json
{
  "schema": "https://sagifire.dev/schemas/ioc/module-graph/v1",
  "schemaVersion": 1,
  "kind": "sagifire-ioc-module-graph",
  "graph": {
    "modules": [],
    "requiredPorts": [],
    "capabilities": [],
    "bindings": [],
    "edges": []
  }
}
```

Точний domain URL не затверджено; schema може спочатку постачатися package-relative.
JSON Schema 2020-12 є придатним validation format, але runtime exporter не повинен мати
обов'язкову heavy validation dependency.

Compatibility policy:

- `schemaVersion` змінюється лише при structural/semantic breaking change.
- Additive optional fields у v1 допустимі лише якщо consumers зобов'язані ignore unknown
  fields; інакше потрібна нова schema version.
- Enum expansion вважається compatibility-sensitive.
- Renderer options не входять у canonical graph schema.
- Package version і graph schema version не тотожні.

### Determinism і diffability

- Canonical ordering розрізняє semantic і non-semantic arrays. Module/contribution/provider
  registration order зберігається там, де впливає на resolution; unordered presentation
  collections стабілізуються за documented composite keys. Export не проголошує два
  graphs еквівалентними лише тому, що вони мають однаковий набір nodes/edges.
- Object keys мають deterministic serializer order.
- Pretty JSON використовує фіксований indent і newline policy.
- Generated timestamp, absolute paths, object identities та random IDs заборонені.
- DOT node IDs використовують stable escaped IDs; labels є presentation-only.
- Mermaid node IDs не дорівнюють raw token IDs, бо punctuation має syntax meaning;
  потрібне stable collision-resistant mapping.

### Safe data boundary

Дозволено:

- public module IDs/versions;
- public token IDs/descriptions, declared cardinality/kind;
- safe binding/provider kind, lifetime, initialization, registration order;
- public dependency edges і validation summary за explicit option.

Заборонено:

- provider values, resource instances, scope-local values;
- factory/class/function source або names, якщо вони не declared public metadata;
- secrets у arbitrary metadata;
- private module provider token IDs та internal registration tokens;
- stack traces, absolute filesystem paths і runtime object identities.

Чинний `InspectionMetadata.value` дозволяє primitive arbitrary metadata. Export design має
або виключити arbitrary metadata by default, або вимагати explicit opt-in redaction policy.

### Renderer semantics

- JSON — canonical lossless safe representation.
- DOT — detailed architecture visualization з clusters/modules і typed edge styles; output
  є text artifact, renderer не запускає Graphviz і не додає Node-only dependency в core.
- Mermaid — review/docs-friendly flowchart з bounded labels; output є text artifact.
- PNG/SVG rendering, filesystem write і CLI integration — окремі adapters/tooling tasks,
  не core export slice.

### Project Memory snapshot/diff workflow

1. CI або maintainer отримує `ModuleGraph` без factory execution.
2. Exporter створює canonical pretty JSON у task/review evidence location.
3. Snapshot додається лише за explicit task scope; library не пише filesystem.
4. Pull request diff показує modules/ports/capabilities/edges без timestamp noise.
5. DOT/Mermaid використовуються для human review; JSON — для agent/tool assertions.
6. Coding agent порівнює schema version, normalized arrays і edge tuples; не парсить
   renderer labels як source of truth.
7. Snapshot не стає canonical Project Memory автоматично: його provenance і disposition
   фіксуються task/run artifact policy.

### Testing

- Golden tests для stable JSON/DOT/Mermaid output.
- Repeatability tests: той самий normalized input дає byte-identical output; permutation
  tests окремо доводять, які reorderings semantic і тому навмисно змінюють output.
- Escaping tests для quotes, newlines, Unicode, Mermaid/DOT punctuation.
- Privacy tests з sentinel secrets/private provider IDs.
- Schema compatibility fixtures та parse tests.
- Cross-renderer tests: усі rendered nodes/edges походять із canonical document.
- Testing package може додати snapshot/assert helpers пізніше, але core exporter не
  залежить від testing package.

### Docs, migration і adoption

- Новий graph export guide і schema reference.
- Composer docs показують in-memory export; CLI/filesystem recipes живуть поза core.
- Migration відсутня: API additive, `getGraph()` лишається usable.
- Adoption value висока для CI, architecture reviews, debugging, docs і coding agents.

### Рішення

`accept`, із schema/design gate всередині першої implementation task та privacy tests як
release blocker.

## Bounded portfolio і sequencing

### Phase A — graph export foundation

- Зафіксувати `GraphExportDocument v1` і safe projection.
- Реалізувати deterministic JSON serializer.
- Додати DOT/Mermaid pure text renderers.
- Додати package exports, tests і schema/docs.

### Phase B — lifetime dependency metadata design

- Спроєктувати provider dependency declaration model.
- Визначити direct/deferred/ownership edges і severity matrix.
- Підготувати implementation decomposition; не змішувати з Phase A.

### Phase C — async multi-provider design

- Зафіксувати resolution truth table, failure/retry/disposal rules і inspection changes.
- Розкласти container, scope, composer, testing/DSL/docs implementation.

### Release gate

`0.0.3` не повинна автоматично чекати Phase B/C implementation. Мінімальний coherent
release slice — Phase A. B/C входять лише якщо design review завершено і implementation
budget лишається bounded.

## Explicit deferred/rejected scope

Deferred:

- async multi resources до окремого ownership decision;
- static lifetime errors для undeclared generic factory dependencies;
- graph CLI, filesystem writes, PNG/SVG rendering і hosted viewer;
- automatic Project Memory mutation або snapshot commits;
- provider-level private graph export без privacy design.

Rejected для `0.0.3`:

- implicit async behavior у `getAll()`;
- partial arrays після failed async collection resolution;
- factory execution/source parsing для dependency inference;
- друга graph model для each renderer;
- timestamps/random IDs у canonical export;
- Node-only Graphviz/Mermaid runtime dependency у core.

## Follow-up proposals

Це proposals, а не автоматично створені tasks:

1. Graph export v1 schema and safe projection design/implementation.
2. Deterministic JSON/DOT/Mermaid renderers and compatibility fixtures.
3. Graph export docs, Project Memory workflow example and testing helpers.
4. Provider dependency metadata design for lifetime analysis.
5. Lifetime severity/diagnostic semantics and incremental implementation plan.
6. Async multi-provider semantic design.
7. Async multi-provider phased implementation after design approval.
8. Final `0.0.3` audit, stabilization and release handoff only after accepted slices.

## Cost/benefit summary

- Graph export: medium implementation cost, high differentiated value, bounded maintenance.
- Lifetime validation: high design/implementation cost, high safety value, high risk of
  misleading diagnostics without metadata.
- Async multi: high implementation/maintenance cost, meaningful completeness value, але
  нижча immediate differentiation ніж graph workflow.

## Risks and mitigations

- **Schema becomes accidental unstable public API.** Version separately, publish schema,
  keep fixtures and compatibility policy.
- **Privacy leak.** Export only a safe projection; sentinel tests; arbitrary metadata
  excluded by default.
- **False lifetime claims.** State coverage explicitly; require declared edges; separate
  warnings from proven errors.
- **Async lifecycle corruption.** Design-first with truth tables and ownership tests.
- **Portfolio inflation.** Phase A is sufficient release slice; B/C cannot bypass gates.

## Project Memory impact dispositions

| Document | Disposition | Rationale |
|---|---|---|
| `memory/state.md` | included | Stage 18 becomes current reviewed research focus |
| `memory/product/requirements.md` | included | Add accepted Stage 18 decision-gate requirement and candidate statuses |
| `memory/product/roadmap.md` | included | Record Stage 18 and phased recommendation |
| `memory/technical/architecture.md` | included | Add target export projection and design-first constraints |
| `memory/technical/rules.md` | included | Add Stage 18 guardrails; no implementation claim |
| `memory/technical/specification-trace.md` | included | Trace human directive and immutable source |
| `memory/domain/open-questions.md` | included | Preserve unresolved async/lifetime design gates |
| `memory/product/index.md` | not-needed | No child/file structure changes |
| `memory/domain/index.md` | not-needed | No child/file structure changes |
| `memory/technical/index.md` | not-needed | No child/file structure changes |
| `memory/index.md` | not-needed | No structural change |

Exact proposed canonical edits are isolated in task-local `FIX-*` packages and are not
applied by this research run.

## Висновок

Сильний `0.0.3` portfolio — не максимальна кількість API. Graph export прямо перетворює
вже наявну inspectable architecture на portable contract для людей, CI і coding agents.
Lifetime validation та async multi-provider мають високий fit, але обидва потребують
чесного design-first gate, бо їхня складність лежить у semantics та ownership, а не у
назвах методів.
