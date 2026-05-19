---
name: writing-plans
description: Use when requirements or an approved spec need a concrete implementation plan before code changes.
---

# Writing Plans

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use after a spec, requirements, or user-approved design exists and before multi-step implementation.

## Process

1. Read the approved spec and current repository context.
2. Launch `context-builder` if integration points, tests, or constraints are unclear.
3. Launch `planner` with the spec, context, constraints, and requested plan format.
4. Save the plan to a path such as `docs/plans/2026-05-19-feature.md`.
5. Self-review the plan for missing files, incomplete markers, oversized tasks, and untestable steps.
6. Ask the user to approve the plan before execution.

## Required Gates

- Every task must be bite-sized, ordered, and independently verifiable.
- Plans must include files, exact edits, tests, expected failures, and expected passes.
- User approval is required before `worker` implementation.

## Subagent Contracts

- `context-builder`: find relevant files, patterns, tests, and risks.
- `planner`: write the step-by-step plan only; no implementation.
- `reviewer`: optional plan review for risky or complex work.

## Stop Conditions

Stop when requirements conflict, scope is too broad, tests are unknown, or the plan would require unapproved architecture decisions.
