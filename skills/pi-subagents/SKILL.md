---
name: pi-subagents
description: |
  Delegate work to builtin or custom subagents with single-agent, chain,
  parallel, async, forked-context, and intercom-coordinated workflows. Use
  for advisory review, implementation handoffs, and multi-step tasks where a
  single agent should stay in control while other agents contribute context,
  planning, or execution.
---

# Pi Subagents

Parent-orchestrator skill only. Do not inject or follow it inside spawned child subagents. The parent owns delegation, orchestration, review fanout, and final fix-worker launches. Child subagents receive concrete role-specific tasks and must not run their own subagent workflows.

Use when the parent needs to launch specialized subagents, compose multiple agents into a workflow, or create/edit agents and chains on demand.

## Read extra reference when needed

- Full execution examples: [running-subagents.md](running-subagents.md)
- Prompt-template mappings and long playbooks: [orchestration-recipes.md](orchestration-recipes.md)
- Builtins, discovery, overrides, and agent authoring: [agents-and-management.md](agents-and-management.md)
- Parent/child intercom coordination: [intercom.md](intercom.md)
- Error catalog and diagnostics: [troubleshooting.md](troubleshooting.md)

## When to use

- Advisory review: fresh-context `reviewer` for adversarial diff/plan review; forked `oracle` for inherited decisions and drift.
- Implementation handoff: have `oracle` advise when useful, then `worker` implements only approved direction.
- Recon and planning: use `scout` or `context-builder`, then `planner` for non-trivial plans.
- Parallel exploration: run independent read/review/research tasks concurrently.
- Long-running work: launch async/background runs and inspect or resume later.
- Agent authoring: create, update, override, or delete agents/chains.

Do not delegate tiny tasks that are faster to do directly. Do not use subagents to avoid user decisions or to create a second decision-maker.

## Tool vs slash commands

Agents should use the `subagent(...)` tool for execution, management, status, and control. Humans often use `/run`, `/chain`, `/parallel`, `/run-chain`, and `/subagents-doctor`.

Packaged prompt shortcuts are recipes the parent can apply directly with tools: `/parallel-review`, `/review-loop`, `/parallel-research`, `/parallel-context-build`, `/parallel-handoff-plan`, `/gather-context-and-clarify`, and `/parallel-cleanup`. See [orchestration-recipes.md](orchestration-recipes.md).

## Core launch patterns

Check availability with `subagent({ action: "list" })` when agent/chain names, scope, or custom management state are uncertain; always do it before custom/management workflows.

Single advisory run:

```typescript
subagent({
  agent: "oracle",
  task: "Review my current direction and challenge assumptions.",
  async: true
})
```

Parallel read/review fanout:

```typescript
subagent({
  tasks: [
    { agent: "scout", task: "Map the auth flow" },
    { agent: "reviewer", task: "Review the current diff. Do not edit.", output: false }
  ],
  context: "fresh",
  async: true
})
```

Sequential chain:

```typescript
subagent({
  chain: [
    { agent: "scout", task: "Map the target area" },
    { agent: "planner", task: "Plan from {previous}" },
    { agent: "worker", task: "Implement the approved plan from {previous}" }
  ],
  async: true
})
```

Inspect or continue async work:

```typescript
subagent({ action: "status", id: "run-id" })
subagent({ action: "resume", id: "run-id", message: "Follow up on this point." })
```

## Prompt child agents as contracts

Give children compact role-specific contracts, not long procedural scripts:

- Goal and concrete outcome.
- Approved context/evidence: plan paths, files, diffs, decisions, constraints.
- Success criteria and validation expectations.
- Hard constraints: no edits for review-only tasks, one writer thread, no child subagents, escalate unapproved decisions.
- Expected output shape, artifact path, or finding format.
- Stop rules for enough evidence, ambiguity, or escalation.

Implementation handoffs must name approved scope, non-goals, validation contract, and what to report back. Reviewers should inspect repo/diff directly and return evidence-backed findings with file/line references.

## Context, output, and execution rules

- Prefer `async: true` unless foreground/blocking behavior is intentional.
- Keep writes single-threaded by default. Parallelize reading, research, review, validation, and synthesis.
- Use `worktree: true` only for deliberately parallel writers and only with a clean git state.
- Use `context: "fresh"` for adversarial reviewers. Use forked defaults for `oracle`, `planner`, and `worker` when inherited parent history matters.
- Fork requires a persisted parent session and inherits full parent history; it is not a filtered fresh context.
- Avoid duplicate output paths in parallel tasks. Use `outputMode: "file-only"` with `output` for large saved results.
- `output: false` means no file output; use it for review-only fanout when artifacts are not needed.
- Chains use `{task}`, `{previous}`, and `{chain_dir}` to pass summaries and artifact paths.

## Orchestration safety

- Parent keeps conversational authority. Advisory agents inform; parent decides.
- Children must not launch subagents, read this skill, or run orchestration loops.
- If a child hits unapproved product, architecture, API, security, or scope choices, escalate to parent/user instead of guessing.
- Treat async worker completion as an intermediate handoff for implementation work; review, synthesize, fix, and validate before final completion.
- Use `interrupt` only on clear control signals (`needs_attention`, user request, clear drift/blockage). Silence alone is not failure.
- Default nesting depth is 2 unless configured otherwise.

## Recommended feature workflow

For non-trivial changes:

1. Gather context with `scout`/`context-builder`; add `researcher` only when external evidence matters.
2. Clarify scope, acceptance criteria, constraints, and non-goals with the user when needed.
3. Define validation contract before implementation.
4. Plan when useful; get approval for risky or broad work.
5. Launch one async `worker` with approved scope and validation contract.
6. Run fresh-context reviewer/validator fanout on the resulting diff.
7. Parent synthesizes accepted fixes; one `worker` applies them.
8. Re-review when fixes are non-trivial, then validate and summarize.

See [orchestration-recipes.md](orchestration-recipes.md) for full playbooks.
