---
name: requesting-code-review
description: Use after meaningful changes, before merge or completion, to verify work against requirements with fresh reviewer context.
---

# Requesting Code Review

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use after implementing tasks, before claiming completion, before merge, or when risk justifies a second set of eyes.

## Process

1. Gather the task, plan or spec, changed files, diff summary, tests run, and known risks.
2. Launch one or more `reviewer` agents with fresh context and explicit review angles.
3. Ask reviewers for findings only; parent decides what to fix.
4. Classify findings as must-fix, optional, rejected, or needs user decision.
5. Send accepted fixes to `worker` with narrow scope.
6. Re-run review for substantial fixes.

## Required Gates

- Include requirements and validation evidence in the review prompt.
- Do not ask reviewers to rubber-stamp.
- Do not claim completion while accepted findings remain unresolved.

## Subagent Contracts

- `reviewer`: compare implementation to requirements, tests, edge cases, and simplicity.
- `worker`: fix accepted findings only.

## Stop Conditions

Stop when review findings contradict requirements, require product decisions, or expose failing validation that needs debugging.
