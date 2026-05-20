---
name: executing-plans
description: Use when a written implementation plan is ready to execute with review checkpoints.
---

# Executing Plans

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use when an approved plan exists and implementation should proceed task-by-task.

## Process

1. Read the full plan path supplied by the user or planner and identify the current unchecked task.
2. Verify prerequisites, scope, expected changed files, and validation commands for that task.
3. Launch one `worker` for the current unchecked task only; include the plan path, task heading, constraints, and validation commands.
4. Inspect worker results, changed files, and command output; run or verify requested checks.
5. Launch `reviewer` for meaningful changes before moving to the next task.
6. Send accepted reviewer fixes back through `worker`; re-review when fixes are substantial.
7. Mark the task complete only after evidence is available.
8. Commit at the task boundary when the plan includes a commit step and the user has not said otherwise.
9. Repeat from step 1 for the next unchecked task.

## Required Gates

- Do not skip tasks or silently change scope.
- Review meaningful changes before completion.
- Use `verification-before-completion` before success claims.
- Execute exactly one current unchecked task per `worker` launch.
- Do not let parent patch worker output directly except for minor parent-only documentation corrections.
- Do not advance to the next task until validation and reviewer evidence are recorded.

## Subagent Contracts

- `worker`: implement only the assigned current unchecked task and report changed files, commands, and blockers.
- `reviewer`: compare changes to the plan task, tests, edge cases, and simplicity before the parent advances.

## Stop Conditions

Stop when the plan is ambiguous, validation fails, scope changes, conflicts arise, or the worker needs a user decision.
