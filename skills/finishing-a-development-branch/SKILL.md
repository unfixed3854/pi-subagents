---
name: finishing-a-development-branch
description: Use when implementation is complete, tests pass, and integration, PR, merge, or cleanup decisions remain.
---

# Finishing a Development Branch

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use after implementation and validation when deciding how to integrate branch or worktree changes.

## Process

1. Run `verification-before-completion` and capture command evidence.
2. Check git status, branch, remotes, and probable base branch.
3. Summarize commits or diff since base.
4. Present options: merge locally, create PR, leave branch, cleanup worktree, or stop.
5. Execute only the option the user chooses.
6. Verify final status after merge, PR prep, or cleanup.

## Required Gates

- User approval is required for merge, push, PR creation, branch deletion, and worktree removal.
- Never remove a branch or worktree before confirming integration.
- Do not claim clean branch without checking status.

## Subagent Contracts

- `reviewer`: optional final release-readiness review.
- `worker`: narrow fixes if final checks fail.

## Stop Conditions

Stop when tests fail, status is dirty unexpectedly, base branch is uncertain, or user has not chosen an integration action.
