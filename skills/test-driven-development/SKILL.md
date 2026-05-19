---
name: test-driven-development
description: Use before implementing features or bug fixes when behavior can be specified with tests.
---

# Test-Driven Development

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use before feature work, bug fixes, refactors with observable behavior, and plan tasks that include validation.

## Process

1. Define the expected behavior and smallest testable slice.
2. RED: add or identify a failing test that proves the missing behavior.
3. Verify RED by running the targeted test and seeing the expected failure.
4. GREEN: launch `worker` for minimal implementation.
5. Verify GREEN with the same targeted test.
6. REFACTOR: clean up only after green tests.
7. Repeat for the next slice.
8. Run reviewer and broader checks before completion.

## Required Gates

- Do not implement before RED unless tests are impossible and reason is documented.
- Minimal implementation beats speculative generality.
- Test failures must be understood, not ignored.

## Subagent Contracts

- `worker`: write test first or implement minimal green step as instructed.
- `reviewer`: check test quality, coverage gaps, and overfitting.

## Stop Conditions

Stop when behavior is ambiguous, a test cannot express the requirement, or RED fails for an unrelated reason.
