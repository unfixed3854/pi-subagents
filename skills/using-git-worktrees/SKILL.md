---
name: using-git-worktrees
description: Use when work needs isolation from the current workspace or before parallel writers modify the same repository.
---

# Using Git Worktrees

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use before feature work that should not disturb the current checkout, risky experiments, branch work, or parallel writing tasks.

## Process

1. Check current branch, status, and whether already inside a worktree.
2. Decide isolation need based on risk, dirty state, and parallelism.
3. If creating a worktree, choose branch name and path.
4. Create worktree with git-native commands or available project tooling.
5. Install or prepare dependencies only as needed.
6. Tell workers the exact worktree path and branch.
7. Clean up only after user-approved integration.

## Required Gates

- Do not discard or overwrite dirty work.
- Ask before destructive cleanup.
- Parallel writers require separate worktrees or explicitly non-overlapping repositories.

## Subagent Contracts

- `worker`: operate only in the assigned worktree path.
- `reviewer`: review the worktree diff against base.

## Stop Conditions

Stop when repository state is dirty and isolation choice is unclear, branch names conflict, setup fails, or cleanup could delete work.
