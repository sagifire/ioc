# Feature Request: @sagifire/ioc 0.0.2

Multi-capabilities, graph-aware adapters, derived scopes та покращена inspection-модель для модульного site engine

Статус: proposed. Цільова версія: 0.0.2. Вихідна умова: @sagifire/ioc 0.0.1 уже стабілізовано та релізнуто. Основний downstream use case: модульний site engine для Next.js App Router.

## 1. Короткий підсумок

Для версії 0.0.2 потрібно додати до @sagifire/ioc кілька фундаментальних можливостей, які не перетворюють бібліотеку на web framework, але роблять її достатньо сильною основою для модульного application/platform layer.

- First-class multi-capabilities: capability-рівень для впорядкованих колекцій contributions, а не тільки container-level add()/getAll().
- Graph-aware adapter API: явне описання того, з яких public capabilities будується adapter для required port, без виконання factory та без прихованого inference.
- Child / derived scopes: вкладені scopes для transaction, preview, impersonation, tenant override та тестових overlays.
- Contribution / MultiToken helper: необов’язковий, але бажаний типізований спосіб позначати tokens, які мають використовуватись через add()/getAll().
- Покращення inspection і diagnostics: graph має показувати multi contributors, adapter source edges, cardinality conflicts і adapter-level cycles.

Цей запит не про admin menu, permissions, transaction manager або settings engine у core. Core має дати primitives. Доменні поняття мають жити у site-engine. Бо якщо DI бібліотека раптом почне знати, що таке “admin nav item”, це вже не core, а маленький фреймворк із амбіціями й майбутнім deprecated API.

## 2. Контекст і поточна база 0.0.1

@sagifire/ioc 0.0.1 уже дає потрібний фундамент: typed tokens, immutable runtime, request/operation scopes, module composition, diagnostics, testing helpers і тонкі Next.js App Router boundary helpers. Бібліотека принципово не використовує decorators, reflect-metadata, filesystem discovery або hidden dependency inference.

Поточний container layer уже має multi-providers через add(token) і getAll(token). Це добре, але для модульного engine цього недостатньо: multi-provider має бути видимий як public module capability, валідований composer-ом, показаний у graph inspection і доступний через composed runtime public boundary.

Поточний composer уже має explicit module requires/provides, validation, getGraph()/inspect(), application bindings і capability-gated composed runtime. Водночас adapter dependency, захований у binding factory, не infer-иться: validate()/inspect() не виконують factories, тому graph бачить required-port-to-binding edge, але не обов’язково бачить, з якого provider API цей adapter побудований. Це правильне рішення для безпеки й детермінованості, але потрібен явний API для graph-aware adapters.

## 3. Дизайн-обмеження

- Без decorators і reflect-metadata.
- Без filesystem discovery.
- Без прихованого виконання factories для побудови graph.
- Без глобального registry/service locator.
- Усі нові graph edges мають бути результатом explicit declaration.
- Core не має знати про admin, permissions, settings, transactions або Next.js business semantics.
- Existing 0.0.1 API має лишитися сумісним: нові можливості мають бути additive.
- Diagnostics мають бути стабільними, machine-readable і зручними для formatDiagnostics().
- Нові можливості мають бути тестовані через @sagifire/ioc-testing.

## 4. P0 функція: first-class multi-capabilities

### 4.1. Проблема

Для site engine кожен модуль має мати змогу декларувати contributions: admin nav items, permission definitions, event subscribers, sitemap contributors, search index contributors, health checks, dashboard cards, UI slots, metadata contributors. Це не single public API. Це ordered collection, у яку багато модулів додають typed contribution values.

Container-level add()/getAll() уже вирішує частину задачі, але composer-level module capabilities поки не мають повної cardinality semantics. Через це engine змушений або створювати унікальний contribution token на кожен модуль, або писати ручні aggregator modules. Це працює, але виглядає як ручне складання dependency graph із дерев’яних паличок.

### 4.2. Запропонований API

```ts
import { defineModule, token } from '@sagifire/ioc'

export interface AdminContribution {
    readonly moduleId: string
    readonly navItems?: readonly AdminNavItem[]
    readonly permissions?: readonly PermissionDefinition[]
}

export const ADMIN_CONTRIBUTIONS =
    token<AdminContribution>('engine.admin.contributions')

export const contactRequestsModule = defineModule({
    id: 'contact-requests',
    version: '0.1.0',

    provides: [
        {
            token: ADMIN_CONTRIBUTIONS,
            kind: 'admin-contribution',
            cardinality: 'multi'
        }
    ],

    setup(context) {
        context.add(ADMIN_CONTRIBUTIONS).toValue({
            moduleId: 'contact-requests',
            navItems: [
                {
                    label: 'Contact requests',
                    href: '/admin/contact-requests',
                    permission: 'contactRequests.read'
                }
            ],
            permissions: [
                {
                    key: 'contactRequests.read',
                    label: 'Read contact requests'
                }
            ]
        })
    }
})
```

### 4.3. Опційний typed helper

```ts
import { multiToken } from '@sagifire/ioc'

export const ADMIN_CONTRIBUTIONS =
    multiToken<AdminContribution>('engine.admin.contributions')

// runtime.get(ADMIN_CONTRIBUTIONS)      // type error або runtime error
// runtime.getAll(ADMIN_CONTRIBUTIONS)   // expected usage
```

Цей helper не обов’язково має бути частиною першого PR, але він корисний як compile-time сигнал: цей token призначений для add()/getAll(), а не bind()/get().

### 4.4. Використання в runtime

```ts
const runtime = await composer.compose()

const adminContributions = runtime.getAll(ADMIN_CONTRIBUTIONS)

await runtime.withScope(async scope => {
    const scopedContributions = scope.getAll(ADMIN_CONTRIBUTIONS)
})
```

### 4.5. Required multi ports

Aggregator modules мають мати змогу явно залежати від multi-capability. Наприклад, engine catalog module може вимагати всі admin contributions, але не падати, якщо їх нуль.

```ts
export const engineCatalogModule = defineModule({
    id: 'engine-catalog',

    requires: [
        {
            token: ADMIN_CONTRIBUTIONS,
            kind: 'admin-contribution',
            cardinality: 'multi',
            required: false
        }
    ],

    provides: [
        {
            token: ENGINE_CATALOG_PUBLIC_API,
            kind: 'public-api'
        }
    ],

    setup(context) {
        context.bind(ENGINE_CATALOG_PUBLIC_API).toFactory(({ getAll }) => {
            return createEngineCatalogApi({
                adminContributions: getAll(ADMIN_CONTRIBUTIONS)
            })
        })
    }
})
```

### 4.6. Семантика

- Capability cardinality defaults to 'single' для backward compatibility.
- Multiple modules may provide the same token only if every declaration uses cardinality: 'multi'.
- Single capability duplicate remains validation error.
- A token cannot be declared as both single and multi in the same composer graph.
- A token cannot be registered through both bind() and add() in the same effective container graph.
- get(token) and tryGet(token) must fail for multi-capability tokens.
- getAll(token) must fail for single-capability tokens.
- For optional required multi ports, no contributions means an empty array, not missing dependency.
- For required multi ports, zero contributions should produce a missing multi-capability diagnostic.
- Contribution order should be deterministic: module registration order, then setup registration order inside module.
- Scope-local multi values should extend runtime multi contributions after runtime contributions, preserving existing container semantics.

### 4.7. Правила валідації

- Duplicate single capability token: error.
- Multiple multi capability declarations with same token and compatible kind/cardinality: ok.
- Single/multi cardinality conflict for same token: error.
- Different capability kinds for same multi token: error by default, або at least warning with strict mode error. Для engine краще error.
- Required single port satisfied by multi capability: error.
- Required multi port satisfied by single capability: error.
- Static declaration says cardinality: multi, but module setup uses bind(token): post-setup validation error.
- Static declaration says cardinality: single, but module setup uses add(token): post-setup validation error.
- Composer inspection must expose cardinality, contributors and satisfaction state.

Важлива технічна примітка: validate() у 0.0.1 не виконує setup(), тому mismatch між declared provides і фактичним bind()/add() можна повністю ловити тільки на prepare()/compose() або через нову post-setup validation phase. Статичні конфлікти між capability declarations можна ловити одразу в validate().

### 4.8. Кейси використання

- Admin shell: кожен модуль додає nav items, dashboard cards і admin sections.
- Permission registry: кожен модуль додає список permission keys, groups і descriptions.
- Event subscribers: модулі додають handlers без runtime scanning.
- Health checks: модулі додають health check definitions, health endpoint викликає їх централізовано.
- Sitemap contributors: content modules додають правила для sitemap generation.
- Search indexing: модулі додають index contributors для побудови search documents.
- UI slots: модулі додають typed contributions у slots без імпорту internals.
- Metadata contributors: SEO/content modules додають metadata rules для Next.js adapters.

## 5. P0 функція: graph-aware adapter API

### 5.1. Проблема

У modular application architecture required port часто реалізується adapter-ом поверх public API іншого модуля. Це правильна інверсія залежностей: consumer module володіє required port, provider module володіє public API, composition root створює adapter. Але якщо adapter пишеться як звичайний binding factory, graph не бачить, які public capabilities factory використовує.

Це не треба вирішувати виконанням factory. Виконувати user code для graph inference — це блискучий спосіб отримати nondeterministic validation і потім робити вигляд, що так і задумано. Потрібен explicit adapter API.

### 5.2. Запропонований object API

```ts
composer
    .adapt(CONTACT_REQUESTS_AUTH_READER)
    .from(AUTH_PUBLIC_API)
    .using(auth => {
        return {
            getCurrentUser: () => auth.getCurrentUser(),
            requirePermission: permission => auth.requirePermission(permission)
        }
    })
```

### 5.3. Кілька source capabilities

```ts
composer
    .adapt(CONTACT_REQUESTS_AUTH_READER)
    .from({
        auth: AUTH_PUBLIC_API,
        permissions: PERMISSIONS_PUBLIC_API
    })
    .using(({ auth, permissions }) => {
        return {
            getCurrentUser: () => auth.getCurrentUser(),
            requirePermission: permission => permissions.require(permission)
        }
    })
```

### 5.4. Альтернативний низькорівневий API

```ts
composer.bind(CONTACT_REQUESTS_AUTH_READER).toAdapter({
    uses: [AUTH_PUBLIC_API],
    factory: ({ get }) => {
        const auth = get(AUTH_PUBLIC_API)

        return {
            getCurrentUser: () => auth.getCurrentUser(),
            requirePermission: permission => auth.requirePermission(permission)
        }
    }
})
```

Обидва варіанти допустимі. Але adapt().from().using() краще читається і прямо виражає архітектурний намір. Так, людям іноді треба допомагати навіть назвою методу. Така вже професія.

### 5.5. Семантика

- Adapter лишається composition-level binding для required port.
- Adapter source tokens декларуються явно через from()/uses.
- Validation та inspection не виконують adapter factory.
- Source tokens мають бути resolvable через public capability surface або через інші валідні composition-level public bindings, якщо така модель існує.
- Adapter output token лишається прихованим, якщо він додатково не задекларований як provided capability модуля.
- bind(token).toFactory() лишається підтриманим low-level escape hatch, але для inter-module bindings бажано використовувати graph-aware adapters.
- Factory отримує resolved source values у typed формі, а не generic get() context, якщо використовується from().using().
- Object source form зберігає назви та типи: from({ auth: AUTH_PUBLIC_API }).using(({ auth }) => ...).

### 5.6. Модель graph

```txt
edgeKinds:
    capability          consumer required port -> provider capability
    binding             consumer required port -> composer binding
    adapter-source      composer adapter binding -> source capability
    multi-contribution  module -> multi capability contribution
```

Inspection має показувати це явно:

```txt
CONTACT_REQUESTS_AUTH_READER
    required by: contact-requests
    satisfied by: adapter binding
    adapter sources:
        AUTH_PUBLIC_API provided by auth
```

### 5.7. Правила валідації

- Adapter target token must be declared as required port by at least one module.
- Duplicate binding/adaptation for same target token: error.
- Adapter source token missing from public capability graph: error.
- Adapter source token is module-private provider: error.
- Adapter source token is multi capability but API expects single source: error. Future extension may add fromAll().
- Adapter target token declared as multi required port but adapter produces single value: error, unless explicit adapter cardinality is added.
- Adapter-aware cycle diagnostic should analyze capability + adapter-source edges. This does not require executing factories.
- Low-level bind().toFactory() should keep current behavior and graph limitation, but diagnostics may recommend adapt() when factory has declared uses metadata.

### 5.8. Кейси використання

- Auth adapter: CONTACT_REQUESTS_AUTH_READER implemented over AUTH_PUBLIC_API.
- Payments adapter: ORDERS_PAYMENT_PORT implemented over STRIPE_PAYMENT_API or MOCK_PAYMENT_API.
- Settings adapter: module-specific settings reader implemented over SETTINGS_PUBLIC_API.
- Permissions adapter: module permission checker implemented over RBAC_PUBLIC_API.
- Notifications adapter: CONTACT_NOTIFICATION_PORT implemented over EMAIL_PUBLIC_API and TEMPLATE_PUBLIC_API.
- Repository abstraction: module required storage port implemented over platform storage/public infrastructure capability.
- Testing graph assertions: tests can assert that a required port is adapted from the expected source capability.

## 6. P0 функція: child / derived scopes

### 6.1. Проблема

Request/operation scopes уже є explicit objects. Але для реального application engine потрібні вкладені operation contexts: database transaction, draft preview, tenant override, locale preview, admin impersonation, feature flag override, test scenario overlay. Це не має бути AsyncLocalStorage-магія. Це має бути явний child scope.

### 6.2. Запропонований API

```ts
await requestScope.withChildScope(
    {
        values: [
            scopeValue(DB_SESSION, transactionDb),
            scopeValue(TRANSACTION_CONTEXT, tx)
        ],
        multiValues: [
            scopeMultiValue(AUDIT_TAGS, 'transaction')
        ]
    },
    async txScope => {
        const useCase = txScope.get(SUBMIT_CONTACT_REQUEST_USE_CASE)
        return useCase.execute(ctx, input)
    }
)
```

### 6.3. Варіант з ручним lifecycle

```ts
const childScope = requestScope.createChildScope({
    values: [scopeValue(LOCALE, 'uk')]
})

try {
    const api = childScope.get(CONTENT_PUBLIC_API)
    return await api.preview(ctx, input)
} finally {
    await childScope.dispose()
}
```

### 6.4. Семантика

- Child scope inherits parent scope-local single values unless overridden.
- Child scope inherits parent scope-local multi values and appends child multi values after parent values.
- Runtime providers remain visible exactly as in normal scopes.
- Child scope has its own scoped provider cache. It must not reuse parent scoped provider instances by default, because child overrides would otherwise be invisible to already-cached services.
- Factory resolved through child scope sees child scope values and child overrides.
- Disposing child does not dispose parent.
- Disposing parent should dispose active children in reverse creation order або reject parent disposal if children are still active. Safer default: dispose children automatically and expose diagnostic/debug hooks.
- Cannot create child scope from disposed parent.
- Cannot resolve from child after child disposal.
- withChildScope() must dispose child in finally, including async error paths.
- Core should not know anything about database transactions, tenant preview, admin impersonation or Next.js.

### 6.5. Кейси використання

- UnitOfWork: request scope contains request/user/locale; transaction child scope overrides DB_SESSION and TRANSACTION_CONTEXT.
- Admin impersonation: child scope overrides CURRENT_USER/ACTOR while keeping requestId and logger context.
- Content preview: child scope overrides CONTENT_MODE = draft and LOCALE = selected preview locale.
- Tenant override: admin tool previews site as another tenant without mutating parent request scope.
- Feature flag testing: child scope adds temporary feature flag values for one operation.
- Integration tests: one test runtime can create nested scenario scopes without rebuilding full runtime.

### 6.6. Зв’язок з UnitOfWork

UnitOfWork сам по собі не має бути core-функцією @sagifire/ioc. Він належить до site-engine/platform layer. Але @sagifire/ioc має дати scope primitive, який робить transaction-as-scope можливим.

```ts
export interface UnitOfWork {
    run<TValue>(
        ctx: CallContext,
        callback: (tx: TransactionContext) => Promise<TValue>
    ): Promise<TValue>
}

// Site-engine implementation may internally use child scope,
// but @sagifire/ioc does not need to know what a transaction is.
```

## 7. P1 функція: MultiToken / ContributionToken helper

Це не є строго обов’язковим, якщо cardinality декларується в provides, але суттєво покращує type-level ergonomics.

```ts
export const ADMIN_NAV =
    contributionToken<AdminNavContribution>('engine.admin.nav')

export const PERMISSIONS =
    contributionToken<PermissionContribution>('engine.permissions')

context.add(ADMIN_NAV).toValue(...)
runtime.getAll(ADMIN_NAV)

// Preferably rejected by TypeScript overloads:
// context.bind(ADMIN_NAV).toValue(...)
// runtime.get(ADMIN_NAV)
```

Якщо це створює занадто багато type-level complexity для 0.0.2, можна відкласти helper і реалізувати тільки cardinality у capability metadata. Але для downstream engine API це буде дуже зручно, бо contribution tokens перестануть виглядати як звичайні single-value tokens.

## 8. P1 функція: покращення inspection і diagnostics

### 8.1. Розширення graph

```ts
interface CapabilityNode {
    readonly tokenId: string
    readonly ownerModuleId?: string
    readonly contributorModuleIds?: readonly string[]
    readonly kind: string
    readonly cardinality: 'single' | 'multi'
}

interface BindingNode {
    readonly tokenId: string
    readonly bindingKind: 'factory' | 'value' | 'adapter'
    readonly adapterSources?: readonly AdapterSource[]
}

interface AdapterSource {
    readonly tokenId: string
    readonly sourceKind: 'single-capability' | 'multi-capability'
    readonly providerModuleId?: string
}
```

### 8.2. Запропоновані diagnostic codes

- IOC_DUPLICATE_SINGLE_CAPABILITY
- IOC_CAPABILITY_CARDINALITY_CONFLICT
- IOC_MULTI_CAPABILITY_KIND_CONFLICT
- IOC_REQUIRED_MULTI_CAPABILITY_MISSING
- IOC_CAPABILITY_REGISTRATION_CARDINALITY_MISMATCH
- IOC_ADAPTER_TARGET_NOT_REQUIRED
- IOC_ADAPTER_SOURCE_MISSING
- IOC_ADAPTER_SOURCE_PRIVATE
- IOC_ADAPTER_SOURCE_CARDINALITY_MISMATCH
- IOC_ADAPTER_CYCLE
- IOC_CHILD_SCOPE_PARENT_DISPOSED
- IOC_CHILD_SCOPE_DISPOSED

### 8.3. Приклад formatted diagnostic

```txt
[IOC_ADAPTER_SOURCE_MISSING]
Adapter for required port contact-requests.auth-reader declares source auth.public-api,
but no module provides auth.public-api and no valid composer binding exposes it.

Required by:
    module: contact-requests
    token:  contact-requests.auth-reader

Adapter declared in application composition.

Suggested fix:
    - register authModule, or
    - change adapter source, or
    - provide a fake auth module in tests.
```

## 9. Підтримка @sagifire/ioc-testing

Нові primitives мають одразу отримати testing helpers. Інакше кожен downstream проект напише свої assert-и, а потім ми всі дружно будемо удавати, що це екосистема.

```ts
import {
    assertGraphHasMultiCapability,
    assertGraphHasContributionFrom,
    assertGraphHasAdapterSource,
    overrideMulti,
    addOverride
} from '@sagifire/ioc-testing'

assertGraphHasMultiCapability(graph, {
    tokenId: ADMIN_CONTRIBUTIONS.id,
    contributorModuleIds: ['contact-requests', 'landing-content']
})

assertGraphHasAdapterSource(graph, {
    targetTokenId: CONTACT_REQUESTS_AUTH_READER.id,
    sourceTokenId: AUTH_PUBLIC_API.id
})
```

### 9.1. Кейси для тестування

- Module harness can assert that module contributes expected admin/permissions declarations.
- Fake modules can provide multi-capability contributions.
- Tests can override all contributions for a multi token.
- Tests can append one contribution without deleting production-like defaults.
- Graph assertions can verify adapter source relationships without executing factories.

## 10. Вплив на @sagifire/ioc-next

@sagifire/ioc-next не потребує domain-specific змін. Поточні route/action helpers можуть і далі створювати один request/action scope на boundary. Child scopes мають бути доступні всередині callback-а через scope.withChildScope().

```ts
return withRouteScope(appRuntime, routeInput, async ({ scope }) => {
    return scope.withChildScope(
        {
            values: [scopeValue(CONTENT_MODE, 'draft')]
        },
        async previewScope => {
            const api = previewScope.get(CONTENT_PUBLIC_API)
            return Response.json(await api.preview(ctx, input))
        }
    )
})
```

Next package не має додавати route scanning, hidden current request access або business lifecycle. Він уже достатньо тонкий; не треба псувати те, що дивом не стало фреймворком.

## 11. Non-goals для @sagifire/ioc 0.0.2

- Не додавати admin menu, permissions, settings, sitemap або health check типи в core.
- Не додавати transaction manager або UnitOfWork у core.
- Не додавати AsyncLocalStorage current scope.
- Не додавати filesystem/module discovery.
- Не додавати dynamic npm plugin loading.
- Не додавати Next.js-specific business APIs у core package.
- Не виконувати user factories для graph inference.
- Не робити bind().toFactory() deprecated; просто рекомендувати graph-aware adapters для inter-module bindings.

## 12. Зворотна сумісність

- Existing token(), namespace().token(), bind(), add(), get(), getAll(), defineModule(), createComposer() мають лишитися сумісними.
- provides без cardinality має трактуватись як cardinality: 'single'.
- Existing composer.bind(token).toFactory() має працювати без змін.
- Existing DSL adapt() може бути розширений, але не зламаний.
- Graph output може отримати нові поля, але existing поля не мають змінити значення без версійного попередження.
- New diagnostics мають бути additive, крім випадків, де нова валідація ловить реально некоректну single/multi registration mismatch.

## 13. Критерії прийняття

- Модуль може declare provides cardinality: multi і register context.add(token).toValue().
- Кілька модулів можуть contribute у той самий multi-capability token без duplicate capability error.
- Duplicate single capability продовжує падати.
- Single/multi cardinality conflict produces deterministic diagnostic.
- Composed runtime exposes public multi capabilities through getAll().
- Composed runtime does not expose module-private multi providers unless declared as public capability.
- Required multi ports can be optional and resolve to empty array.
- Required multi ports can be required and produce missing diagnostic when no contributors exist.
- Graph inspection shows multi capability contributors.
- Graph-aware adapter API can declare target required port and one or many source capabilities.
- Inspection shows adapter source edges.
- Validation catches missing adapter source capability without executing factory.
- Adapter-aware cycle diagnostic exists або documented as explicit non-goal for 0.0.2. Recommendation: include it.
- Scope has withChildScope() helper that disposes child in finally.
- Child scope can override parent local values and has separate scoped provider cache.
- @sagifire/ioc-testing includes assertions/helpers for multi-capabilities, adapter sources and child scopes.
- Docs include examples for admin contributions, auth adapter and transaction child scope.

## 14. Референсні сценарії

### 14.1. Admin catalog для модульного Next.js site engine

Модулі додають admin declarations. Engine catalog агрегує їх. Admin layout читає catalog API. Next.js routes залишаються static stubs.

```ts
context.add(ADMIN_CONTRIBUTIONS).toValue({
    moduleId: 'landing-content',
    navItems: [
        {
            label: 'Landing content',
            href: '/admin/landing-content',
            permission: 'landingContent.read'
        }
    ]
})

const admin = runtime.getAll(ADMIN_CONTRIBUTIONS)
```

### 14.2. Permission registry

Кожен бізнес-модуль декларує permissions як contributions. RBAC UI, seed scripts, diagnostics і tests можуть inspect-ити той самий typed catalog.

```ts
context.add(PERMISSION_CONTRIBUTIONS).toValue({
    moduleId: 'contact-requests',
    permissions: [
        { key: 'contactRequests.read', label: 'Read contact requests' },
        { key: 'contactRequests.delete', label: 'Delete contact requests' }
    ]
})
```

### 14.3. Auth adapter із повним graph

Contact requests module не імпортує auth module internals. Composition root адаптує AUTH_PUBLIC_API у CONTACT_REQUESTS_AUTH_READER. Graph явно показує цей зв’язок.

```ts
composer
    .adapt(CONTACT_REQUESTS_AUTH_READER)
    .from(AUTH_PUBLIC_API)
    .using(auth => ({
        getCurrentUser: () => auth.getCurrentUser(),
        requirePermission: permission => auth.requirePermission(permission)
    }))
```

### 14.4. Transaction boundary через child scope

Site-engine UnitOfWork implementation створює child scope для transaction-local DB_SESSION. Core ioc дає тільки child scope mechanics; transaction semantics лишаються поза core.

```ts
await unitOfWork.run(ctx, async tx => {
    return requestScope.withChildScope(
        {
            values: [
                scopeValue(DB_SESSION, tx.db),
                scopeValue(TRANSACTION_CONTEXT, tx)
            ]
        },
        async txScope => {
            const api = txScope.get(CONTACT_REQUESTS_PUBLIC_API)
            return api.submit(ctx, input)
        }
    )
})
```

### 14.5. Preview та impersonation

Admin preview може створити child scope, який override-ить LOCALE, CONTENT_MODE або CURRENT_USER без мутації оригінального request scope.

```ts
await scope.withChildScope(
    {
        values: [
            scopeValue(CONTENT_MODE, 'draft'),
            scopeValue(LOCALE, 'uk'),
            scopeValue(CURRENT_USER, impersonatedUser)
        ]
    },
    async previewScope => {
        const page = previewScope.get(LANDING_CONTENT_PUBLIC_API)
        return page.renderPreview(ctx, input)
    }
)
```

## 15. Відкриті питання

- Чи потрібен getAllAsync() для async multi contributions у 0.0.2, чи достатньо sync contribution object із async methods?
- Чи має adapter API підтримувати fromAll(MULTI_TOKEN) у 0.0.2, чи це окремий 0.0.3 scope?
- Чи має child scope автоматично dispose-ити active children при parent.dispose(), чи parent.dispose() має падати при dangling child scopes?
- Чи треба окремий DiagnosticSeverity для adapter-aware cycles: error by default чи warning у першій версії?
- Чи має provide cardinality бути полем capability definition, чи краще окремі helpers provide() / provideMany()?
- Чи треба зробити MultiToken окремим nominal type, чи достатньо runtime metadata cardinality?

## 16. Рекомендований порядок реалізації

- Step 1: додати cardinality до capability metadata та graph model.
- Step 2: оновити validation для single/multi declaration conflicts.
- Step 3: протягнути public multi capabilities у composed runtime getAll().
- Step 4: додати post-setup registration validation для bind/add mismatch.
- Step 5: додати graph-aware composer.adapt().from().using() API.
- Step 6: оновити graph edges і diagnostics для adapter sources.
- Step 7: додати adapter-aware cycle detection.
- Step 8: додати createChildScope()/withChildScope().
- Step 9: додати testing helpers.
- Step 10: оновити docs і examples: admin contributions, auth adapter, transaction child scope.

## 17. Definition of done для 0.0.2

- Усі нові APIs мають tests, type tests і docs examples.
- Existing 0.0.1 examples проходять без змін.
- Composer diagnostics залишаються deterministic.
- No decorators, no reflect-metadata, no filesystem discovery, no hidden factory execution.
- Site-engine architecture lab can implement admin catalog, permission registry, auth adapter і transaction child scope без custom graph hacks.
- formatDiagnostics() produces useful messages for the new diagnostics.
- ioc-testing supports the new graph assertions so downstream projects do not invent їх у кожному репозиторії з нуля, бо ми ж не в кам’яному віці, хоча іноді npm натякає протилежне.

## 18. Враховані джерела

- Repository README: https://github.com/sagifire/ioc
- Composer docs: https://github.com/sagifire/ioc/blob/master/docs/composer.md
- Modules docs: https://github.com/sagifire/ioc/blob/master/docs/modules.md
- Container docs: https://github.com/sagifire/ioc/blob/master/docs/container.md
- Next integration package: https://github.com/sagifire/ioc/tree/master/packages/ioc-next
- Testing package: https://github.com/sagifire/ioc/tree/master/packages/ioc-testing
