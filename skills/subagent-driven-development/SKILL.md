---
name: subagent-driven-development
description: Use when an approved plan has implementation tasks that should be delegated to worker and reviewer subagents.
---

# Subagent-Driven Development

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use for implementation plans, multi-file changes, or tasks that benefit from separate worker and reviewer contexts.

## Process

1. Confirm a plan or explicit implementation scope exists.
2. Decompose work into independent or sequential tasks.
3. Launch `worker` for one writing task at a time unless worktrees isolate parallel writers.
4. Run targeted validation after each meaningful unit.
5. Launch fresh `reviewer` on the diff and requirements.
6. Apply accepted fixes through `worker`; repeat review if changes are non-trivial.
7. Summarize evidence and remaining risks.

## Required Gates

- Parent owns integration and final decisions.
- No parallel writes in one worktree.
- Review and verification are required before completion claims.

## Subagent Contracts

- `worker`: focused implementation, minimal scope, validation evidence.
- `reviewer`: defects, missed requirements, test gaps, unnecessary complexity.
- `oracle`: only for high-risk ambiguity or drift.

## Stop Conditions

Stop when tasks overlap unexpectedly, requirements are unclear, tests fail without diagnosis, or a decision exceeds the plan.
