# TASK-07.15-0114: Stage 18 version 0.0.3 release

Task Status: review
Type: release
Created: 2026-07-15
Owner Role: Release Agent
Current Run: RUN-001

## Поточний стан

Run Status: finalizing
Progress: task and FIX-001 approved; external release finalization in progress.
Acceptance: 8/16 confirmed; 9/16..15/16 external finalization; 16/16 final outcome/done gate.
Blockers: none before external gates; stop on any commit/push/workflow/registry mismatch.
Blocked Phase: n/a
Pending Decisions: none; task and required FIX-001 approved.
Next Action: commit, push, manual dry-run, publish and post-publish verification.

## Мета

Встановити, чи повністю готовий проект до релізу `0.0.3`, і, лише якщо всі обов'язкові
gates пройдені, зафіксувати версію, changelog, release docs та Project Memory, виконати
повну release validation, провести GitHub/npm preflight і опублікувати три public packages
через чинний контрольований GitHub `Release` workflow.

## Release boundary і порядок дій

Цей контракт явно розділяє операції, які не можна зливати в один неаудований крок:

1. **Readiness verification** - лише перевірка predecessor state, repository state,
   release scope, changesets і відсутності blocker findings.
2. **Version fixation** - package manifests `0.0.3`, changelog entries, release-facing docs
   та required canonical Project Memory proposal; це ще не commit, push або publish.
3. **Validation** - `pnpm release:validate`, Changesets/package/packed-artifact checks і
   незалежний аудит exact release diff; це ще не зовнішній release.
4. **Commit** - окремий release commit лише з перевіреним in-scope diff.
5. **Push** - окрема зовнішня дія після commit gate; успішний push не означає publish.
6. **Workflow dispatch** - спочатку manual `dry-run` на exact reviewed `master` commit;
   dispatch або green workflow не означають npm publication.
7. **npm publish** - окремий manual `publish` dispatch на тому самому commit лише після
   всіх gates і за наявності чинних workflow/environment/credential permissions.
8. **Post-publish verification** - підтвердження registry versions/dist-tags і workflow
   provenance evidence для кожного package; тільки це дозволяє заявити release outcome.

Якщо будь-який gate не пройдено, execution зупиняється до commit/push/publish на відповідній
межі. Якщо `0.0.3` вже повністю опублікована, повторний publish заборонений; треба лише
верифікувати exact artifacts і зафіксувати фактичний стан. Якщо registry state частковий або
змішаний, не робити автоматичний recovery чи republish: оформити blocker і Decision Request.

## Попередники й readiness gate

- Усі Stage 18 tasks `TASK-0093..TASK-0113` мають бути `done`, а required/approved
  `FIX-*` - `applied`.
- TASK-0113 є обов'язковим predecessor для version/changelog/release action.
- Не має бути відкритих critical/high release blockers, незакритих required fixations або
  невирішених audit findings, які ставлять під сумнів `0.0.3` scope.
- Git worktree, branch, remote і release diff мають бути ідентифіковані. Не пов'язані з
  релізом user/agent changes не можна включати, переписувати або приховувати.
- Pending changesets мають one-to-one покривати public changes `0.0.3`, або equivalent
  version fixation має бути явно обґрунтована existing Changesets workflow.
- Public packages `@sagifire/ioc`, `@sagifire/ioc-next`, `@sagifire/ioc-testing` мають
  узгоджено переходити з `0.0.2` на `0.0.3`; private root workspace лишається `0.0.0`.

## Вимоги

- Провести evidence-based readiness audit до будь-якого version або external mutation.
- Використати чинний Changesets/versioning flow; не створювати паралельний release process.
- Зафіксувати `0.0.3` у всіх трьох publishable manifests і узгоджених changelogs.
- Оновити release-facing public docs так, щоб вони не описували `0.0.3` як майбутню
  preparation після version fixation.
- Змістове оновлення canonical Project Memory оформити task-local `FIX-*`; не застосовувати
  proposal без human approval. Lifecycle/index/progress updates не потребують recursive FIX.
- Виконати повний `pnpm release:validate` після version fixation і перевірити exact packed
  contents, exports, versions та install/consumer smoke через чинний dry-run path.
- Провести незалежний аудит release diff, validation evidence і gate trace до commit/push.
- До зовнішніх дій підтвердити GitHub auth/repository/branch/workflow availability без зміни
  settings, secrets або credentials.
- До publish перевірити npm registry state усіх трьох packages, доступність namespace/package
  ownership настільки, наскільки дозволяють чинні credentials, і відсутність `0.0.3` або
  узгоджений already-published state. Не читати й не виводити secret values.
- Commit і push виконувати окремо та лише для exact reviewed release scope.
- Manual workflow `dry-run` запускати на `master` exact release commit і дочекатися green
  completion до `publish` dispatch.
- Actual publish виконувати тільки через чинний `.github/workflows/release.yml`, лише з
  `publish_to_npm=publish`, лише на тому самому `master` commit і лише якщо environment,
  reviewers, `NPM_TOKEN` та npm permissions дозволяють workflow завершитися штатно.
- Після publish перевірити workflow conclusion, npm `0.0.3` для кожного package, expected
  dist-tag і доступне provenance evidence. Не заявляти успіх лише на підставі dispatch.
- Зафіксувати exact commit SHA, workflow run URLs/IDs і registry evidence без secrets.

## Обсяг

- Readiness і release-blocker verification для завершеного Stage 18 portfolio.
- `.changeset/`, три public package manifests і changelogs.
- Root/package README та `docs/release.md` лише в межах release-status consistency.
- Required task-local `FIX-*` для canonical `memory/state.md`, roadmap/technical/product
  release-state updates, якщо readiness evidence робить такі зміни необхідними.
- Full local release validation та independent audit.
- Release-scoped Git commit, push, GitHub workflow dry-run/publish і npm verification за gates.
- Operational task/run/index/progress lifecycle updates.

## Поза обсягом

- Нові features, runtime behavior, public API redesign або unrelated refactor.
- Виправлення non-blocking technical debt; release blocker потребує зупинки й bounded fix task
  або нового run, а не прихованого розширення цього scope.
- Зміна GitHub repository/environment/branch-protection/npm organization settings.
- Створення, редагування, ротація, копіювання або розкриття credentials, tokens і secrets.
- Local `pnpm release:publish` або обхід чинного GitHub-controlled publish workflow.
- Force-push, history rewrite, tag/release fabrication або повторна публікація existing version.
- Редагування historical source snapshots у `memory/sources/`.
- Включення unrelated code, docs або Project Memory changes у release commit.

## Критерії приймання

- [ ] Readiness report доводить, що `TASK-0093..TASK-0113` done, required/approved fixations
  applied, а всі release-blocking findings закриті; кожен predecessor має traceable evidence.
- [ ] Baseline worktree/branch/remote і exact release scope зафіксовані; unrelated changes не
  змінені й не включені, а будь-яка overlap ambiguity зупинила execution до рішення.
- [ ] Changesets/version plan узгоджено переводить усі три public packages з `0.0.2` на
  `0.0.3`, не змінюючи private root version `0.0.0`.
- [ ] Три public manifests мають `0.0.3`, changelogs містять коректні `0.0.3` entries, а
  release docs послідовно відображають version-fixed state без claim про publish до доказу.
- [ ] Canonical Project Memory зміни оформлені exact required `FIX-*`, approved і applied до
  фіналізації; `memory/sources/` не змінено, upward consistency recorded.
- [ ] Після exact version/doc/memory state `pnpm release:validate` пройшов повністю; build,
  typecheck, format, lint, tests, examples і pack dry-run мають recorded exit evidence.
- [ ] Packed artifacts усіх трьох packages містять expected `0.0.3` metadata/exports/files і
  проходять чинні package/consumer smoke gates без workspace-only assumptions.
- [ ] Незалежний аудит підтвердив release scope, 16 acceptance criteria, validation evidence,
  architecture/language gates і відсутність open findings до commit/push.
- [ ] Release commit містить тільки exact approved in-scope diff; його SHA і clean/controlled
  post-commit worktree state зафіксовані окремо від push status.
- [ ] Exact release commit успішно push-нуто до intended remote/branch без force/history rewrite;
  remote SHA збігається з audited SHA і push окремо зафіксований.
- [ ] GitHub preflight підтвердив auth, repository, `master`, `Release` workflow і можливість
  manual dispatch без зміни external settings/credentials; limitations recorded.
- [ ] npm preflight перевірив усі три packages як єдиний release set: `0.0.3` absent або exact
  fully-published state; mixed/partial/conflicting state блокує publish і не маскується.
- [ ] Manual `dry-run` workflow завершився success на exact audited `master` SHA; run ID/URL,
  event, input і conclusion recorded до publish dispatch.
- [ ] Якщо publish був потрібний, manual `publish` workflow запущено лише на тому самому SHA
  після dry-run і завершено success; якщо workflow/credentials/environment не дозволили це,
  задача не заявляє release success і містить точний blocker без credential edits.
- [ ] Post-publish registry verification підтверджує `0.0.3` та expected dist-tag для кожного
  public package, а workflow дає provenance evidence; already-published path підтверджує
  equivalent exact state без повторного publish.
- [ ] Run result явно розрізняє version fixation, commit, push, workflow dispatch і npm publish,
  містить final release outcome та не позначає задачу `done` без task-level human approval.

## Пов'язана пам'ять

- [Stage 18 portfolio research](../TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/task.md)
- [Async multi audit handoff](../TASK-07.13-0105-stage-18-extreme-agent-complexity-async-multi-0-0-3-audit-handoff/task.md)
- [Lifetime/shared-foundation audit handoff](../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/task.md)
- [Architecture pressure decisions](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
- [Runtime decomposition decision](../TASK-07.15-0112-stage-18-runtime-composition-state-machine-decomposition-research/task.md)
- [Graph schema stabilization](../TASK-07.15-0113-stage-18-graph-schema-evolution-policy-0-0-3-stabilization/task.md)
- [Previous 0.0.2 release handoff](../TASK-07.05-0090-stage-17-version-0-0-2-release-handoff/task.md)
- [Product roadmap](../../../product/roadmap.md)
- [Technical rules](../../../technical/rules.md)
- [Testing strategy](../../../technical/testing.md)
- [Definition of Done](../../../technical/definition-of-done.md)

## Прогони

- [RUN-001](RUN-001/index.md) - active - gated `0.0.3` readiness and release run.

## Дослідження

Окреме formal research не очікується. Readiness/preflight є bounded execution verification і
фіксується в `RUN-001/result.md`. Нова contract ambiguity або mixed external state потребує
Decision Request, а не неявного рішення.

## Фіксації

- [FIX-001](FIX-001.md) - required proposed canonical release-state update; apply only after
  approved and externally verified `0.0.3` publish.

## Запити на рішення

- Task-level human review after independent audit: pending.
- Required FIX-001 approval: pending.
- Partial/mixed npm state, overlap з unrelated changes або потреба змінити external
  credentials/settings є blocker і потребує окремого рішення/authority.

## Human Review

Status: approved
Requested: 2026-07-15
Reviewed: approved 2026-07-15
Approval Source: user message on 2026-07-15: `Задача: approve`; `FIX-001: approve`.

## Фінальний результат

Не завершено. Readiness, version fixation і local validation пройдено; commit, push,
workflow dispatch і npm publish не виконано до independent audit та human review.
