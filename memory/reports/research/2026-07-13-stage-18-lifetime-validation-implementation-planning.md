# Деталізований звіт: Stage 18 lifetime validation implementation planning

Status: completed
Type: implementation planning research
Related Task: `memory/tasks/plan/TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md`
Related Run: `memory/tasks/plan/TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/index.md`
Related Research: `memory/tasks/plan/TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RSCH-001.md`
Created: 2026-07-13

## Мета

Перетворити approved lifetime dependency validation design із `TASK-0097` на bounded
implementation backlog, узгоджений із фактичним кодом і вже підготовленим async
multi-provider backlog `TASK-0100`..`0105`, без implementation, public API changes або
створення derived task packages до human approval.

## Рішення

Рекомендовано п'ять lifetime tasks `TASK-0106`..`0110` і один спільний послідовний
cross-feature predecessor chain:

```text
TASK-0099 approval
  -> TASK-0100 shared identity/cycle foundation
  -> TASK-0106 lifetime metadata/provider-edge foundation
  -> TASK-0107 static validation/coverage/diagnostics
  -> TASK-0101 async multi core factory resolution
  -> TASK-0102 async multi composer/inspection integration
  -> TASK-0103 async multi resource ownership/disposal
  -> TASK-0108 scope-effective validation/inspection/export v2
  -> TASK-0104 async multi testing/DSL/docs
  -> TASK-0109 lifetime testing/DSL/docs/adoption
  -> TASK-0105 async multi audit handoff
  -> TASK-0110 lifetime/cross-feature audit handoff
```

Цей порядок навмисно серіалізує зміни в `container.ts`, `composer.ts`, inspection та
testing/DSL surfaces. Він не створює паралельної provider identity, дає async factory і
resource slices уже стабільний dependency metadata contract, а scope/export integration
виконується після появи всіх async provider kinds і ownership semantics.

## Evidence: чинний код

### Core container

- `packages/ioc/src/container.ts` містить public `BindingBuilder`, `MultiBindingBuilder`,
  `ContainerRuntime` і `ResolutionContext`.
- `ProviderRecord` зберігає лише `tokenId`, `lifetime`, `initialization`, cache та execution;
  concrete registration identity і dependency metadata відсутні.
- Single і multi registrations мають різні wrappers, але multi provider index не є полем
  provider record і відновлюється лише позиційно.
- `cloneProviderRegistrations()` клонує provider state, тому metadata/identity мають
  клонуватися атомарно з registration, а не жити в side map.
- `validateProviderRegistrations()` зараз перевіряє лише async lifecycle.
- `createScopeState()` нормалізує inherited/local single і multi values синхронно до
  повернення scope; це правильна deterministic insertion point для effective validation.
- Runtime і scope resource disposer ledgers уже owner-local; ownership edges мають бути
  derivation з цих provider/owner facts, а не окремим user declaration.

### Composer, modules і private providers

- `packages/ioc/src/composer.ts` обгортає core builders для module setup,
  composition-root bindings і composed runtime.
- `ProviderRegistrationRecord` є окремим inspection record з kind/lifetime/initialization
  та optional index; це головний metadata drift risk відносно core provider record.
- Public capability registration indexes рахуються в `CompositionAccessModel`.
- Private providers перетворюються на synthetic internal tokens, але не входять у
  `registeredCapabilities`; чинна public inspection навмисно їх не показує.
- Post-setup validation відбувається після module setup і до `container.freeze()`, тому
  provider dependency static gate може працювати без виконання provider factories.
- `ComposerInspection` до setup бачить лише declaration graph. `RuntimeInspection` після
  compose має provider summaries, але не provider dependency graph або coverage.

### Scope, diagnostics, export, DSL і testing

- `packages/ioc/src/context.ts` визначає sync `createScope()` contract і child scopes;
  effective lifetime validation теж мусить лишатися sync і виконуватися до повернення
  `Scope`.
- `packages/ioc/src/diagnostics.ts` уже має severity `error | warning | info`, але
  composer зараз блокує build за `report.ok`, а internal report builder трактує будь-який
  diagnostic як `ok: false`. Warning rollout потребує явного rule: composition блокується
  лише за error severity, без маскування warning як success.
- `packages/ioc/src/graph-export.ts` schema v1 проєктує module graph edges. Provider
  dependency/ownership edges, coverage і private-safe provider nodes у v1 відсутні.
- `packages/ioc/src/dsl.ts` має окремі factory definition types і compilation paths;
  dependency options треба додавати лише після object API semantics.
- `packages/ioc-testing/src/index.ts` має fake providers, overrides, graph/diagnostic
  assertions і snapshot helpers через public APIs; він не повинен читати internal edge
  records або мутувати frozen runtime.
- Окремого `packages/ioc/src/module.ts` у repository немає: module definitions, setup
  builders, composed contexts/scopes і registration bridge живуть у `composer.ts`.
- `packages/ioc/src/index.ts`, `packages/ioc/package.json`, root `tsconfig.test.json` і
  package consumer smoke є public type/export boundary; `packages/ioc-testing/package.json`
  входить у supporting-layer export blast radius.
- Focused owner files: `container.test.ts` — clone/freeze/metadata; `composer.test.ts` —
  module/setup/private bridge; `scope.test.ts` — effective targets/cache;
  `graph-export.test.ts` — v1/v2; `dsl.test.ts` і `ioc-testing/test/*` — supporting parity.

## Evidence: async multi-provider tasks

`TASK-0100` уже містить activation gate на approved `TASK-0099` і вимагає shared identity
reconciliation. `TASK-0101`..`0104` послідовно додають async factory, composer/inspection,
resource та supporting surfaces; `TASK-0105` є async-only audit handoff.

Planning consequence:

- `TASK-0100` має реалізувати generic provider registration identity, а не async-only
  contribution identity.
- `TASK-0106` не створює identity заново; він додає dependency metadata і normalized
  edges, keyed тією самою identity.
- `TASK-0101` і `TASK-0103` після цього проводять той самий options/edge contract для
  async factory/resource multi contributions.
- `TASK-0102` повторно використовує normalized nodes у inspection замість composer-local provider
  model.
- `TASK-0104` виконується після lifetime scope/export integration, а `TASK-0105` — після
  обох supporting-layer tasks, щоб audit бачив фінальні shared surfaces.

## Shared identity reconciliation contract

Єдиний internal identity foundation має бути opaque для container layer і достатнім для
lifetime edges, async cycle frames, inspection та export projection. Canonical equality
key і collection cycle coordinate є різними типами з explicit mapping.

Conceptual contract:

```ts
type ProviderRegistrationKey =
    | {
          readonly visibility: 'public'
          readonly tokenId: string
          readonly registrationIndex: number
      }
    | {
          readonly visibility: 'private'
          readonly moduleId: string
          readonly registrationIndex: number
      }

type PrivateCollectionCycleCoordinate = {
    readonly moduleId: string
    readonly privateCollectionOrdinal: number
    readonly contributionIndex: number
    readonly providerKey: Extract<ProviderRegistrationKey, { visibility: 'private' }>
}
```

Exact internal type names лишаються implementation detail. Обов'язкові invariants:

- canonical public key — `tokenId + per-token registrationIndex`;
- canonical private key — `moduleId + module-wide registrationIndex` для single і multi
  registrations;
- `privateCollectionOrdinal + contributionIndex` є окремою collision-free async
  collection-frame coordinate, а не provider equality identity;
- кожна private multi coordinate детерміновано й one-to-one посилається на canonical
  provider key; reverse mapping не обчислюється з raw private token ID;
- composer передає safe identity через registration bridge, але container не знає про
  modules;
- raw synthetic/private token ID не потрапляє в message, details, cause, inspection або
  export.

Обов'язковий collision fixture чергує private single, першу private multi collection,
іншу private single і другу private multi collection в одному module. Він доводить
унікальність module-wide keys, різні collection ordinals і stable mapping кожного
contribution frame до provider key.

## Normalized provider-edge foundation

Foundation складається з одного immutable snapshot:

- provider registration nodes, keyed `ProviderRegistrationKey`;
- declared dependency selectors `instance | deferred`;
- concrete dependency edges після single/multi expansion;
- derived ownership edges для managed resources;
- provider coverage `not-applicable | declared | undeclared`;
- aggregate coverage `complete | partial | none`.

Metadata selector і normalized edge не є тим самим типом. Selector містить public token,
cardinality і deferred `via/scope`; normalized edge завжди посилається на concrete safe
provider identities. Empty multi зберігає selector/coverage, але створює нуль concrete
edges.

Scope substitution залежить від consumer resolution domain, а не від cache readiness:

- singleton consumer завжди використовує base runtime targets, ready він чи uninitialized;
- scoped consumer використовує effective current-scope targets;
- transient consumer через runtime використовує base targets, а transient consumer через
  explicit scope — effective scope targets із approved lifetime-sensitive severity;
- local values є scope-owned targets і ніколи ретроактивно не переприв'язують singleton.

Scope-effective snapshot не мутує frozen base snapshot.

`ModuleGraph` лишається module/capability graph. Provider graph є окремим рівнем того самого
`RuntimeInspection`, але існує лише одна normalized provider representation, яку
споживають validator, inspection і export.

## Public API і rollout recommendation

Рекомендована additive object API shape зберігає approved `toFactory(factory,
{ dependencies })` direction і поширює ті самі options на async factory/resource methods.
DSL не отримує окремих назв або semantics.

Recommended policy contract:

```ts
type LifetimeValidationMode = 'off' | 'report' | 'enforce'

interface LifetimeValidationOptions {
    readonly mode?: LifetimeValidationMode
    readonly coverage?: 'ignore' | 'summary'
}
```

Policy задається additive options у `createContainer()` / `createComposer()` і
успадковується frozen runtime та scopes. Existing zero-argument calls не змінюються.

- Default `mode: 'off'`: existing applications і snapshots не отримують diagnostics.
- `report`: proven unsafe зберігає severity `error`, sensitive та incomplete coverage —
  `warning`, але composition/scope creation не блокуються.
- `enforce`: той самий proven unsafe error diagnostic блокує freeze/compose/createScope;
  sensitive та incomplete coverage лишаються warnings.
- `coverage: 'ignore'` вимикає aggregate coverage warning; `summary` створює один
  deduplicated warning. Per-provider undeclared spam заборонений.
- Structurally invalid explicitly supplied metadata є error незалежно від mode: це invalid
  configuration, а не rollout enforcement.
- Future default `report`, complete-coverage CI gate або default `enforce` потребують
  окремого human-reviewed compatibility decision; `0.0.3` їх не активує.

Diagnostic severity не залежить від policy: policy керує лише operation blocking. Public
lifetime inspection зберігає окремі `mode` і `blocked` поряд із diagnostics. У `report`
mode `blocked: false`, навіть якщо report містить unsafe error; в `enforce` той самий
evidence дає `blocked: true`. Чинна global semantics `DiagnosticReport.ok` у `0.0.3` не
змінюється. `TASK-0107` має inventory всіх `.ok` consumers і regression gate, щоб
reporting не змінило existing composer behavior приховано.

Existing composer structural validation report і його gate лишаються окремими від
`lifetimeValidation`. Їх не можна механічно merge-ити й знову блокувати за aggregate
`ok`; freeze/compose/createScope перевіряють existing structural errors та окремий
`lifetimeValidation.blocked`.

## Inspection і graph export contract

Phase 3 додає provider graph і validation/coverage до safe container/composed runtime та
scope inspection. Scope inspection є immutable snapshot effective registrations; вона не
показує values, cache readiness, in-flight state або disposers.

Graph export v1 не розширюється provider edges заднім числом. Рекомендовано opt-in schema
v2:

- v1 лишається default і byte-stable для existing inputs;
- `TASK-0102` може заповнювати тільки вже наявні v1 fields для нових async provider inputs;
  нові top-level collections, provider nodes, provider dependency/ownership edge kinds і
  coverage fields у v1 заборонені;
- v2 приймає safe runtime/scope inspection input і додає provider nodes, dependency edges,
  ownership edges та coverage;
- JSON v2 є canonical, DOT/Mermaid — pure projections;
- private nodes мають safe label/identity без raw token ID;
- promotion v2 to default потребує окремого compatibility/release decision.

Schema matrix:

| Data | v1 після TASK-0102 | v2 після TASK-0108 |
|---|---|---|
| Existing module/capability/binding fields | unchanged for existing inputs | preserved |
| New async input у existing provider summary fields | allowed | included |
| Provider registration nodes | forbidden | included |
| Dependency/ownership edges | forbidden | included |
| Coverage | forbidden | included |
| Private-safe provider nodes | forbidden | included without token ID |

Golden fixtures мають довести byte stability v1 для existing inputs і deterministic v1/v2
outputs для new inputs.

## Proposed implementation tasks

### TASK-07.13-0106 — lifetime metadata and provider-edge foundation

Predecessor: `TASK-0100 done`.

Scope:

- повторно використати shared provider registration key і cycle-coordinate mapping;
- додати typed dependency options до explicit core/composer/module factory і resource
  object APIs;
- зберігати immutable declarations у provider record і clone path;
- побудувати normalized provider nodes/selectors/concrete edges, multi expansion,
  ownership edge derivation і coverage snapshot;
- додати safe registration bridge для private providers без module knowledge у container.

Out of scope: severity evaluation, blocking validation, scope-effective substitution,
public inspection/export, DSL/testing/docs.

Primary file impact: `container.ts` registration/clone/freeze paths; `composer.ts`
module/setup/private bridge і composed contexts; `index.ts`; `packages/ioc/package.json`;
`container.test.ts`, `composer.test.ts` та root type/export smoke.

Acceptance/verification:

- one canonical provider key і one provider-edge snapshot;
- private key/cycle-coordinate mapping проходить interleaved single/multi/private
  collision fixture;
- single/multi/private/resource fixtures normalized deterministically;
- cloning/freeze preserves metadata;
- factories never execute during normalization;
- existing one-argument registrations compile and behave unchanged;
- build, typecheck, focused/full core tests, lint і format pass;
- independent audit closes identity/privacy/model duplication findings.

### TASK-07.13-0107 — static validation, coverage and diagnostics

Predecessor: `TASK-0106 done`.

Scope:

- implement metadata invalidity/cardinality/target gates;
- implement approved lifetime/severity matrix and coverage aggregation;
- add `off | report | enforce` policy to container/composer creation options;
- expose static validation report before factory execution and carry post-setup provider
  validation into composed runtime inspection state;
- define stable-severity diagnostics and separate report/enforce blocking decision;
- inventory existing `DiagnosticReport.ok` consumers without global semantic change.

Out of scope: child-scope effective substitution, graph export v2, DSL/testing/docs,
default enforcement.

Primary file impact: `container.ts`, `composer.ts`, `diagnostics.ts`, `index.ts`,
`container.test.ts`, `composer.test.ts`, `diagnostics.test.ts` і type tests.

Acceptance/verification:

- every TASK-0097 matrix row and evidence class covered;
- invalid declaration is error; unknown is never unsafe;
- default off produces no new diagnostics or behavior changes;
- report mode не блокує lifetime capture/coverage findings і не змінює їх severity;
  structurally invalid explicit metadata блокує в `off`, `report` і `enforce`;
- invalid-metadata fixture окремо проходить для кожного mode; enforce додатково блокує
  proven unsafe capture;
- no user factory execution during validation;
- private sentinel/cause sanitation and full quality gates pass.

### TASK-07.13-0108 — scope-effective validation, inspection and graph export v2

Predecessors: `TASK-0103 done` and final results `TASK-0101`..`0103` incorporated.

Scope:

- perform deterministic effective validation in `createScope()` / child creation after
  local/inherited normalization and before child linking/return;
- model local values as scope-owned effective registrations and preserve separate caches;
- add immutable provider graph/coverage/diagnostics to container/composed runtime and
  scope inspection;
- add opt-in graph export schema v2 and JSON/DOT/Mermaid parity;
- integrate async factory/resource provider kinds and derived owner edges.

Out of scope: testing helpers, DSL, adoption docs, default schema v2 або default
enforcement.

Primary file impact: `context.ts`, `container.ts`, `composer.ts` composed runtime/scope
wrappers, `graph-export.ts`, `index.ts`, package export map, `scope.test.ts`,
`composer.test.ts`, `graph-export.test.ts` і type/export smoke.

Acceptance/verification:

- createScope failure occurs before factory execution and before child publication;
- nested inherited/override multi order and cache isolation covered;
- ready і uninitialized singleton однаково використовують base runtime targets і не
  переприв'язуються до child provider;
- validator/inspection/export parity uses the same edge identities;
- v1 snapshots remain byte-stable, v2 deterministic;
- private IDs/values/cache state absent from JSON/DOT/Mermaid;
- full quality gates and independent audit pass.

### TASK-07.13-0109 — testing, DSL, docs, adoption and staged enforcement

Predecessors: `TASK-0104 done` and `TASK-0108 done`.

Scope:

- add testing assertions/fixtures for provider edges, coverage, lifetime diagnostics and
  scope inspection through public APIs;
- propagate dependency options through overrides/fake modules without frozen mutation;
- add one-to-one DSL metadata projection after object API stabilization;
- document matrix, deferred handles, privacy, graph v2, migration and rollout;
- add examples/adoption guidance and package/export smoke.

Out of scope: new production semantics, strict/default enforcement, schema v2 default,
version bump або publish.

Primary file impact: `packages/ioc-testing/src/index.ts`, його package manifest/tests,
`dsl.ts`, `index.ts`, `packages/ioc/package.json`, docs, examples, root type tests і
package consumer smoke.

Acceptance/verification:

- helpers delegate public object API and do not inspect private internals;
- object API remains fully usable without DSL;
- docs never claim metadata proves factory body honesty;
- migration starts with opt-in report for high-risk providers;
- compile/package/export/example/full quality gates and independent audit pass.

### TASK-07.13-0110 — lifetime and shared-foundation audit handoff

Predecessor: `TASK-0105 done` and `TASK-0109 done`.

Scope:

- full lifetime matrix, coverage, privacy, scope, graph v2, async multi integration,
  compatibility and package-boundary audit;
- formal Ukrainian audit report with severity/evidence/disposition;
- required fix proposals and stabilization handoff.

Out of scope: version bump, publish, whole-portfolio release-ready claim, new features or
broad refactor.

Acceptance/verification:

- reproduce all predecessor contracts and cross-feature identity/ownership invariants;
- full build/test/typecheck/lint/format, export/package smoke and relevant pack gates;
- independent subagent audit reconciled;
- no release claim until a separate human-approved release task.

## Prepared async task reconciliation after approval

Before activation, prepared async task packages should be updated operationally:

- `TASK-0100`: link approved planning report and implement the shared identity contract.
- `TASK-0101`: add `TASK-0107` predecessor and require dependency options/edge parity for
  async factory contributions.
- `TASK-0102`: require shared provider identities without composer-local copy; v1 may use
  only existing fields for new async inputs і не показує provider edges/coverage.
- `TASK-0103`: require derived ownership edges in the shared snapshot.
- `TASK-0104`: add `TASK-0108` predecessor so testing/docs see final scope/export surface.
- `TASK-0105`: add `TASK-0109` predecessor so audit covers final shared supporting layers.

These are prepared task/context changes, not implementation and not canonical memory
fixations. They must not be applied before explicit human approval of this follow-up.

## Compatibility, migration and blast radius

- Source compatibility: existing factory/resource calls remain valid one-argument forms.
- Runtime compatibility: default validation off; no new diagnostics, blocking or factory
  execution for existing apps.
- Snapshot compatibility: graph v1 remains default/byte-stable; v2 opt-in.
- Type blast radius: all builder wrappers and exports must share one options type.
- Runtime blast radius: provider clone, freeze, composer setup bridge, scope creation,
  resource ownership and inspection all depend on provider record.
- Test blast radius: container/composer/scope/graph/DSL/testing package and package smoke.
- Migration: opt-in report on composition roots/high-risk singleton/scoped providers,
  inspect coverage, correct declarations, only then opt-in enforce.

## Architecture pressure and mitigations

| Pressure | Impact | Mitigation |
|---|---|---|
| Core/composer duplicate provider records | metadata drift | shared identity and normalized snapshot before validation |
| Private providers absent from inspection | unsafe leak або blind spot | opaque composer registration bridge and safe identity |
| Async/lifetime parallel identity | inconsistent diagnostics/cycles | TASK-0100 is mandatory shared predecessor |
| Rollout policy vs diagnostic severity | matrix drift або accidental compose break | stable severity, separate `blocked`, default mode off |
| Graph export v1 lacks provider edges | silent schema drift | opt-in v2, v1 unchanged |
| Scope-effective substitution | cache/rebinding bugs | validate after normalization, before publication/execution |
| Metadata vs factory body drift | false confidence | coverage wording, no runtime proof claim, audits/docs |
| Cross-feature file collisions | review ambiguity | single serialized predecessor chain |

## Upward consistency disposition

| Area | Disposition | Rationale |
|---|---|---|
| `memory/product/roadmap.md` | included у FIX-001 | approved backlog і cross-feature order мають бути canonical |
| `memory/state.md` | included у FIX-001 | current focus/next steps мають відобразити approved planning |
| `memory/product/requirements.md` | not-needed | requirement лишається `design-approved` до implementation |
| `memory/technical/architecture.md` | not-needed | semantic model і shared graph boundary вже canonical |
| `memory/technical/rules.md` | not-needed | guardrails уже покривають recommendation |
| `memory/technical/testing.md` | not-needed | required matrix/privacy/parity gates уже canonical |
| `memory/technical/specification-trace.md` | not-needed | planning report не є новим semantic source |
| indexes | not-needed до task creation | structure зміниться лише після approval |

## Recommendation

Схвалити planning result, `FIX-001`, creation `TASK-0106`..`0110` і prepared async task
reconciliation як один coordinated follow-up. Після approval спочатку створити derived
task packages і застосувати exact canonical fixation, потім активувати тільки `TASK-0100`.
Жодну implementation task не запускати в межах `TASK-0099`.
