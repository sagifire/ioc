Я перезібрав порівняння **за фактично реалізованою публічною поверхнею `@sagifire/ioc 0.0.2`**, а не за початковим технічним завданням. Це важлива поправка: редизайн уже реалізував child scopes, eager/lazy async providers, async resources, capability gating, cardinality-aware multi-capabilities, graph-aware adapters, статичну валідацію, inspection API та окремий testing toolkit. Початкова специфікація лише задавала цей напрямок. 

Сам workspace має manifests версії `0.0.2` і підготовлений до релізу, але фактична публікація в npm ще позначена як окремо контрольований крок. Тому нижче порівнюється **функціональна повнота**, а не adoption чи production track record.

Позначення:

* ✅ first-class, явно підтримувана можливість
* ◐ часткова підтримка, аналогічна семантика або ручна реалізація
* ❌ немає як документованої first-class можливості
* ≠ інша програмна модель, пряме порівняння вводить в оману

## 1. Container, scopes та lifecycle

| Можливість                                  | Sagifire 0.0.2 | NestJS | Effect | Inversify 8 | Awilix | TSyringe | Brandi | typed-inject |
| ------------------------------------------- | :------------: | :----: | :----: | :---------: | :----: | :------: | :----: | :----------: |
| Framework-agnostic core                     |        ✅       |    ❌   |    ✅   |      ✅      |    ◐   |     ✅    |    ✅   |       ✅      |
| Не вимагає decorators                       |        ✅       |    ❌   |    ✅   |      ◐      |    ✅   |     ❌    |    ✅   |       ✅      |
| Не вимагає `reflect-metadata`               |        ✅       |    ❌   |    ✅   |      ◐      |    ✅   |     ❌    |    ✅   |       ✅      |
| Generic typed token                         |        ✅       |    ◐   |    ✅   |      ◐      |    ❌   |     ◐    |    ✅   |       ◐      |
| Стабільний runtime token ID                 |        ✅       |    ◐   |    ✅   |      ◐      |    ❌   |     ◐    |    ◐   |       ◐      |
| Immutable runtime після конфігурації        |        ✅       |    ◐   |    ✅   |      ❌      |    ❌   |     ❌    |    ❌   |       ✅      |
| Singleton lifetime                          |        ✅       |    ✅   |    ◐   |      ✅      |    ✅   |     ✅    |    ✅   |       ✅      |
| Transient lifetime                          |        ✅       |    ✅   |    ◐   |      ✅      |    ✅   |     ✅    |    ✅   |       ✅      |
| Scoped lifetime                             |        ✅       |    ✅   |    ✅   |      ✅      |    ✅   |     ✅    |    ✅   |       ◐      |
| Scope-local single values                   |        ✅       |    ◐   |    ✅   |      ✅      |    ✅   |     ✅    |    ✅   |       ✅      |
| Scope-local multi-values                    |        ✅       |    ❌   |    ◐   |      ◐      |    ❌   |     ◐    |    ❌   |       ❌      |
| Child scopes / hierarchical scopes          |        ✅       |    ◐   |    ✅   |      ✅      |    ✅   |     ✅    |    ✅   |       ✅      |
| Child value inheritance та overlays         |        ✅       |    ◐   |    ✅   |      ✅      |    ✅   |     ✅    |    ✅   |       ✅      |
| Окремий scoped provider cache у child scope |        ✅       |    ◐   |    ✅   |      ✅      |    ✅   |     ✅    |    ✅   |       ✅      |
| Автоматичне disposal дочірніх scopes        |        ✅       |    ◐   |    ✅   |      ❌      |    ❌   |     ❌    |    ❌   |       ✅      |
| `withScope()` / bracket-style helper        |        ✅       |    ◐   |    ✅   |      ❌      |    ❌   |     ❌    |    ❌   |       ◐      |
| Runtime не веде прихований current scope    |        ✅       |    ❌   |    ◐   |      ✅      |    ✅   |     ❌    |    ✅   |       ✅      |

У `0.0.2` scope є не просто кешем request-lifetime. Child scope наслідує локальні значення, може shadow-ити single values, доповнювати multi-values, має власний scoped cache і автоматично знищується разом із parent scope. Це вже ближче до керованого operation context, ніж до звичайного `request scoped provider`.

NestJS має `DEFAULT`, `REQUEST` і `TRANSIENT` scopes, а також DI subtrees через `ContextId`, але ця модель прив’язана до Nest runtime і значною мірою керується фреймворком. ([docs.nestjs.com][1])

Inversify, Awilix, TSyringe, Brandi та typed-inject мають container hierarchy або child containers, але лише typed-inject так само явно каскадно dispose-ить child injectors. Inversify натомість залишається mutable container із `rebind`, `unbind`, snapshots і parent containers. ([inversify.io][2])

---

## 2. Sync/async модель та ресурси

| Можливість                                                | Sagifire 0.0.2 | NestJS | Effect | Inversify 8 | Awilix | TSyringe | Brandi | typed-inject |
| --------------------------------------------------------- | :------------: | :----: | :----: | :---------: | :----: | :------: | :----: | :----------: |
| `get()` ніколи не запускає async resolution               |        ✅       |    ◐   |    ≠   |      ✅      |    ❌   |     ❌    |    ❌   |       ❌      |
| Окремий `getAsync()`                                      |        ✅       |    ❌   |    ≠   |      ✅      |    ❌   |     ❌    |    ❌   |       ❌      |
| Окремий `tryGetAsync()`                                   |        ✅       |    ❌   |    ≠   |      ✅      |    ❌   |     ❌    |    ❌   |       ❌      |
| Виявлення Promise із sync factory                         |        ✅       |    ❌   |    ≠   |      ◐      |    ❌   |     ❌    |    ❌   |       ❌      |
| Lazy async provider                                       |        ✅       |    ◐   |    ✅   |      ✅      |    ◐   |     ❌    |    ◐   |       ◐      |
| Eager async provider                                      |        ✅       |    ✅   |    ✅   |      ❌      |    ❌   |     ❌    |    ❌   |       ❌      |
| Eager provider доступний через sync `get()`               |        ✅       |    ◐   |    ≠   |      ❌      |    ❌   |     ❌    |    ❌   |       ❌      |
| In-flight async initialization deduplication              |        ✅       |    ✅   |    ✅   |      ◐      |    ❌   |     ❌    |    ❌   |       ❌      |
| Retry після failed lazy initialization                    |        ✅       |    ◐   |    ✅   |      ◐      |    ◐   |     ❌    |    ❌   |       ◐      |
| Retry `freeze()` після failed eager init                  |        ✅       |    ❌   |    ◐   |      ≠      |    ≠   |     ≠    |    ≠   |       ≠      |
| Async resource як `{ value, dispose }`                    |        ✅       |    ❌   |    ✅   |      ❌      |    ❌   |     ❌    |    ❌   |       ❌      |
| Singleton resource ownership                              |        ✅       |    ◐   |    ✅   |      ◐      |    ✅   |     ✅    |    ❌   |       ✅      |
| Scoped resource ownership                                 |        ✅       |    ❌   |    ✅   |      ◐      |    ✅   |     ◐    |    ❌   |       ✅      |
| Reverse-order disposal                                    |        ✅       |    ◐   |    ✅   |      ◐      |    ◐   |     ◐    |    ❌   |       ✅      |
| Cleanup частково створених resources після failed startup |        ✅       |    ◐   |    ✅   |      ❌      |    ❌   |     ❌    |    ❌   |       ❌      |
| Idempotent runtime/scope disposal                         |        ✅       |    ◐   |    ✅   |      ◐      |    ◐   |     ◐    |    ❌   |       ◐      |
| Async multi-provider resolution                           |        ❌       |    ❌   |    ◐   |      ✅      |    ❌   |     ❌    |    ❌   |       ❌      |

Тут редизайн радикально змінив позицію бібліотеки. `@sagifire/ioc` тепер має одну з найчіткіших async-моделей серед класичних TypeScript IoC libraries:

```text
sync provider       -> get()
async eager         -> freeze(), потім get()
async lazy          -> getAsync()
async resource      -> getAsync() + кероване dispose()
```

`get()` не перетворюється на Schrödinger API, який у понеділок повертає об’єкт, а у вівторок Promise, бо хтось “лише трохи” змінив factory. Sync factory, яка повернула thenable, завершується окремою помилкою. Failed initialization не кешується, concurrent initialization дедуплікується, а partially initialized resources очищуються при failed `freeze()`.

Effect залишається сильнішим у загальній моделі structured concurrency, interruption і scoped finalizers, але це вже повноцінна effect system, а не drop-in IoC toolkit. Його dependencies кодуються в `Effect<Success, Error, Requirements>`, `Layer` представляє dependency graph, а `Scope` керує finalizers. ([Effect][3])

Inversify має `getAsync()` і навіть `getAllAsync()`, чого наразі бракує Sagifire, але не має еквівалента `freeze()` з eager resource initialization та rollback cleanup. Його lifecycle побудований переважно навколо activation/deactivation і unbinding. ([inversify.io][2])

### Реальний недолік `0.0.2`

Найпомітніша runtime-функція, де Inversify випереджає Sagifire:

```text
getAllAsync()
async multi-provider contributions
```

У поточному core `add()` підтримує лише синхронні `toValue()` і `toFactory()`. Це прямо зафіксовано в документації, а не приховано під килимом із написом “future enhancement”.

---

## 3. Multi-provider та advanced binding features

| Можливість                              | Sagifire 0.0.2 |    NestJS    | Effect | Inversify 8 | Awilix |  TSyringe | Brandi | typed-inject |
| --------------------------------------- | :------------: | :----------: | :----: | :---------: | :----: | :-------: | :----: | :----------: |
| First-class multi-provider              |        ✅       |       ❌      |    ❌   |      ✅      |    ❌   |     ✅     |    ❌   |       ❌      |
| Розділені `bind()` та `add()`           |        ✅       |       ❌      |    ❌   |      ❌      |    ❌   |     ❌     |    ❌   |       ❌      |
| Explicit single/multi cardinality       |        ✅       |       ❌      |    ❌   |      ❌      |    ❌   |     ❌     |    ❌   |       ❌      |
| `get()` заборонений для multi token     |        ✅       |       ❌      |    ≠   |      ✅      |    ≠   |     ◐     |    ≠   |       ≠      |
| `getAll()` заборонений для single token |        ✅       |       ❌      |    ≠   |      ❌      |    ≠   |     ❌     |    ≠   |       ≠      |
| Required multi dependency               |        ✅       |       ❌      |    ❌   |      ❌      |    ❌   |     ❌     |    ❌   |       ❌      |
| Optional multi dependency → `[]`        |        ✅       |       ❌      |    ◐   |      ✅      |    ❌   |     ✅     |    ❌   |       ❌      |
| Composition-root contributions          |        ✅       |       ◐      |    ◐   |      ✅      |    ◐   |     ✅     |    ◐   |       ◐      |
| Ordered contribution catalog            |        ✅       |       ◐      |    ◐   |      ✅      |    ❌   |     ✅     |    ❌   |       ❌      |
| Named bindings                          |        ❌       |       ◐      |    ❌   |      ✅      |    ✅   |     ✅     |    ◐   |       ✅      |
| Tagged/conditional bindings             |        ❌       |       ◐      |    ◐   |      ✅      |    ❌   |     ◐     |    ✅   |       ❌      |
| Provider alias                          |        ❌       |       ✅      |    ◐   |      ✅      |    ✅   |     ✅     |    ◐   |       ◐      |
| Activation hooks                        |        ❌       |       ✅      |    ◐   |      ✅      |    ❌   |     ✅     |    ◐   |       ❌      |
| Resolution interception                 |        ❌       |       ✅      |    ◐   |      ✅      |    ❌   |     ✅     |    ❌   |       ❌      |
| Lazy proxy для обходу циклу             |        ❌       | `forwardRef` |    ◐   |      ✅      |    ✅   | `delay()` |    ❌   |       ❌      |

У Sagifire multi-provider став частиною **архітектурного контракту**, а не просто ситуацією, коли контейнер випадково дозволив зареєструвати два bindings. Module metadata визначає `cardinality: 'single' | 'multi'`, composer перевіряє відповідність `bind()`/`add()`, а composed runtime блокує неправильні `get()`/`getAll()` виклики.

Водночас Inversify має ширшу класичну binding surface: named/tagged constraints, activation/deactivation, aliases, async multi-resolution та mutable reconfiguration. TSyringe також має `injectAll`, child containers, resolution hooks і disposable instances. ([inversify.io][2])

Отже:

* **Sagifire сильніший у correctness і семантиці collection contracts.**
* **Inversify сильніший у кількості low-level container tricks.**

Це не однакова цінність. Набір трюків добре продає README, а correctness краще переживає третій рік розробки, коли ніхто вже не пам’ятає, чому п’ять bindings мають однаковий symbol.

---

## 4. Module composition та архітектурні межі

| Можливість                                       | Sagifire 0.0.2 |       NestJS      |      Effect      | Inversify 8 | Awilix | TSyringe | Brandi |   typed-inject  |
| ------------------------------------------------ | :------------: | :---------------: | :--------------: | :---------: | :----: | :------: | :----: | :-------------: |
| Явні application modules                         |        ✅       |         ✅         |         ◐        |      ◐      |    ❌   |     ❌    |    ◐   |        ❌        |
| Module ID/version/metadata                       |        ✅       |         ◐         |         ❌        |      ❌      |    ❌   |     ❌    |    ❌   |        ❌        |
| Явний список `requires`                          |        ✅       |         ◐         |  ✅ у type-level  |      ❌      |    ❌   |     ❌    |    ❌   |        ◐        |
| Явний список `provides`                          |        ✅       | ✅ через `exports` | ✅ у layer output |      ❌      |    ❌   |     ❌    |    ◐   |        ❌        |
| Семантичні capability kinds                      |        ✅       |         ❌         |         ❌        |      ❌      |    ❌   |     ❌    |    ❌   |        ❌        |
| Module-private providers                         |        ✅       |         ✅         |         ◐        |      ❌      |    ❌   |     ❌    |    ◐   |        ❌        |
| Capability-gated application runtime             |        ✅       |         ◐         |         ◐        |      ❌      |    ❌   |     ❌    |    ◐   |        ❌        |
| Required ports не стають public API              |        ✅       |         ❌         |         ◐        |      ❌      |    ❌   |     ❌    |    ❌   |        ❌        |
| Consumer-owned required ports                    |        ✅       |         ❌         |         ◐        |      ❌      |    ❌   |     ❌    |    ❌   |        ◐        |
| Application-level port bindings                  |        ✅       |         ◐         |         ✅        |      ◐      |    ◐   |     ◐    |    ◐   |        ◐        |
| Explicit port adapters                           |        ✅       |         ◐         |         ◐        |      ◐      |    ❌   |     ◐    |    ❌   |        ◐        |
| Adapter source є частиною graph metadata         |        ✅       |         ❌         |         ❌        |      ❌      |    ❌   |     ❌    |    ❌   |        ❌        |
| Adapter може мати кілька explicit sources        |        ✅       |         ◐         |         ✅        |      ◐      |    ◐   |     ◐    |    ◐   |        ◐        |
| Composer не виконує factories під час validation |        ✅       |         ❌         |         ◐        |      ❌      |    ❌   |     ❌    |    ❌   | ✅ на type-level |
| Object API як first-class API                    |        ✅       |         ◐         |         ✅        |      ✅      |    ✅   |     ✅    |    ✅   |        ✅        |
| Optional DSL поверх того самого engine           |        ✅       |         ❌         |   ✅ combinators  |      ❌      |    ❌   |     ❌    |    ❌   |        ❌        |

Це головна зона, де `0.0.2` перестала бути “ще одним DI container”.

### Найсильніша відмінність

```text
consumer module owns required port
provider module owns public capability
composition root owns adaptation
```

При цьому adapter:

```ts
composer
    .adapt(CONTACT_AUTH_READER)
    .from(AUTH_PUBLIC_API)
    .using(auth => createAuthReader(auth))
```

не просто створює factory. Він додає явний `adapter-source` edge до dependency graph. Factory отримує тільки задекларовані source values, а не універсальний resolver, із якого можна витягнути половину application runtime і потім удавати, що архітектура все ще модульна.

NestJS має справжню module encapsulation: provider локальний для модуля, доки його не додано в `exports`. Це найближчий конкурент у цій зоні. Але залежності між модулями задаються через `imports` і звичайну injection-модель, а не через consumer-owned ports та окремі application adapters. ([docs.nestjs.com][4])

Brandi має `DependencyModule` і дозволяє явно імпортувати вибрані tokens через `container.use(...tokens).from(module)`. Це чистий і цікавий механізм, але модуль не оголошує required ports, capability kinds, cardinality чи graph edges. ([brandi.js.org][5])

Inversify `ContainerModule` фактично є групою bindings для load/unload. Він допомагає організувати великий container, але не створює application-level module contract. ([inversify.io][6])

---

## 5. Graph validation, inspection та diagnostics

| Можливість                               | Sagifire 0.0.2 |   NestJS   |      Effect      | Inversify 8 |      Awilix     |  TSyringe |   Brandi  | typed-inject |
| ---------------------------------------- | :------------: | :--------: | :--------------: | :---------: | :-------------: | :-------: | :-------: | :----------: |
| Validation до compose/bootstrap          |        ✅       |      ❌     |   ✅ type-level   |      ❌      |        ❌        |     ❌     |     ❌     | ✅ type-level |
| Side-effect-free static validation       |        ✅       |      ❌     |         ◐        |      ❌      |        ❌        |     ❌     |     ❌     |       ✅      |
| Missing required port report             |        ✅       |  ◐ runtime |    ✅ compiler    |  ◐ runtime  |    ◐ runtime    | ◐ runtime | ◐ runtime |  ✅ compiler  |
| Duplicate module ID validation           |        ✅       |      ◐     |         ≠        |      ≠      |        ≠        |     ≠     |     ≠     |       ≠      |
| Capability registration validation       |        ✅       |      ◐     |         ◐        |      ❌      |        ❌        |     ❌     |     ❌     |       ❌      |
| Cardinality conflict validation          |        ✅       |      ❌     |         ❌        |      ❌      |        ❌        |     ❌     |     ❌     |       ❌      |
| Private provider access validation       |        ✅       |      ◐     |         ◐        |      ❌      |        ❌        |     ❌     |     ◐     |       ❌      |
| Adapter source validation                |        ✅       |      ❌     |         ❌        |      ❌      |        ❌        |     ❌     |     ❌     |       ❌      |
| Provider cycle detection                 |        ✅       |      ✅     |         ◐        |      ✅      |        ✅        |     ◐     |     ◐     |       ✅      |
| Provider cycle path                      |        ✅       |      ◐     |         ◐        |      ✅      |        ✅        |     ◐     |     ◐     |       ✅      |
| Module dependency cycle detection        |        ✅       |      ◐     |         ◐        |      ❌      |        ❌        |     ❌     |     ❌     |       ❌      |
| Module cycle path з edge kinds           |        ✅       |      ❌     |         ❌        |      ❌      |        ❌        |     ❌     |     ❌     |       ❌      |
| Public graph inspection API              |        ✅       | ◐ Devtools |         ❌        |      ❌      | ◐ registrations |     ❌     |     ❌     |       ❌      |
| Required-port satisfaction metadata      |        ✅       |      ❌     |         ❌        |      ❌      |        ❌        |     ❌     |     ❌     |       ❌      |
| Typed diagnostic errors                  |        ✅       |      ◐     | ✅ general errors |      ◐      |        ◐        |     ◐     |     ◐     |       ✅      |
| Stable machine-readable diagnostic codes |        ✅       |      ❌     |         ❌        |      ❌      |        ❌        |     ❌     |     ❌     |       ❌      |
| Deterministic `DiagnosticReport`         |        ✅       |      ❌     |         ❌        |      ❌      |        ❌        |     ❌     |     ❌     |       ❌      |
| Safe inspection без provider values      |        ✅       |      ◐     |         ◐        |      ❌      |        ❌        |     ❌     |     ❌     |       ❌      |

`composer.validate()`, `getGraph()` та `inspect()` читають лише explicit metadata. Вони не запускають factories чи async resources для вгадування залежностей. Graph включає modules, required ports, capabilities, bindings та edges трьох типів:

```text
capability
binding
adapter-source
```

Composed runtime додатково показує фактичні registration summaries, але не розкриває private provider values або scope-local data.

Diagnostics мають стабільні коди, structured details і deterministic plain-text formatter. Module cycle містить `moduleIdPath`, `tokenIdPath` та `edgeKinds`. Це не просто `Cannot resolve dependency`, після якого програміст починає приносити жертви TypeScript compiler.

### Хто тут реально конкурує

**Effect** сильніший у compile-time dependency requirements: потрібні services відображаються безпосередньо в type parameter, а Layer формує dependency graph. Але він не дає аналогічного публічного metadata graph для application modules, ports, adapters і capabilities. ([Effect][3])

**typed-inject** теж має сильну compile-time перевірку context tokens і дуже хороші runtime error paths. Але це граф injector chain, а не inspectable modular application graph. ([GitHub][7])

Отже, Sagifire наразі має рідкісну комбінацію:

```text
runtime-flexible JavaScript composition
+ explicit metadata
+ static validation
+ inspectable module graph
+ deterministic diagnostics
```

---

## 6. Testing

| Можливість                          | Sagifire 0.0.2 | NestJS |      Effect      |    Inversify 8    | Awilix |         TSyringe        |       Brandi      | typed-inject |
| ----------------------------------- | :------------: | :----: | :--------------: | :---------------: | :----: | :---------------------: | :---------------: | :----------: |
| Окремий first-party testing package |        ✅       |    ✅   |         ◐        |         ❌         |    ❌   |            ❌            |         ❌         |       ❌      |
| Fresh isolated test runtime         |        ✅       |    ✅   |         ✅        |         ◐         |    ◐   |            ◐            |         ◐         |       ✅      |
| Overrides до freeze/compose         |        ✅       |    ✅   |         ✅        |         ◐         |    ◐   |            ◐            |         ◐         |       ✅      |
| Production runtime не мутується     |        ✅       |    ✅   |         ✅        | ❌ snapshot/rebind |    ◐   | ❌ global container risk | ❌ capture/restore |       ✅      |
| Async provider override             |        ✅       |    ✅   |         ✅        |         ✅         |    ◐   |            ◐            |         ◐         |       ◐      |
| Multi append/replace helpers        |        ✅       |    ❌   |         ◐        |         ◐         |    ❌   |            ◐            |         ❌         |       ❌      |
| Fake modules                        |        ✅       |    ✅   |   ✅ test layers  |         ❌         |    ❌   |            ❌            |      ◐ вручну     |       ❌      |
| Single-module harness               |        ✅       |    ✅   |         ◐        |         ❌         |    ❌   |            ❌            |         ◐         |       ❌      |
| Graph assertions                    |        ✅       |    ❌   |         ❌        |         ❌         |    ❌   |            ❌            |         ❌         |       ❌      |
| Diagnostic assertions               |        ✅       |    ◐   | ✅ general errors |         ❌         |    ❌   |            ❌            |         ❌         |       ◐      |
| Child-scope assertions              |        ✅       |    ❌   |         ❌        |         ❌         |    ❌   |            ❌            |         ❌         |       ❌      |
| Не залежить від Vitest internals    |        ✅       |    ≠   |         ≠        |         ≠         |    ≠   |            ≠            |         ≠         |       ≠      |

`@sagifire/ioc-testing` уже містить:

* isolated runtime і composer factories;
* single та multi overrides;
* append/replace multi-contributions;
* fake modules;
* module harness;
* graph assertions;
* adapter-source assertions;
* child-scope assertions;
* diagnostic assertions.

Усе це працює через публічні API та не patch-ить frozen runtime.

Це вже одна з найсильніших диференціацій продукту. NestJS має зрілу testing infrastructure, Effect чудово замінює Layers, але серед standalone TypeScript IoC libraries окремий toolkit для перевірки **самої архітектури composition graph** є нетиповим.

---

## 7. Framework integration та packaging

| Можливість                             | Sagifire 0.0.2 |       NestJS      | Effect | Inversify 8 |   Awilix  | TSyringe | Brandi | typed-inject |
| -------------------------------------- | :------------: | :---------------: | :----: | :---------: | :-------: | :------: | :----: | :----------: |
| Next.js App Router first-party package |        ✅       |         ❌         |    ❌   |      ❌      |     ❌     |     ❌    |    ❌   |       ❌      |
| Cached application runtime helper      |        ✅       | framework runtime |    ❌   |      ❌      |     ❌     |     ❌    |    ❌   |       ❌      |
| Route scope helper                     |        ✅       | framework-managed |    ❌   |      ❌      | ecosystem |     ❌    |    ❌   |       ❌      |
| Server Action scope helper             |        ✅       |         ❌         |    ❌   |      ❌      |     ❌     |     ❌    |    ❌   |       ❌      |
| Explicit request/action context values |        ✅       |         ◐         |    ✅   |      ◐      |     ✅     |     ◐    |    ◐   |       ✅      |
| Scope disposal у `finally`             |        ✅       | framework-managed |    ✅   |      ❌      |   вручну  |  вручну  | вручну |    вручну    |
| Core не імпортує framework             |        ✅       |         ❌         |    ✅   |      ✅      |     ✅     |     ✅    |    ✅   |       ✅      |
| Adapter не ховає current request/scope |        ✅       |         ❌         |    ◐   |      ≠      |     ≠     |     ≠    |    ≠   |       ≠      |
| ESM-first                              |        ✅       |         ◐         |    ✅   |      ✅      |     ◐     |     ◐    |    ✅   |       ✅      |
| `sideEffects: false`                   |        ✅       |         ◐         |    ✅   |      ◐      |     ◐     |     ◐    |    ◐   |       ◐      |
| Tree-shaking subpath exports           |        ✅       |         ◐         |    ✅   |      ◐      |     ❌     |     ❌    |    ◐   |       ❌      |
| Node-free core                         |        ✅       |         ❌         |    ✅   |      ✅      |     ◐     |     ✅    |    ✅   |       ✅      |

`@sagifire/ioc-next` навмисно дуже тонкий: cached runtime, explicit request context, one scope per route/action invocation і гарантоване disposal. Пакет навіть не імпортує Next.js або React types, тобто інтеграція не перетворює core на ще один framework appendix.

Core має ESM packaging, `sideEffects: false` і окремі exports для tokens, container, context, composer, DSL, diagnostics та lifecycle.

---

# Підсумок за категоріями

| Категорія                                         | Найсильніші рішення       |
| ------------------------------------------------- | ------------------------- |
| Класичний decorator-based backend DI              | **NestJS**                |
| Найширша low-level container surface              | **InversifyJS**           |
| Простий pragmatic Node DI                         | **Awilix**                |
| Lightweight decorator constructor injection       | **TSyringe**              |
| Чистий typed token container без decorators       | **Brandi**                |
| Compile-time injector chain safety                | **typed-inject**          |
| Typed effects, resources і structured concurrency | **Effect**                |
| Explicit modular composition та graph governance  | **`@sagifire/ioc 0.0.2`** |
| Diagnostics і architecture-level testing          | **`@sagifire/ioc 0.0.2`** |
| Next.js App Router modular composition            | **`@sagifire/ioc 0.0.2`** |

# Що змінилося відносно попередньої оцінки

Попередня таблиця показувала Sagifire як перспективний дизайн, який переважно ще треба реалізувати. Після `0.0.2` ситуація інша.

## Тепер Sagifire вже випереджає classic DI libraries у таких зонах

1. **Явне розділення single та multi contracts.**
2. **Consumer-owned required ports.**
3. **Capability-gated runtime.**
4. **Graph-aware application adapters.**
5. **Side-effect-free module graph validation.**
6. **Machine-readable deterministic diagnostics.**
7. **Public graph inspection.**
8. **Testing helpers для graph, diagnostics і module boundaries.**
9. **Child-scope overlays та керований lifecycle.**
10. **Чітка eager/lazy async boundary без Promise leakage у `get()`.**

## Де конкуренти все ще сильніші

### Inversify

* `getAllAsync()`;
* async multi-bindings;
* named і tagged constraints;
* activation/deactivation hooks;
* aliases;
* plugins;
* mutable runtime reconfiguration.

### NestJS

* величезна готова framework ecosystem;
* controllers, guards, interceptors, transports, CLI;
* production maturity;
* conventions та знайомість команд.

### Effect

* compile-time requirements;
* typed error channel;
* structured concurrency;
* cancellation/interruption;
* більш глибока resource safety;
* Layer memoization і повноцінний effect runtime.

### Awilix

* дуже низький поріг входу;
* простий cradle-based DX;
* auto-loading;
* established Node.js use cases.

### typed-inject

* dependency availability сильніше переноситься в compile-time;
* persistent injector composition;
* хороший child-first disposal.

---

# Реальні прогалини `0.0.2`

Наступні можливості можуть бути корисними, але не всі варто додавати. Інакше бібліотека рано чи пізно стане Inversify, тільки з іншим логотипом, а це сумнівна життєва мета.

## Високий пріоритет

### 1. Async multi-providers

```ts
add(TOKEN).toAsyncFactory(...)
runtime.getAllAsync(TOKEN)
```

Це логічне продовження вже сильної cardinality-моделі.

### 2. Alias binding

Простий identity-preserving alias:

```ts
composer.bind(PORT).toAlias(PUBLIC_API)
```

Він не повинен замінювати adapters, але корисний, коли контракт ідентичний і створювати новий wrapper безглуздо.

### 3. Lifetime dependency validation

Awilix strict mode виявляє, коли singleton захоплює scoped або transient dependency. Для Sagifire це природно лягає в diagnostics:

```text
singleton -> scoped
singleton -> transient resource
```

Частину цього можна перевіряти лише під час resolution, але readable error усе одно цінний.

## Середній пріоритет

* optional activation/deactivation hooks;
* provider aliases;
* named variants через окремі tokens або qualifiers;
* richer graph export у JSON/DOT/Mermaid;
* compile-time helpers для typed module contracts.

## Не варто поспішати додавати

* filesystem auto-discovery;
* constructor parameter parsing;
* global current scope;
* automatic class binding;
* proxies для маскування dependency cycles;
* довільні runtime plugins;
* decorator API.

Ці речі додають demo magic і забирають передбачуваність. Обмін так собі.

# Оновлений стратегічний висновок

Після редизайну `@sagifire/ioc 0.0.2` уже некоректно називати просто DI container.

Найточніше позиціонування:

> **A TypeScript-native composition kernel for explicit modular applications, with immutable runtimes, scoped resources, consumer-owned ports, public capabilities, inspectable dependency graphs and deterministic diagnostics.**

Для практичного ринку:

> **Build Nest-like modular architecture without adopting a framework or decorators.**

Для Next.js:

> **Explicit backend-grade module composition for Next.js App Router.**

Для AI-assisted development:

> **A dependency composition model that humans and coding agents can inspect, validate and test.**

Найближчі конкуренти після `0.0.2` тепер розподіляються так:

```text
NestJS
    головний конкурент за module architecture,
    але framework-bound

Effect
    головний концептуальний конкурент
    за dependency graph і resource lifecycle,
    але вимагає Effect programming model

InversifyJS
    головний конкурент за container capabilities,
    але без application composition governance

Brandi / typed-inject
    найближчі за explicit typed DI без decorators,
    але значно слабші за module graph та diagnostics
```

Головна конкурентна перевага `0.0.2` уже не в тому, що контейнер “чистіший”. Вона в тому, що бібліотека контролює **архітектурну композицію застосунку**, залишаючись звичайним TypeScript toolkit, а не фреймворком або альтернативною мовою всередині TypeScript. Це значно сильніша ринкова позиція.

[1]: https://docs.nestjs.com/fundamentals/injection-scopes "Injection scopes | NestJS - A progressive Node.js framework"
[2]: https://inversify.io/docs/api/container/ "Container | InversifyJS"
[3]: https://effect.website/docs/requirements-management/services/ "Managing Services | Effect Documentation"
[4]: https://docs.nestjs.com/fundamentals/custom-providers "Custom providers | NestJS - A progressive Node.js framework"
[5]: https://brandi.js.org/reference/dependency-modules "Dependency Modules | Brandi"
[6]: https://inversify.io/docs/api/container-module/ "Container Module | InversifyJS"
[7]: https://github.com/nicojs/typed-inject "GitHub - nicojs/typed-inject: Type safe dependency injection for TypeScript · GitHub"
