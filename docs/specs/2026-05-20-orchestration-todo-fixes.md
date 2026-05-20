# Orchestration TODO Fixes

## Decision
Apply active guidance changes only. Do not rewrite historical changelog/spec archives.

## Goals
- Keep planner commit steps in generated plans.
- Change plan execution guidance from one worker for all work to one worker per unchecked plan task, followed by reviewer before the next task.
- Make brainstorming run `researcher` when external/library/API/docs/current-practice evidence is needed.
- Remove active `plan.md` behavior because dated files under `docs/plans/` are canonical.
- Remove `prompts/parallel-handoff-plan.md`; it is not an automatic orchestration path.

## Non-goals
- No runtime enforcement or new orchestration engine.
- No change to brainstorming clarifying-question behavior.
- No removal of commit/checkpoint steps from planner plans.
- No rewrite of historical records solely to remove old `plan.md` mentions.

## Required Behavior
1. Planner writes full plans only to `docs/plans/YYYY-MM-DD-<feature>.md`.
2. Planner returns the saved plan path in its response. It does not create or summarize to root `plan.md`.
3. Worker and reviewer read the explicit plan/spec/progress paths supplied by the parent, not an implicit root `plan.md`.
4. Parent plan execution runs one `worker` for the current unchecked task only.
5. Parent validates worker output, launches `reviewer` for meaningful changes, routes accepted fixes through `worker`, then moves to the next task.
6. Parent preserves planner commit steps and may commit at the task boundary after validation/review, unless the user says otherwise.
7. Brainstorming starts local context gathering and also starts `researcher` whenever the request depends on external facts such as library behavior, APIs, docs, standards, or current best practices.
8. Clarifying questions remain unchanged: ask focused questions when needed before design approval.

## Likely File Changes
- `agents/planner.md`
- `agents/worker.md`
- `agents/reviewer.md`
- `skills/brainstorming/SKILL.md`
- `skills/executing-plans/SKILL.md`
- `skills/subagent-driven-development/SKILL.md`
- `src/runs/shared/subagent-guidance.ts`
- `test/unit/subagent-guidance.test.ts`
- `prompts/review-loop.md`
- `prompts/parallel-handoff-plan.md` deleted
- root `plan.md` deleted
- active README/package tests adjusted if they mention removed active behavior

## Validation
- Add/update unit tests for parent guidance text.
- Add/update package inventory tests if deleting `prompts/parallel-handoff-plan.md` changes packaged files.
- Run `npm run test:unit`.
- Run `npm run test:all` if unit changes touch package inventory or prompt runtime behavior.
