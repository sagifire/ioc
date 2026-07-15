# Контекст виконання: RUN-001

Related Task: [TASK-07.15-0114](../task.md)
Prepared: 2026-07-15
Prepared By: Task Package Author
Previous Run: none

## Agent Role

Release Agent.

## Мета run

Перевірити readiness Stage 18 і виконати version `0.0.3` release end-to-end лише за умови,
що кожен локальний, review, GitHub і npm gate має позитивне evidence.

## Ефективні вимоги

- Спочатку провести read-only readiness verification `TASK-0093..TASK-0113`, fixations,
  audits, worktree/branch/remote і changesets.
- Не робити version fixation, доки readiness gate не пройдено.
- Зафіксувати всі три public packages at `0.0.3`, changelogs і release docs через existing
  Changesets flow; private root лишити `0.0.0`.
- Canonical memory state готувати через required task-local `FIX-*`; historical sources не
  змінювати.
- Після fixation виконати `pnpm release:validate`, packed-artifact/consumer checks та
  незалежний аудит exact diff.
- Commit, push, workflow dry-run, publish dispatch і registry verification є окремими gates.
- Actual publish дозволений лише existing GitHub Release workflow на exact audited `master`
  SHA після successful dry-run і npm/GitHub preflight.
- Не змінювати credentials/external settings і не виконувати local publish.
- Зупинитися на першому failed gate; partial/mixed registry state оформити як blocker.

## Попередники

- [TASK-0093](../../TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/task.md)
  та всі approved portfolio tasks через TASK-0113 мають бути `done`.
- [TASK-0105](../../TASK-07.13-0105-stage-18-extreme-agent-complexity-async-multi-0-0-3-audit-handoff/task.md)
  має підтверджувати async multi audit handoff.
- [TASK-0110](../../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/task.md)
  має підтверджувати lifetime/shared-foundation audit handoff.
- [TASK-0111](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
  має бути `done`, required FIX-001 `applied`, а decisions - dispositioned.
- [TASK-0113](../../TASK-07.15-0113-stage-18-graph-schema-evolution-policy-0-0-3-stabilization/task.md)
  має бути `done` до version/changelog/release action.

## Обсяг

- Readiness evidence та release blockers.
- `.changeset/`, `packages/*/package.json`, package changelogs і release-status docs.
- Required canonical Project Memory `FIX-*` і operational task lifecycle updates.
- Full local validation, package smoke і independent audit.
- Release-scoped commit/push, GitHub workflow dry-run/publish, npm registry verification.

## Поза обсягом

- Features, API/refactor/technical-debt work і unrelated changes.
- Credential/secret/repository/npm setting changes або secret inspection/output.
- Local publish, force-push, history rewrite, repeated existing-version publish.
- Historical `memory/sources/` edits.

## Критерії приймання

- [ ] Усі 16 task acceptance criteria мають one-to-one trace у result.
- [ ] Readiness пройдено до version fixation; version fixation пройдено до validation.
- [ ] Validation та independent audit пройдено до commit/push.
- [ ] Commit SHA, push SHA, dry-run run і publish run зафіксовані як окремі facts.
- [ ] Registry/provenance evidence покриває кожен package або exact blocker documented.
- [ ] Required/approved fixations applied; task-level human review лишається final done gate.

## Обов'язковий контекст задачі

- [Task contract](../task.md)
- [Previous 0.0.2 release task](../../TASK-07.05-0090-stage-17-version-0-0-2-release-handoff/task.md)
- [Stage 18 roadmap](../../../../product/roadmap.md)
- [Project state](../../../../state.md)
- [Technical rules](../../../../technical/rules.md)
- [Testing strategy](../../../../technical/testing.md)
- [Definition of Done](../../../../technical/definition-of-done.md)
- [Progress](../../progress.md)
- [Root package scripts](../../../../../package.json)
- [Changesets config](../../../../../.changeset/config.json)
- [Release workflow](../../../../../.github/workflows/release.yml)
- [Release documentation](../../../../../docs/release.md)

## Перевірки

- Task/fixation/audit status trace for `TASK-0093..TASK-0113`.
- `git status`, branch, remote, exact diff and commit/remote SHA checks без destructive Git.
- Changesets status/version consistency і three-package version/changelog alignment.
- `pnpm release:validate` та чинні pack/export/install/consumer smoke gates.
- Independent release audit before external mutation.
- GitHub auth/repo/workflow/master dispatch preflight; workflow run conclusion на exact SHA.
- npm registry version/dist-tag preflight і post-publish checks для трьох packages.
- Provenance evidence from exact successful GitHub publish run without secret exposure.

## Ризики

- Unrelated dirty changes можуть випадково потрапити в release commit.
- Changesets можуть створити неповний або нерівномірний bump release group.
- Green local validation не доводить branch/workflow/registry readiness.
- Workflow dispatch може бути successful validation, але publish job не запускатися.
- Missing/invalid secret або npm ownership може проявитися лише під час publish job.
- Partial registry publish потребує recovery decision і не є accepted success.
- Registry propagation delay може вимагати bounded repeat verification, але не republish.

## Припущення

- User request authorizes conditional release actions in this task only after all gates pass.
- Existing `.github/workflows/release.yml` лишається authoritative publish path.
- External environment reviewers і credentials, якщо вони існують, використовуються без змін.
- Відсутність доступу до зовнішнього preflight не дорівнює readiness і блокує publish claim.

## Зміни від попереднього run

Не застосовується для RUN-001.
