# TASK-07.02-0060: Stage 15 npm publish workflow and provenance

Status: done
Type: chore
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Add npm publish workflow automation with provenance support where practical, without
performing an actual publish during the implementation task unless explicitly approved.

## Product Context

After governance artifacts, package metadata, versioning, CI and dry-run validation exist,
the repository can define the release workflow that publishes validated packages to npm.

## Scope

- Add GitHub Actions release/publish workflow.
- Integrate with the chosen versioning/changelog flow.
- Run CI or package validation before publish steps.
- Configure workflow permissions needed for npm provenance where practical.
- Use GitHub repository secrets for npm token references without committing credentials.
- Make actual publish trigger and human control explicit.
- Document local/non-publish verification and any untestable external assumptions.
- Update task run result memory after implementation.

## Out of Scope

- Executing actual npm publish without explicit human approval.
- Creating npm tokens, GitHub secrets, repository settings or npm organization settings.
- Bypassing failed CI/dry-run checks.
- Changing runtime behavior or public API.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Release/publish workflow exists under `.github/workflows/`.
- [ ] Workflow integrates with versioning/changelog setup.
- [ ] Workflow runs quality/package validation before publish.
- [ ] Workflow uses secret references and does not commit credentials.
- [ ] Workflow supports npm provenance or documents a concrete blocker.
- [ ] Actual publish is not performed without explicit human approval.
- [ ] Workflow limitations and required external settings are documented.

## Linked Memory

- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.02-0059-stage-15-pack-dry-run-validation/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for npm publish workflow and provenance.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
