---
name: subagent-orchestration
description: Use when a parent session needs to delegate work to subagents, compose chains, run parallel read/review/research tasks, or enforce parent/child boundaries.
---

# Subagent Orchestration

Support skill for parent sessions. Pair with focused workflow skills when work needs delegation.

## Parent Role

- Parent owns scope, decisions, integration, and user communication.
- Parent chooses agents, supplies context, and validates returned work.
- Parent synthesizes child results; children do not decide final direction.

## Child Boundary

- Child subagents must not launch subagents unless the parent explicitly allows it.
- Child subagents should not invent workflow steps outside their prompt.
- Child subagents return findings, patches, or review notes, then stop.

## Launch Contracts

Every launch prompt should state:

1. Goal: exact outcome requested.
2. Context: files, plan, spec, decisions, and constraints.
3. Constraints: allowed edits, forbidden scope, style, tools, and risks.
4. Validation: commands or checks to run.
5. Output: expected summary, files changed, evidence, and blockers.
6. Stop rules: when to ask parent instead of guessing.

## Parallelism

- Parallelize independent read, research, scouting, and review tasks.
- Keep writes single-threaded by default.
- Use git worktrees before parallel writers touch overlapping repositories.
- Merge child outputs in parent context before launching follow-up workers.

## Escalation

Ask the user when scope, risk, irreversible operations, security, or architecture choices exceed the approved plan.
