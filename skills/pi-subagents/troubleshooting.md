# Troubleshooting

## Unknown agent

```typescript
subagent({ action: "list" })
```

Check available agents/chains, scope, package-qualified names, and precedence. Project agents override user agents; user/project agents override builtins.

## Setup, discovery, or intercom confusion

```typescript
subagent({ action: "doctor" })
```

Doctor checks runtime paths, discovery counts, async support, current session context, and intercom bridge state. Humans can use `/subagents-doctor`.

## Max subagent depth exceeded

Flatten the workflow or raise `maxSubagentDepth` in config. Child subagents should generally not launch more subagents.

## Session manager did not return a session file

Forked context requires a persisted parent session. Persist the parent session, use a foreground/fresh run, or pass `context: "fresh"` when inheritance is not needed.

## Intercom “Already waiting for a reply”

A session has one pending outbound ask wait state. Resolve the current ask before starting another. Use `intercom({ action: "pending" })` if needed.

## Parallel output-path conflict

Give every parallel task a distinct output path or disable output for tasks that do not need it. Use `outputMode: "file-only"` plus `output` for large saved artifacts.

## Worktree launch fails

Ensure git working tree is clean and task `cwd` overrides match the shared cwd. Worktrees are for deliberate parallel writers; normal work should use one writer.

## Child fails before starting

Inspect run status and artifacts:

```typescript
subagent({ action: "status", id: "run-id" })
```

Check artifact metadata/output logs and run doctor. Extension loader errors usually appear in child output logs.

## Needs-attention notification

`needs_attention` means no activity has been observed past threshold. It is not proof the child is stuck. Check status, nudge if a bridge target exists, or interrupt only when clearly blocked/drifting.

```typescript
subagent({ action: "interrupt", id: "run-id" })
```

After interrupt, resume with clearer instructions, replace task, ask user, or stop.

## Forked run has too much context

Fork inherits parent history. Use `context: "fresh"` when the child should inspect repo/diff directly without parent-conversation bias.

## Reviewers edited files unexpectedly

Make review prompts explicit: “Do not edit files; return findings only.” Use `output: false` for review-only fanout when artifacts are unnecessary. Parent should apply accepted fixes through one writer.
