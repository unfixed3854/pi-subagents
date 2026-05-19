---
name: executing-plans
description: Use when a written implementation plan is ready to execute with review checkpoints.
---

# Executing Plans

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use when an approved plan exists and implementation should proceed task-by-task.

## Process

1. Read the full plan and identify the current task.
2. Verify prerequisites, scope, and expected validation.
3. Launch one `worker` with the current task, relevant context, constraints, and validation commands.
4. Inspect worker results and run or verify requested checks.
5. Launch `reviewer` for non-trivial changes.
6. Send accepted fixes back through `worker`; re-review when fixes are substantial.
7. Mark plan tasks complete only after evidence is available.

## Required Gates

- Do not skip tasks or silently change scope.
- Review meaningful changes before completion.
- Use `verification-before-completion` before success claims.

## Subagent Contracts

- `worker`: implement only the assigned task and report changed files, commands, and blockers.
- `reviewer`: compare changes to plan, tests, edge cases, and simplicity.

## Stop Conditions

Stop when the plan is ambiguous, validation fails, scope changes, conflicts arise, or the worker needs a user decision.
