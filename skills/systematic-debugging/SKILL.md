---
name: systematic-debugging
description: Use for any bug, test failure, or unexpected behavior before proposing or implementing fixes.
---

# Systematic Debugging

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use before fixing bugs, failing tests, regressions, flaky behavior, or surprising output.

## Process

1. Reproduce the failure or capture why reproduction is unavailable.
2. Gather symptoms, logs, inputs, environment, and recent changes.
3. Launch `scout` or `context-builder` to inspect relevant code paths and tests.
4. Identify patterns and narrow hypotheses.
5. Test the most likely hypothesis with the smallest check.
6. Launch `worker` only after root-cause evidence exists.
7. Add or update regression tests when practical.
8. Run `reviewer` and validation before completion.

## Required Gates

- No fix before root-cause evidence.
- No broad rewrites as first response.
- Use TDD for bug fixes when a regression test is feasible.

## Subagent Contracts

- `context-builder` or `scout`: facts, code paths, repro clues, tests.
- `worker`: minimal fix after evidence.
- `reviewer`: verify fix matches root cause and avoids overreach.

## Stop Conditions

Stop when reproduction is impossible, evidence contradicts the hypothesis, or the fix requires unapproved runtime/product/user-visible changes.
