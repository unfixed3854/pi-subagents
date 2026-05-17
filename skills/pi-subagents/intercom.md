# Intercom Coordination

`pi-subagents` works without `pi-intercom`. When `pi-intercom` is installed and enabled, the bridge can give child agents a private coordination channel back to the parent.

## Child-side rules

Most children should not call generic `intercom` directly unless bridge instructions provide a target and `contact_supervisor` is unavailable. Do not invent a target. Prefer the tool from injected bridge instructions.

Use `contact_supervisor` with `reason: "need_decision"` when:

- A child is blocked on a decision.
- Clarification is safer than guessing.
- Approval, product, API, security, or scope choice is required before continuing.

Do not use it just to resolve review-only/no-edit versus progress/artifact instructions. No-edit wins; return review findings without touching files.

Use `contact_supervisor` with `reason: "progress_update"` when:

- Parent explicitly asked for progress.
- Meaningful discovery changes the plan.
- A long-running child needs to report a blocked/progress checkpoint without waiting for normal completion.

## Message conventions

- `reason: "need_decision"` waits for parent reply and returns it to child.
- `reason: "progress_update"` is non-blocking and concise.
- Routine child completion handoffs are not expected through child intercom.

Example child ask:

```typescript
contact_supervisor({
  reason: "need_decision",
  message: "Should I optimize for readability or performance here?"
})
```

Parent reply:

```typescript
intercom({ action: "reply", message: "Optimize for readability." })
```

Inspect unresolved asks first:

```typescript
intercom({ action: "pending" })
```

## Parent-side grouped results

With the bridge active, parent-side `pi-subagents` sends grouped completion results through `pi-intercom`: one grouped message per foreground parent run and one per completed async result file.

Acknowledged foreground delivery returns a compact receipt with artifact/session paths. If unacknowledged, normal full output is preserved. Grouped messages include child intercom targets and full child summaries.

## Blocking and diagnostics

Intercom asks are blocking: a session can maintain only one pending outbound ask wait state at a time. Resolve the current ask before starting another.

If messages do not show up, run:

```typescript
subagent({ action: "doctor" })
```

or ask the human to run `/subagents-doctor`.
