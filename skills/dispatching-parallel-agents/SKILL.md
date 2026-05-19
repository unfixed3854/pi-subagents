---
name: dispatching-parallel-agents
description: Use for two or more independent read, review, research, or validation tasks that can run without shared mutable state.
---

# Dispatching Parallel Agents

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use when tasks are independent: separate review angles, separate code areas, docs plus code research, or multiple validation perspectives.

## Process

1. Identify independent domains and shared context.
2. Write one focused prompt per child with goal, files, constraints, output, and stop rules.
3. Launch `scout`, `researcher`, `context-builder`, or `reviewer` in parallel as appropriate.
4. Wait for all relevant results or mark missing results as blockers.
5. Synthesize agreements, contradictions, and next actions.
6. Send any accepted implementation work to a single `worker` unless worktrees isolate writers.

## Required Gates

- Parallel tasks must not depend on each other's output.
- Shared-write tasks require explicit worktree isolation.
- Parent resolves conflicts between child outputs.

## Subagent Contracts

- `scout`: local facts and entry points.
- `researcher`: external evidence with sources.
- `reviewer`: review from an assigned angle.
- `worker`: only after synthesis, normally not parallel.

## Stop Conditions

Stop when tasks share mutable state, requirements conflict, or child outputs expose an unapproved architecture decision.
