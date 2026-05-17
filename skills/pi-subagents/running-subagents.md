# Running Subagents

Use these examples when the compact patterns in `SKILL.md` are not enough.

## Single agent

```typescript
subagent({
  agent: "oracle",
  task: "Review my current direction and challenge assumptions.",
  async: true
})
```

## Forked vs fresh context

`context: "fork"` creates a branched child session from the persisted parent session. It inherits parent history and is useful for `oracle`, `planner`, and `worker` when prior decisions matter. It does not filter history down to only relevant parts.

Use `context: "fresh"` for adversarial reviewers or when a child should inspect files/diffs without parent-conversation bias.

If forked runs fail with “Session manager did not return a session file,” persist the parent session or choose `context: "fresh"`.

## Parallel execution

```typescript
subagent({
  tasks: [
    { agent: "scout", task: "Map auth", output: "auth-context.md", progress: true },
    { agent: "researcher", task: "Research OAuth best practices", output: "oauth-research.md" },
    { agent: "reviewer", task: "Review auth tests", model: "anthropic/claude-sonnet-4" }
  ],
  concurrency: 3,
  context: "fresh",
  async: true
})
```

Avoid duplicate output paths. For large outputs use `outputMode: "file-only"` with `output`; parent result then contains only a compact saved-file reference. `output: false` means no file output.

## Chain execution

```typescript
subagent({
  chain: [
    { agent: "scout", task: "Map the auth flow and summarize key files" },
    { agent: "planner", task: "Create an implementation plan from {previous}" },
    { agent: "worker", task: "Implement the approved plan based on {previous}" }
  ],
  async: true
})
```

Chain variables:

- `{task}`: original chain task/request.
- `{previous}`: prior step response or compact file reference.
- `{chain_dir}`: shared temp directory for chain artifacts.

For parallel context-build or handoff-plan recipes, put parallel tasks inside a chain so relative output paths live under the chain directory.

## Async/background

Prefer async launches so the parent can keep working. Async does not authorize parallel edits to the same worktree. While a writer runs, the parent should inspect, prepare validation, synthesize, or review unaffected context.

```typescript
subagent({
  agent: "worker",
  task: "Run the full test suite and report failures with exit codes.",
  async: true
})
```

If no independent work remains and only polling would happen, end the turn. Pi will deliver async completion when it arrives.

Inspect runs:

```typescript
subagent({ action: "status", id: "run-id" })
subagent({ action: "status" })
```

Resume follow-up:

```typescript
subagent({ action: "resume", id: "run-id", message: "Follow up on this point." })
subagent({ action: "resume", id: "run-id", index: 1, message: "Continue reviewer 2." })
```

Resume sends to a live child when reachable. For completed children, it revives from the persisted child session. Multi-child runs require `index` unless only one child is selectable.

## Control and interruption

Control events are visibility signals, not lifecycle status. `needs_attention` means no activity has been observed past threshold; `paused` means interrupted or awaiting direction.

Interrupt only when a child is blocked, drifting, or the user asks:

```typescript
subagent({ action: "interrupt", id: "run-id" })
```

After interrupt, decide explicitly: resume with clearer instructions, replace the task, ask the user, or stop.

Override thresholds for quiet long-running work:

```typescript
subagent({
  agent: "worker",
  task: "Run the slow migration test suite",
  control: { needsAttentionAfterMs: 300000, notifyOn: ["needs_attention"] },
  async: true
})
```

## Clarify TUI

Single and parallel runs support launch preview/editing:

```typescript
subagent({ agent: "worker", task: "Implement feature X", clarify: true })
```

Chains default to clarify mode; set `clarify: false` to skip it. For programmatic background chains, pass `async: true` and set `clarify: false` when needed.

## Worktree isolation

Use worktrees for intentionally parallel writers:

```typescript
subagent({
  tasks: [
    { agent: "worker", task: "Implement feature A" },
    { agent: "worker", task: "Implement feature B" }
  ],
  worktree: true,
  async: true
})
```

`worktree: true` creates a git worktree per parallel task from `HEAD`. It requires a clean git state. Prefer one writer plus advisory agents for normal workflows.

## Diagnostics

```typescript
subagent({ action: "doctor" })
```

Humans can run `/subagents-doctor` for the same read-only report.
