# Parent workflow guidance conformance

## Decision
Update prompt-only parent guidance injected by pi-subagents. Do not add runtime/tool enforcement.

## Goals
- Make parent agents route tasks through focused workflow skills before acting.
- Make required subagent usage explicit when a workflow calls for it.
- Cover debugging, feature/design work, planning/execution, reviews, TDD, and completion claims.
- Preserve child boundary: child subagents must not inherit parent orchestration protocol or launch subagents unless explicitly authorized.

## Non-goals
- No runtime blocking, tool guards, or mechanical enforcement.
- No umbrella `pi-subagents` skill reintroduction.
- No full skill text duplication in system prompt.

## Prompt rules
Injected guidance should include a compact `Parent workflow protocol` with these rules:

1. Parent owns routing, decisions, synthesis, and final response.
2. Before acting, select matching focused workflow skill:
   - creative/new behavior/design: `brainstorming`
   - multi-step implementation: `writing-plans` then `executing-plans`
   - bugs/test failures/unexpected behavior: `systematic-debugging`
   - testable changes: `test-driven-development`
   - meaningful changes needing fresh review: `requesting-code-review`
   - completion claims: `verification-before-completion`
3. When selected workflow calls for subagents, launch them before direct edits/fixes.
4. Bugs/test failures: no direct fix; reproduce/capture failure, then launch `scout` or `context-builder` before fix/worker unless delegation is explicitly disabled or unavailable.
5. New behavior/features: no direct implementation; use `brainstorming`, gather context, consult `oracle` for tradeoffs, get approval before implementation.
6. Approved implementation: use `worker` for scoped edits and `reviewer` for meaningful changes; parent integrates results.
7. Independent research/review/validation: parallelize safe read-only subagents; serialize writes unless isolated.
8. Direct action exception is narrow: read-only answers, formatting/typo-only edits, or single-file mechanical non-behavioral changes. This exception does not apply to bugs, test failures, unexpected behavior, feature work, or completion claims.
9. Explicit no-delegation or subagent launch/model failure permits fallback, but parent must disclose skipped/reduced workflow and avoid unsupported completion claims.
10. Individual skill instructions override this summary when more specific and non-conflicting.
11. Guidance is prompt-level only; no runtime enforcement is guaranteed.
12. Child boundary remains: children do not run orchestration workflows or launch subagents unless parent explicitly authorizes it.

## Tests
TDD updates:
- `test/unit/subagent-guidance.test.ts`
  - RED assertions for `Parent workflow protocol`.
  - Task routing skill names.
  - Bug/test no-direct-fix + `scout`/`context-builder` rule.
  - Feature/design `brainstorming` + `oracle` + approval rule.
  - `worker`/`reviewer` implementation rule.
  - Narrow exception + fallback disclosure.
  - Prompt-level/no runtime enforcement.
  - Existing marker/idempotence/agent-list behavior remains.
- `test/unit/subagent-prompt-runtime.test.ts`
  - Ensure expanded guidance block is stripped from child prompt context.

## Validation
- `npm run test:unit`
- Review diff for prompt noise and child-boundary regressions.
