# Parent Workflow Guidance Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen prompt-only parent guidance so agents route debugging, design, planning, implementation, review, and completion work through pi-subagents workflows before acting.

**Architecture:** Keep this prompt-only. Update the injected parent guidance text in `src/runs/shared/subagent-guidance.ts`; preserve existing markers, agent listing, idempotent append behavior, and child prompt stripping. Tests assert guidance content and child-boundary behavior, not runtime enforcement.

**Tech Stack:** TypeScript, Node.js built-in test runner, `node --experimental-strip-types`, existing pi-subagents guidance/runtime helpers.

---

## File Structure

- Modify: `src/runs/shared/subagent-guidance.ts`
  - Responsibility: Builds and appends the parent-only `<!-- pi-subagents-guidance:start -->` system prompt block.
- Modify: `test/unit/subagent-guidance.test.ts`
  - Responsibility: Unit coverage for guidance block content, agent bullets, sorting, idempotence, and subagent tool detection.
- Modify: `test/unit/subagent-prompt-runtime.test.ts`
  - Responsibility: Unit coverage that forked child prompts strip parent-only guidance and keep child boundaries intact.
- Reference only: `docs/specs/2026-05-19-parent-workflow-guidance.md`
  - Responsibility: Approved prompt-only requirements.

---

### Task 1: Add failing parent guidance protocol tests

**Files:**
- Modify: `test/unit/subagent-guidance.test.ts`
- Test: `test/unit/subagent-guidance.test.ts`

- [ ] **Step 1: Replace the existing first test with stricter protocol assertions**

Replace the body of `it("builds a marked guidance block with agent bullets", ...)` with:

```ts
	it("builds a marked guidance block with parent workflow protocol and agent bullets", () => {
		const block = buildSubagentGuidanceBlock([agent("worker", "builtin", "Writes code"), agent("custom", "project", "Custom help")]);
		assert.ok(block.startsWith(SUBAGENT_GUIDANCE_START));
		assert.ok(block.endsWith(SUBAGENT_GUIDANCE_END));
		assert.ok(block.includes("Parent workflow protocol"));
		assert.ok(block.includes("Parent owns task routing, decisions, synthesis, and final user response."));
		for (const skill of [
			"brainstorming",
			"writing-plans",
			"executing-plans",
			"systematic-debugging",
			"test-driven-development",
			"requesting-code-review",
			"verification-before-completion",
		]) {
			assert.ok(block.includes(skill), `expected guidance to mention ${skill}`);
		}
		assert.match(block, /bugs, test failures, or unexpected behavior: no direct fix/i);
		assert.match(block, /launch `scout` or `context-builder` before fix\/worker/i);
		assert.match(block, /new behavior or features: no direct implementation/i);
		assert.match(block, /consult `oracle` when design tradeoffs exist/i);
		assert.match(block, /approval before implementation/i);
		assert.match(block, /use `worker` for scoped edits and `reviewer` for meaningful changes/i);
		assert.match(block, /Direct action is only for read-only answers, formatting\/typo-only edits, or single-file mechanical non-behavioral changes/i);
		assert.match(block, /does not apply to bugs, test failures, unexpected behavior, feature work, or completion claims/i);
		assert.match(block, /subagent launch or model failure permits fallback/i);
		assert.match(block, /disclose skipped or reduced workflow/i);
		assert.match(block, /prompt-level guidance only; no runtime enforcement is guaranteed/i);
		assert.ok(block.includes("Child subagents must not run orchestration workflows or launch more subagents unless explicitly authorized by the parent."));
		assert.ok(block.includes("- worker — Writes code"));
		assert.ok(block.includes("- custom — Custom help"));
		assert.ok(!block.includes("Do not call a list"));
	});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run:

```bash
node --experimental-strip-types --test --test-name-pattern "builds a marked guidance block" test/unit/subagent-guidance.test.ts
```

Expected: FAIL. Output includes assertion failure because current guidance does not contain `Parent workflow protocol`.

- [ ] **Step 3: Commit the red test**

```bash
git add test/unit/subagent-guidance.test.ts
git commit -m "test: specify parent workflow guidance protocol"
```

---

### Task 2: Add failing child stripping test coverage for expanded guidance

**Files:**
- Modify: `test/unit/subagent-prompt-runtime.test.ts`
- Test: `test/unit/subagent-prompt-runtime.test.ts`

- [ ] **Step 1: Expand the parent-only guidance stripping fixture**

In `it("strips parent-only subagent guidance blocks from child prompts", ...)`, replace the `prompt` constant with:

```ts
		const prompt = `Before\n\n${SUBAGENT_GUIDANCE_START}
## Subagent-driven development

### Parent workflow protocol
- Parent owns task routing, decisions, synthesis, and final user response.
- Bugs, test failures, or unexpected behavior: no direct fix; launch \`scout\` or \`context-builder\` before fix/worker.
- Child subagents must not run orchestration workflows or launch more subagents unless explicitly authorized by the parent.

Available subagents:
- worker — Writes code
${SUBAGENT_GUIDANCE_END}\n\nAfter`;
```

Then add these assertions after the existing `assert.ok(!rewritten.includes("Subagent-driven development"));` line:

```ts
		assert.ok(!rewritten.includes("Parent workflow protocol"));
		assert.ok(!rewritten.includes("no direct fix"));
		assert.ok(!rewritten.includes("launch `scout` or `context-builder`"));
```

- [ ] **Step 2: Run the targeted child stripping test**

Run:

```bash
node --experimental-strip-types --test --test-name-pattern "strips parent-only subagent guidance blocks" test/unit/subagent-prompt-runtime.test.ts
```

Expected: PASS. This proves the current marker-based stripper already removes expanded guidance. If it fails, stop and inspect `stripSubagentGuidanceBlock` before editing implementation text.

- [ ] **Step 3: Commit the child-boundary regression test**

```bash
git add test/unit/subagent-prompt-runtime.test.ts
git commit -m "test: keep expanded parent guidance out of child prompts"
```

---

### Task 3: Implement compact parent workflow protocol in injected guidance

**Files:**
- Modify: `src/runs/shared/subagent-guidance.ts`
- Test: `test/unit/subagent-guidance.test.ts`

- [ ] **Step 1: Replace only the returned guidance text in `buildSubagentGuidanceBlock`**

In `src/runs/shared/subagent-guidance.ts`, keep sorting, truncation, empty-agent behavior, and `bullets` unchanged. Replace the current template literal returned after `const bullets = ...` with:

```ts
	return `${SUBAGENT_GUIDANCE_START}
## Subagent-driven development

### Parent workflow protocol
- Parent owns task routing, decisions, synthesis, and final user response.
- Before acting, select the matching focused workflow skill: `brainstorming` for creative work/new behavior/design; `writing-plans` then `executing-plans` for multi-step implementation; `systematic-debugging` for bugs, test failures, or unexpected behavior; `test-driven-development` for testable changes; `requesting-code-review` for meaningful changes needing fresh review; `verification-before-completion` for completion claims.
- When the selected workflow calls for subagents, launch them before direct edits or fixes.
- Bugs, test failures, or unexpected behavior: no direct fix; reproduce or capture the failure, then launch `scout` or `context-builder` before fix/worker unless delegation is explicitly disabled or unavailable.
- New behavior or features: no direct implementation; use `brainstorming`, gather context, consult `oracle` when design tradeoffs exist, and get approval before implementation.
- Approved implementation: use `worker` for scoped edits and `reviewer` for meaningful changes; parent integrates results.
- Independent research, review, or validation: parallelize safe read-only subagents; serialize writes unless isolated.
- Direct action is only for read-only answers, formatting/typo-only edits, or single-file mechanical non-behavioral changes; this exception does not apply to bugs, test failures, unexpected behavior, feature work, or completion claims.
- Explicit no-delegation instructions or subagent launch or model failure permits fallback; disclose skipped or reduced workflow and avoid unsupported completion claims.
- Individual skill instructions override this summary when more specific and non-conflicting.
- This is prompt-level guidance only; no runtime enforcement is guaranteed.
- Child subagents must not run orchestration workflows or launch more subagents unless explicitly authorized by the parent.

Available subagents:
${bullets}
${SUBAGENT_GUIDANCE_END}`;
```

- [ ] **Step 2: Run the red guidance test again**

Run:

```bash
node --experimental-strip-types --test --test-name-pattern "builds a marked guidance block" test/unit/subagent-guidance.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run the full guidance test file**

Run:

```bash
node --experimental-strip-types --test test/unit/subagent-guidance.test.ts
```

Expected: PASS. Existing tests for empty agents, sorting, 30-agent limit, idempotent append, and tool detection still pass.

- [ ] **Step 4: Commit implementation**

```bash
git add src/runs/shared/subagent-guidance.ts test/unit/subagent-guidance.test.ts
git commit -m "feat: strengthen parent workflow guidance"
```

---

### Task 4: Verify child boundary and full unit suite

**Files:**
- Test: `test/unit/subagent-prompt-runtime.test.ts`
- Test: `test/unit/*.test.ts`

- [ ] **Step 1: Run child prompt runtime tests**

Run:

```bash
node --experimental-strip-types --test test/unit/subagent-prompt-runtime.test.ts
```

Expected: PASS. Expanded parent guidance is stripped from child prompts; `CHILD_SUBAGENT_BOUNDARY_INSTRUCTIONS` still appears once.

- [ ] **Step 2: Run all unit tests**

Run:

```bash
npm run test:unit
```

Expected: PASS. Expected summary includes `fail 0`.

- [ ] **Step 3: Review diff for prompt-only scope**

Run:

```bash
git diff -- src/runs/shared/subagent-guidance.ts test/unit/subagent-guidance.test.ts test/unit/subagent-prompt-runtime.test.ts
```

Expected: Diff only changes injected guidance text and related tests. No runtime enforcement, tool guards, child orchestration changes, or umbrella `pi-subagents` skill changes.

- [ ] **Step 4: Commit verification test update if not already committed**

```bash
git add test/unit/subagent-prompt-runtime.test.ts
git commit -m "test: verify child prompts strip workflow protocol"
```

If Task 2 was already committed and no files are staged, skip this commit and record `git status --short` output in the handoff.

---

## Self-Review Checklist

- Spec coverage: prompt-only guidance, task routing, delegation gate, bug/design/implementation/review/completion rules, narrow exception precedence, fallback disclosure, child boundary, tests, and validation are covered.
- Placeholder scan: no `TBD`, `TODO`, `implement later`, or unspecified tests.
- Type consistency: all referenced exports already exist: `buildSubagentGuidanceBlock`, `appendSubagentGuidanceToPrompt`, `stripSubagentGuidanceBlock`, `rewriteSubagentPrompt`, `SUBAGENT_GUIDANCE_START`, `SUBAGENT_GUIDANCE_END`.
