---
name: receiving-code-review
description: Use when receiving human or automated review feedback before implementing suggestions, especially unclear or questionable feedback.
---

# Receiving Code Review

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use whenever review feedback arrives and before agreeing, rejecting, or implementing it.

## Process

1. Parse each comment into a concrete claim or requested change.
2. Verify claims against code, tests, requirements, and project style.
3. Classify each item: correct fix, valid but optional, unclear, incorrect, or needs user decision.
4. Push back with evidence when feedback is wrong or over-scoped.
5. Batch accepted fixes for `worker` with narrow instructions.
6. Re-run tests and review if changes are substantial.

## Required Gates

- Do not blindly agree with review feedback.
- Do not implement vague or contradictory feedback without clarification.
- Preserve YAGNI; reject unnecessary professional-sounding complexity.

## Subagent Contracts

- `reviewer`: optional second opinion on disputed comments.
- `worker`: implement accepted comments only.
- `oracle`: adjudicate high-risk disagreement.

## Stop Conditions

Stop when feedback changes product behavior, conflicts with user instructions, creates security risk, or cannot be verified.
