# RSCH-001: Lifetime dependency validation design

Status: completed
Related Task: [TASK-07.12-0097](task.md)
Related Run: [RUN-001](RUN-001/index.md)
Created: 2026-07-12
Disposition: final-result

## Питання

Яка explicit provider dependency model дозволяє чесно валідувати lifetime capture та
інтегрувати evidence у diagnostics/inspection/export без inference і privacy leak?

## Висновок

Рекомендовано additive object metadata `toFactory(factory, { dependencies })` з edge
taxonomy `instance | deferred`; ownership edges derivable з managed-resource owner,
а deferred окремо називає ultimate dependency,
retained handle та caller-provided scope. Multi declaration розгортається в concrete
registration edges. Error дозволений лише для declared direct
instance capture, де effective dependency/owner lifetime коротший за consumer. Ordinary
transient capture і transient→scoped escape risk є warning, undeclared metadata — окремий
coverage warning/unknown, а deferred edge не є capture.

Private provider ідентифікується module ID та registration index без private token ID.
Static validation працює до factory execution; runtime layer лише перевіряє declared edges
проти effective child-scope registrations. Provider edges мають стати єдиною normalized
foundation для validator, inspection і graph export.

## Результати

- Candidate API comparison і recommendation.
- Однозначна edge taxonomy.
- Lifetime/severity matrix.
- Coverage contract `complete | partial | none`.
- Private-provider-safe identity.
- Diagnostic families, migration, testing та phased implementation recommendation.

## Detailed report

[2026-07-12-stage-18-lifetime-dependency-validation-design.md](../../../reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md)
