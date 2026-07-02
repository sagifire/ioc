# Дослідження: RSCH-001

Статус: done
Створено: 2026-07-02
Оновлено: 2026-07-02
Роль агента: Agent Researcher
Режим виконання: autonomous-research
Мова звіту: українська

## Призначення

Підготувати pre-`0.0.1` звіт аудиту для Етапу 16 перед фіксацією версії
`0.0.1`.

## Висновок

Кодова база загалом відповідає заявленій архітектурі: core-пакет не імпортує
Next.js/React/Node-only API, `@sagifire/ioc-next` і `@sagifire/ioc-testing` залишаються
окремими пакетами, локальний `pnpm release:validate` проходить, dry-run пакування перевіряє
запаковані артефакти, а всі приклади компілюються і виконуються.

Знайдено 1 критичну знахідку, яка блокує передавання `0.0.1` до виправлення:
релізний workflow використовує непідтверджений `changesets/action@v2`, тоді як доступні
публічні tags для `changesets/action` показують лінійку `v1`, а не стабільний `v2`.

Також знайдено високі і середні поведінкові ризики в core runtime/composer validation, які
не блокують релізний workflow самі по собі, але мають бути розглянуті до або одразу після
закриття критичної знахідки.

## Обсяг аудиту

Перевірено:

- Project Memory контекст Stage 16: `state.md`, requirements, roadmap, architecture,
  stack, technical rules, testing requirements, definition of done і Stage 16 fixation.
- Вихідний код:
  - `packages/ioc/src/tokens.ts`;
  - `packages/ioc/src/container.ts`;
  - `packages/ioc/src/context.ts`;
  - `packages/ioc/src/composer.ts`;
  - `packages/ioc/src/dsl.ts`;
  - `packages/ioc/src/diagnostics.ts`;
  - `packages/ioc/src/lifecycle.ts`;
  - `packages/ioc-next/src/index.ts`;
  - `packages/ioc-testing/src/index.ts`.
- Runtime/type-тести у `packages/*/test` і кореневому `test/`.
- Маніфести пакетів, package exports, конфігурації `tsup` і скрипт перевірки запакованих
  артефактів.
- Документація і приклади в `README.md`, `docs/`, `packages/*/README.md`, `examples/`.
- CI і релізні workflows: `.github/workflows/ci.yml` та `.github/workflows/release.yml`.
- Changesets config and current version/changelog state.

Не редагувались:

- source code;
- документація/приклади;
- package versions;
- changelogs;
- workflows;
- `memory/sources/SPEC.md`.

## Перевірки і команди

Успішно:

- `git -c safe.directory=D:/work/ioc status --short` - перед звітом показує тільки зміни
  task-memory поточного audit.
- `node --version` - `v24.17.0`.
- `pnpm --version` - `11.7.0`.
- `pnpm release:validate` - успішно; включило build, typecheck, format, lint, тести і
  dry-run перевірку пакування.
- `vitest run` всередині `pnpm release:validate` - 19 test files, 211 tests passed.
- Dry-run пакування у `pnpm release:validate` - успішно спакувало і smoke-tested
  `@sagifire/ioc`, `@sagifire/ioc-next`, `@sagifire/ioc-testing`.
- Фокусована компіляція через `.\node_modules\.bin\tsc.cmd -p ... --pretty false` для:
  - `examples/basic-node/tsconfig.run.json`;
  - `examples/module-composition/tsconfig.run.json`;
  - `examples/async-db-resource/tsconfig.run.json`;
  - `examples/testing-overrides/tsconfig.run.json`;
  - `examples/next-app-router/tsconfig.run.json`.
- Виконання прикладів через `node .tmp/examples/...`:
  - `basic-node`;
  - `module-composition`;
  - `async-db-resource`;
  - `testing-overrides`;
  - `next-app-router`.
- Цільова runtime-перевірка duplicate composer binding підтвердила:
  - `composer.validate()` повертає `{ ok: true, codes: [] }`;
  - `composer.compose()` падає з `DuplicateProviderError`.
- Цільова runtime-перевірка sync factory підтвердила, що `runtime.get()` може повернути
  Promise, якщо JavaScript/untyped caller передає promise-returning factory у `toFactory()`.
- Цільова runtime-перевірка failed eager async provider підтвердила, що повторний
  `container.freeze()` повертає ту саму rejection і не робить retry.

Команди з обмеженнями:

- `git status --short` без `-c safe.directory=D:/work/ioc` не виконується через локальний
  Git safe-directory захист; audit використовував read-only `-c safe.directory=...`.
- `pnpm exec tsc -p examples/*/tsconfig.run.json --pretty false` у цьому PowerShell
  середовищі повертає `'tsc' is not recognized`; прямий запуск
  `.\node_modules\.bin\tsc.cmd` проходить.
- `pnpm changeset:status` повертає помилку `Failed to find where HEAD diverged from
  "master"` у локальному стані, де `HEAD` і `master` вказують на один commit
  `9db6b73`.

Зовнішня перевірка:

- Перевірено публічні сторінки GitHub для actions, які використовуються у workflows.
- `actions/checkout` має release `v7.0.0`.
- `actions/setup-node` має release `v6.0.0`.
- `pnpm/action-setup` має `v6.x` tags/releases.
- `changesets/action` tags page показує найновіші стабільні tags лінійки `v1`
  (`v1.8.0`, `v1.7.0`, `v1.6.0`), а сторінка releases показує `v2.0.0-next.*` як
  pre-release, не стабільний `v2` tag.

Джерела зовнішньої перевірки:

- <https://github.com/actions/checkout/releases>
- <https://github.com/actions/setup-node/releases>
- <https://github.com/pnpm/action-setup/releases>
- <https://github.com/changesets/action/tags>
- <https://github.com/changesets/action/releases>
- <https://github.com/changesets/action/tree/v1>

## Критичні знахідки

### C-001: релізний workflow посилається на непідтверджений `changesets/action@v2`

Критичність: `critical`

Зачеплені файли/модулі:

- `.github/workflows/release.yml`
- Stage 15/16 релізна автоматизація і передавання версії

Докази:

- `.github/workflows/release.yml:63-64`:
  - `Create release pull request`;
  - `uses: changesets/action@v2`.
- Публічна tags page `changesets/action` показує стабільні tags `v1.8.0`, `v1.7.0`,
  `v1.6.0`, але не показує стабільний `v2`.
- Публічна сторінка releases `changesets/action` показує `v2.0.0-next.*` як pre-release.
- README/usage сторінка `changesets/action` використовує `changesets/action@v1` у
  прикладі workflow.

Вплив:

- GitHub Actions release job на `master` може впасти на етапі завантаження action ще до
  створення Changesets release PR.
- Stage 16 `0.0.1` version fixation залежить від existing Changesets/release tooling.
  Якщо release PR automation не працює, передавання версії не є готовим до релізу.
- Локальний `pnpm release:validate` проходить, але він не перевіряє resolve зовнішніх
  GitHub Action refs.

Рекомендована наступна дія:

- У `TASK-07.02-0064` замінити `changesets/action@v2` на валідний стабільний ref,
  найімовірніше `changesets/action@v1`, або інший явно підтверджений стабільний tag.
- Після зміни виконати review/static validation для workflow і за можливості пройти dry path
  GitHub workflow.
- Додати lightweight workflow action-ref audit або documented release checklist, щоб
  локальна `release:validate` не створювала хибного відчуття повної готовності workflow.

## Високі знахідки

### H-001: `runtime.get()` може повернути Promise з sync `toFactory()` у JavaScript runtime

Критичність: `high`

Зачеплені файли/модулі:

- `packages/ioc/src/container.ts`
- `@sagifire/ioc` container runtime
- JavaScript-friendly usage path

Докази:

- `README.md:67-68` заявляє, що `runtime.get()` завжди синхронний, а async providers
  використовують `getAsync()`.
- `packages/ioc/src/container.ts:957-960` виконує sync provider factory і приймає
  повернуте значення без runtime перевірки thenable/Promise.
- Цільова runtime-перевірка:
  - `container.bind(VALUE).toFactory(() => Promise.resolve('async-from-sync'))`;
  - `runtime.get(VALUE)` повернув об'єкт з `then`, тобто Promise.

Вплив:

- TypeScript API зменшує ризик для typed users, але продукт заявлений як
  JavaScript-friendly.
- У JavaScript або при type escape користувач може випадково передати async factory у
  `toFactory()` і отримати Promise з `get()`, що порушує ключовий mental model sync/async
  boundary.
- Це може створити приховані production bugs, бо помилка не діагностується typed error-ом.

Рекомендована наступна дія:

- Прийняти явне рішення: або runtime забороняє thenable result із sync factory, або docs
  явно описують, що JS callers самі відповідають за не-async `toFactory()`.
- Якщо обирається runtime guard, додати typed error і tests для:
  - singleton sync factory returning Promise;
  - transient sync factory returning Promise;
  - scoped sync factory returning Promise;
  - multi-provider sync factory returning Promise;
  - `getAsync()` over sync factory returning Promise, якщо такий misuse має бути
    заборонений послідовно.
- Не ламати легітимний `toValue()` для token value, який сам є Promise, без окремого API
  рішення.

### H-002: `composer.validate()` дає false positive для duplicate binding

Критичність: `high`

Зачеплені файли/модулі:

- `packages/ioc/src/composer.ts`
- `@sagifire/ioc` composer validation and compose path

Докази:

- `packages/ioc/src/composer.ts:1879-1889` додає diagnostics для duplicate module IDs,
  duplicate capabilities, missing required ports, invalid binding targets and module
  cycles, але не перевіряє duplicate bindings for the same token.
- `packages/ioc/src/composer.ts:1312-1328` застосовує всі composer bindings до core
  container через `container.bind(binding.token)`.
- Цільова runtime-перевірка:
  - один module requires `audit.port`;
  - composer отримує два `composer.bind(PORT).toValue(...)`;
  - `composer.validate()` повертає `ok: true`;
  - `composer.compose()` падає з `DuplicateProviderError`, не з `ComposerValidationError`.

Вплив:

- Користувач може перевірити `validate()`, отримати `ok: true`, а потім отримати failure
  під час `compose()`.
- Це підриває stated contract, що composer validation є надійним pre-compose graph check.
- Помилка є статично видимою і має бути diagnostic-friendly, але зараз surfacing проходить
  через нижчий container error.

Рекомендована наступна дія:

- Додати duplicate binding validation у `validateComposer()`.
- Визначити public error/diagnostic: наприклад `DuplicateComposerBindingError` або
  розширений `InvalidComposerBindingError` reason.
- Додати tests:
  - `composer.validate()` reports duplicate binding;
  - `composer.inspect().validation` reports duplicate binding;
  - `composer.prepare()` and `composer.compose()` throw `ComposerValidationError`;
  - DSL `defineApp()` duplicate binding path має той самий diagnostic.

## Середні знахідки

### M-001: failed eager async initialization кешує rejected `freeze()` promise без retry

Критичність: `medium`

Зачеплені файли/модулі:

- `packages/ioc/src/container.ts`
- eager singleton async providers/resources

Докази:

- `packages/ioc/src/container.ts:404-410` зберігає `frozenRuntimePromise` одразу після
  першого `freeze()` attempt.
- Цільова runtime-перевірка:
  - eager singleton async provider кидає помилку на first initialization;
  - перший `container.freeze()` падає з `fail 1`;
  - другий `container.freeze()` також повертає `fail 1`, `attempts` лишається `1`.

Вплив:

- Stage 7 явно гарантує retry для failed lazy async initialization, але policy для eager
  `freeze()` failure не описана так само явно.
- Якщо application startup має transient dependency failure, builder не може повторити
  `freeze()` без повного recreate container.
- Це може бути прийнятним immutable-after-freeze policy, але зараз воно не очевидне з
  public docs.

Рекомендована наступна дія:

- Уточнити public policy для failed `freeze()`:
  - або `freeze()` attempt остаточно freezes builder навіть після rejection;
  - або rejected `frozenRuntimePromise` очищається і дозволяє retry.
- Якщо retry не планується, задокументувати це в async/container docs.
- Якщо retry планується, додати tests для eager async factory/resource failure retry.

## Низькі знахідки

### L-001: `pnpm changeset:status` ненадійний у локальному стані без divergence від `master`

Критичність: `low`

Зачеплені файли/модулі:

- `.changeset/README.md`
- root `package.json` script `changeset:status`
- локальний workflow релізу/версіювання

Докази:

- `.changeset/README.md:8-10` описує `pnpm changeset:status` як команду для pending
  version/changelog changes.
- У поточному локальному стані команда завершується з:
  - `Failed to find where HEAD diverged from "master"`;
  - `HEAD` і `master` вказують на той самий commit `9db6b73`.

Вплив:

- Це не ламає `pnpm release:validate` і не змінює артефакти пакетів.
- Але команда, задокументована як зручний local status check, може збити з пантелику на
  чистому `master` або в локальному clone без divergence.

Рекомендована наступна дія:

- Уточнити `.changeset/README.md`, що `changeset:status` корисний на feature branch /
  branch with divergence from `master`.
- Або додати окрему documented команду зі стабільним `--since` для локальної перевірки,
  якщо Changesets CLI підтримує потрібний сценарій.

## Позитивні результати аудиту

- `pnpm release:validate` проходить локально.
- Dry-run пакування проходить і smoke-tests запаковані runtime/type exports.
- `@sagifire/ioc` package exports включають root and subpaths:
  - `.`;
  - `./tokens`;
  - `./container`;
  - `./context`;
  - `./composer`;
  - `./dsl`;
  - `./diagnostics`;
  - `./lifecycle`;
  - `./package.json`.
- `@sagifire/ioc-next` and `@sagifire/ioc-testing` packed dependencies не лишають
  `workspace:*` у packed manifest.
- Boundary tests підтверджують:
  - core source/package не імпортує Next.js, React або `@sagifire/ioc-next`;
  - testing package не імпортує Next.js/React/adapter package;
  - Next adapter не додає hidden discovery/current-context APIs.
- Перевірка документації не знайшла stale "already published" claims; документація
  послідовно каже, що пакети досі мають `0.0.0` і не опубліковані.
- Усі приклади компілюються і direct Node harness-и виконуються без помилок.
- `memory/sources/SPEC.md` не редагувався.

## Рішення після review

Review виконано 2026-07-02.

- `C-001` потрібно виправити в
  `TASK-07.02-0064-stage-16-critical-fixes-from-audit`.
- `H-001` потрібно закрити до `0.0.1` у
  `TASK-07.02-0066-stage-16-sync-factory-promise-guard`.
- `H-002` потрібно закрити до `0.0.1` у
  `TASK-07.02-0067-stage-16-composer-duplicate-binding-validation`.
- `M-001` потрібно закрити до `0.0.1` у
  `TASK-07.02-0068-stage-16-freeze-failure-retry-policy`.
- `L-001` потрібно закрити до `0.0.1` у
  `TASK-07.02-0069-stage-16-changeset-status-docs`.
- Version `0.0.1` handoff не стартує, доки ці follow-up tasks не закриті або явно
  reclassified with rationale під час task-level review.

## Узгодженість Project Memory

- Product requirements and roadmap узгоджені зі Stage 16: audit before `0.0.1`, critical
  closure before version fixation.
- Technical rules correctly state that audit task must not change code/package versions.
- Current audit result підтверджує, що version `0.0.1` не можна фіксувати до closure
  `C-001`, `H-001`, `H-002`, `M-001` і `L-001`.
- Follow-up tasks для реалізації/документації створені:
  - `TASK-07.02-0064-stage-16-critical-fixes-from-audit`;
  - `TASK-07.02-0066-stage-16-sync-factory-promise-guard`;
  - `TASK-07.02-0067-stage-16-composer-duplicate-binding-validation`;
  - `TASK-07.02-0068-stage-16-freeze-failure-retry-policy`;
  - `TASK-07.02-0069-stage-16-changeset-status-docs`.

## Рекомендований порядок наступних дій

1. У `TASK-07.02-0064` виправити `C-001`.
2. У `TASK-07.02-0066` закрити `H-001`.
3. У `TASK-07.02-0067` закрити `H-002`.
4. У `TASK-07.02-0068` закрити `M-001`.
5. У `TASK-07.02-0069` закрити `L-001`.
6. Після виправлень rerun:
   - статичну перевірку workflow `.github/workflows/release.yml`;
   - `pnpm release:validate`;
   - dry-run пакування;
   - за можливості dry-run шлях GitHub Actions release.
7. Не фіксувати package versions `0.0.1`, доки `C-001`, `H-001`, `H-002`, `M-001` і
   `L-001` не закриті або явно reclassified with rationale.

## Самоперевірка

- [x] Звіт написаний українською мовою; назви API, назви команд і links залишені у
      вихідній формі.
- [x] Покрито поведінку коду, public API, tests/type-тести, package exports, документацію,
      приклади, реліз/версіювання і узгодженість Project Memory.
- [x] Знахідки мають критичність, докази, вплив, зачеплені файли/модулі і рекомендовану
      наступну дію.
- [x] Критична знахідка має достатньо доказів для наступної реалізаційної задачі.
- [x] Команди і checks зафіксовані.
- [x] Під час аудиту не змінювались код або версії пакетів.
- [x] `memory/sources/SPEC.md` не редагувався.
- [x] Вплив на документи загального рівня перевірений.

## Синхронізація пам'яті

- Product memory: оновлення не потрібне.
- Domain memory: оновлення не потрібне.
- Technical memory: оновлення не потрібне.
- Knowledge memory: оновлення не потрібне.
- Пам'ять задачі: оновлено.
- Wiki indexes: оновлення не потрібне, структура пам'яті не змінювалась.
- State-файл: оновлено.
- Документи пам'яті загального рівня: перевірено.

## Подальші дії

- Task переведено у `done` після human review approval.
- Наступна operational task: `TASK-07.02-0064-stage-16-critical-fixes-from-audit`.
