# Orchestration Recipes

Prompt templates in `prompts/` are reusable recipes. When a user provides a URL, issue, PR, plan, local file, screenshot, or freeform target, treat that target as scope: read/fetch it before launching children and include it in every child task. Do not rely on parent conversation history when a recipe calls for fresh context.

## Prompt shortcut mapping

- `/gather-context-and-clarify`: launch `scout` and sometimes `researcher`; synthesize; ask unresolved clarification questions.
- `/parallel-review`: launch fresh-context `reviewer` agents with distinct angles; synthesize before applying fixes.
- `/review-loop`: parent runs worker → fresh reviewers → synthesized fix worker until clean or capped.
- `/parallel-research`: combine local `scout` context with external `researcher` evidence.
- `/parallel-context-build`: run chain-mode parallel `context-builder` passes with distinct temp outputs; synthesize context and meta-prompt sections.
- `/parallel-handoff-plan`: run external `researcher` plus local/strategy `context-builder` passes, then synthesize an implementation handoff plan.
- `/parallel-cleanup`: run review-only cleanup passes for simplicity, verbosity, and redundant tests.

## Parallel review

Use for adversarial review of a diff, plan, issue, file, or implemented work. Launch fresh-context reviewers with distinct angles generated from the target: correctness/regressions, tests/validation, simplicity/maintainability, security/privacy, performance, docs/API, or user-flow behavior.

Reviewers inspect files/diffs directly, return concise evidence-backed findings with file/line references, and avoid edits unless explicitly assigned a writer pass. Parent separates blockers, fixes worth doing now, optional improvements, and feedback to ignore/defer.

## Review loop

Use when implementation or current diff should be reviewed/fixed until reviewers stop finding fixes worth doing now.

Rules:

- Parent owns the loop and synthesis.
- One async `worker` writes at a time.
- Fresh-context reviewers inspect actual repo and diff.
- One async forked `worker` applies accepted fixes.
- Stop when no blockers/fixes remain, only optional feedback remains, an unapproved decision appears, or max rounds reached.
- Default max rounds: 3.

Treat async implementation completion as intermediate, not final, unless user requested worker-only or review-only output.

## Parallel research

Use when a question needs external evidence plus local implications. Pair `researcher` for official docs, specs, ecosystem behavior, recent changes, benchmarks, and primary sources with `scout` for repository files, patterns, constraints, tests, and integration points. Ask for source links/file ranges, confidence, gaps, and decision implications. Do not ask them to edit unless implementation was requested.

## Parallel context-build

Use before planning or implementation when stronger handoff context is needed. Prefer a chain with one parallel step so outputs share `{chain_dir}`.

```typescript
subagent({
  chain: [{
    parallel: [
      { agent: "context-builder", task: "Build request/scope context for: ...", output: "context-build/request-and-scope.md" },
      { agent: "context-builder", task: "Build codebase/pattern context for: ...", output: "context-build/codebase-and-patterns.md" },
      { agent: "context-builder", task: "Build validation/risk context for: ...", output: "context-build/validation-and-risks.md" }
    ]
  }],
  context: "fresh",
  async: true
})
```

Each builder should read relevant files, follow imports/callers/tests/docs/config, do tool-available web research when needed, and include a compact `meta-prompt` section. Parent synthesizes important context, recommended next prompt, open questions, assumptions, and artifact paths.

## Parallel handoff-plan

Use for a solution brief or worker-ready handoff from external reference plus local code context.

```typescript
subagent({
  chain: [
    { parallel: [
      { agent: "researcher", task: "Research external reference and transferable ideas for: ...", output: "handoff/external-reference.md" },
      { agent: "context-builder", task: "Build local codebase context for: ...", output: "handoff/local-context.md" },
      { agent: "context-builder", task: "Compare evidence and propose implementation strategy for: ...", output: "handoff/implementation-strategy.md" }
    ] },
    { agent: "context-builder", task: "Read {previous} and synthesize final handoff plan and implementation-ready meta-prompt.", output: "handoff/final-handoff-plan.md" }
  ],
  context: "fresh",
  async: true
})
```

Final handoff should include approach, likely files, constraints, non-goals, validation, risks, unresolved questions, and compact implementation-ready meta-prompt.

## Gather context and clarify

Start non-trivial work by launching `scout` for local context and `researcher` only when external evidence matters. Ask children for concise findings and remaining clarification questions. Then synthesize and ask the user only the unresolved questions needed for shared understanding before planning or implementation.

## Parallel cleanup

Use after implementation when cleanup review would reduce AI-slop. Launch two fresh-context `reviewer` tasks with `output: false` and `progress: false`: one deslop pass and one verbosity pass. If `deslop` or `verbosity-cleaner` skills are available, pass relevant skill; otherwise inline criteria. Review-only/no-edit beats artifact/progress instructions. Parent decides what to apply and asks before changes unless cleanup was already authorized.

## Oracle workflow

Oracle loop:

1. Parent forks to `oracle`.
2. `oracle` reviews direction, drift, assumptions, and risks.
3. `oracle` may coordinate back through injected bridge tools.
4. Parent decides what direction to approve.
5. Only then should `worker` implement.

`oracle` is not a fresh-context reviewer. It is a forked advisory thread that inherits parent history and audits trajectory: architecture boundaries, model routing, merge conflicts, reviewer disagreement, context drift, invented patterns, or product/scope tradeoffs. Keep oracle advisory unless explicitly assigned the single writer role.

## Full feature workflow

Use for new features, broad refactors, or risky changes:

1. Clarify first: gather local context, add external research only when material, then ask user questions until scope, acceptance criteria, constraints, and non-goals are clear.
2. Define validation contract: expected behavior, checks, user flows, and evidence required from worker.
3. Plan when useful; get approval for complex/risky work.
4. Implement with one async `worker` using clarified requirements, plan, validation contract, and output expectations.
5. Require worker handoff: changed files, implementation notes, undone work, commands with exit codes, validation evidence, risks, and decisions needing approval.
6. Review after implementation with fresh-context reviewer/validator fanout.
7. Parent synthesizes feedback; one async forked `worker` applies fixes worth doing now.
8. Review again when fixes are substantial or non-trivial.
9. Parent validates final diff and summarizes.

Example review fanout:

```typescript
subagent({
  tasks: [
    { agent: "reviewer", task: "Review current diff for correctness and regressions. Inspect changed files directly; do not edit.", output: false },
    { agent: "reviewer", task: "Review tests and validation quality against the validation contract. Do not edit.", output: false },
    { agent: "reviewer", task: "Review simplicity and maintainability. Do not edit.", output: false }
  ],
  concurrency: 3,
  context: "fresh",
  async: true
})
```

For large work, split into serial milestones. Each milestone gets one writer, validation contract, review/validation, fix pass, and parent acceptance before the next milestone.

## Saved chains

Use saved `.chain.md` workflows when the user wants repeatable multi-agent flow without rewriting the chain:

```text
/run-chain review-chain -- review this branch
```
