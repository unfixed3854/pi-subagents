---
name: verification-before-completion
description: Use before claiming work is complete, fixed, passing, ready, reviewed, committed, or merged.
---

# Verification Before Completion

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use before any success claim, handoff, commit summary, PR, merge, or final answer after changes.

## Process

1. List what changed and what must be true.
2. Run targeted tests or checks that prove those claims.
3. Run broader checks when risk, package scripts, or plan require them.
4. Confirm review findings are resolved or explicitly rejected with evidence.
5. Record exact commands, status, and notable output.
6. Report skipped checks with reasons.

## Required Gates

- Evidence before assertions.
- Do not say done, fixed, passing, or ready without validation.
- Failed checks block completion unless explicitly reported as unresolved.

## Subagent Contracts

- `reviewer`: final check of diff, requirements, and validation evidence.
- `worker`: fix accepted issues found during verification.

## Stop Conditions

Stop when validation fails, tooling is missing, tests are flaky without diagnosis, or the next step would hide uncertainty.
