# Research Report: RSCH-001

Status: draft | review-ready | changes-requested | rejected | accepted
Created: YYYY-MM-DD
Agent Role: Agent Executor / Agent Assistant / інша призначена роль
Execution Mode: autonomous-research
Task Status After Research: review | active | blocked

## Research Question

Що саме досліджується.

## Scope

Що входить у дослідження.

## Out of Scope

Що явно не досліджується.

## Sources / Inputs

- `memory/...`
- code paths або external docs, якщо вони дозволені task context
- user-provided context

## Findings

Ключові факти й спостереження.

## Options

### Option A

- Description:
- Pros:
- Cons:
- Risks:

### Option B

- Description:
- Pros:
- Cons:
- Risks:

## Recommendation

Рекомендований варіант або висновок.

## Rationale

Чому саме така рекомендація.

## Memory Fixation Proposal

Status: not-needed | proposed | approved | applied | rejected
Related Fixation: `fixations/FIX-001.md` або n/a
General-Level Memory Impact: not-needed | proposed | included-in-fixation | blocked

Що варто зафіксувати в Project Memory, якщо це потрібно.

Якщо потрібна зміна Project Memory, агент має створити або оновити відповідний `fixations/FIX-*.md` як proposal. Proposal має явно показувати, чи потрібне оновлення документів загального рівня. Застосовувати зміни в пам'ять до human review не можна.

## Agent Self-Review

- [ ] Research question відповідає task scope
- [ ] Джерела й припущення вказані
- [ ] Варіанти порівняні чесно
- [ ] Рекомендація випливає з аналізу
- [ ] Ризики й невизначеності зафіксовані
- [ ] Потреба в memory fixation перевірена
- [ ] Вплив research findings на документи загального рівня перевірений
- [ ] Якщо memory fixation потрібна, proposal підготовлений і не застосований без approval

## Human Review

Status: pending | approved | changes-requested | rejected
Reviewer Role: Product Lead Hat / System Engineer Hat / Knowledge Engineer Hat / інша відповідальна роль
Reviewed: YYYY-MM-DD або pending
Approval Scope: research-report-only | research-and-memory-fixation | changes-requested | rejected | n/a
Approval Source: явне повідомлення користувача / pending

`Status: approved` означає, що людина прийняла research result. Якщо є memory fixation proposal, окремо має бути зрозуміло, чи approval поширюється на застосування `FIX-*`.

## Follow-up

- ...
