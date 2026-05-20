---
name: subagent-driven-development
description: Use when an approved plan has implementation tasks that should be delegated to worker and reviewer subagents.
---

# Subagent-Driven Development

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use for implementation plans, multi-file changes, or tasks that benefit from separate worker and reviewer contexts.

## Process

1. Classify the request: new behavior, approved implementation, bug, review, validation, or research.
2. For approved implementation, provide `worker` the explicit plan/spec/progress path and only the current scoped task.
3. Validate worker output and changed files before synthesizing progress.
4. Launch `reviewer` for meaningful changes.
5. Route accepted review fixes through `worker`; do not patch reviewer feedback directly unless it is a trivial parent-only documentation correction.
6. Commit at the task boundary when the plan includes a commit step and the user has not said otherwise.
7. Continue to the next task only after validation and review evidence are complete.

## Required Gates

- Parent owns integration and final decisions.
- No parallel writes in one worktree.
- Review and verification are required before completion claims.

## Subagent Contracts

- `worker`: scoped implementation for the explicit current task, plan/spec/progress paths, validation commands, and blocker reporting.
- `reviewer`: fresh inspection of meaningful changes against the task, requirements, tests, edge cases, and simplicity.
- `oracle`: decision support for design tradeoffs before implementation scope is approved.

## Stop Conditions

Stop when tasks overlap unexpectedly, requirements are unclear, tests fail without diagnosis, or a decision exceeds the plan.
