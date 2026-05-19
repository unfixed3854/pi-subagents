---
name: quality-gates
description: Use before reviews, TDD work, verification, completion claims, merge decisions, or any workflow that needs evidence before assertions.
---

# Quality Gates

Support skill for evidence-based implementation. Claims require command output, review output, or explicit inability to validate.

## TDD Gate

- RED: add or identify a failing test before implementation when practical.
- GREEN: make the smallest change that passes the test.
- REFACTOR: clean up without changing behavior.
- If TDD is impossible, document why before implementing.

## Review Gate

- Use `reviewer` after meaningful changes and before merge/completion.
- Give reviewers the task, diff, tests run, and known risks.
- Parent triages feedback; do not blindly apply every suggestion.

## Verification Gate

- Run targeted commands that prove the changed behavior.
- Prefer narrow tests first, then broader tests when risk justifies it.
- Capture exact command names and pass/fail status.

## Completion Gate

Before saying done, fixed, passing, or ready:

1. Verify changed behavior.
2. Verify no known accepted review issue remains.
3. Report skipped checks and why.
4. Avoid success claims unsupported by evidence.

## Failure Handling

Stop and report blockers when validation fails, tools are unavailable, results contradict expectations, or the next step would exceed approved scope.
