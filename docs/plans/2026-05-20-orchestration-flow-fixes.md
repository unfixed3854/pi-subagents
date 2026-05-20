# Orchestration Flow Fixes Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update active subagent guidance so plans live only under `docs/plans/`, plan execution runs one worker per unchecked task with review before advancing, and brainstorming includes external research when facts require it.

**Architecture:** This is a prompt/guidance change, not runtime enforcement. Update active agent files, workflow skills, parent guidance text, slash prompt inventory, and documentation references together; add regression tests that read guidance files and generated parent guidance so stale behavior does not return.

**Tech Stack:** Markdown prompt files, TypeScript guidance builder, Node.js built-in test runner, `node --experimental-strip-types --test`.

---

## Parent Execution Protocol For This Plan

Use this protocol for every task below:

1. Parent reads this plan and identifies the first unchecked task.
2. Parent launches exactly one `worker` for that task only, with this plan path and the task section.
3. Parent inspects the worker result and runs the task validation command.
4. If the task changed files beyond documentation-only wording, parent launches one `reviewer` with the same plan path, changed files, and validation output.
5. Parent sends accepted reviewer fixes back through `worker`; parent re-runs validation.
6. Parent marks the task complete only after validation and review evidence are present.
7. Parent may commit at the task boundary using the commit step in that task unless the user says not to commit.

## Scope Check

Single subsystem: active prompt and orchestration guidance for pi-subagents. The slash prompt deletion, README cleanup, agent defaults, skills, generated parent guidance, and tests all describe the same user-visible orchestration behavior and should ship together.

## File Structure

- Modify `agents/planner.md`: remove root `plan.md` output behavior from active planner instructions while preserving dated plan output and commit-step guidance.
- Modify `agents/worker.md`: stop implying implicit root `plan.md`; require parent-supplied plan/spec/progress paths and assigned task scope.
- Modify `agents/reviewer.md`: stop defaulting to implicit root files; require parent-supplied plan/progress/diff paths when relevant.
- Modify `skills/brainstorming/SKILL.md`: keep local context gathering, add `researcher` when external/library/API/docs/current-practice facts matter, and keep clarifying questions unchanged.
- Modify `skills/executing-plans/SKILL.md`: make one-worker-per-current-unchecked-task plus reviewer/fix-worker loop explicit.
- Modify `skills/subagent-driven-development/SKILL.md`: align approved implementation flow with scoped worker, reviewer, accepted fixes through worker, and task-boundary commits.
- Modify `src/runs/shared/subagent-guidance.ts`: update generated parent guidance block to match active workflow behavior.
- Modify `test/unit/subagent-guidance.test.ts`: assert generated guidance mentions one-worker-per-task, researcher for external facts, no root plan summary behavior, and reviewer-before-advance behavior.
- Create `test/unit/active-guidance.test.ts`: assert active Markdown guidance does not reintroduce implicit root `plan.md` reads/writes or the deleted slash prompt reference.
- Modify `README.md`: remove active mention of `/parallel-handoff-plan`; tighten examples that imply one worker executes an entire plan without per-task review.
- Delete `prompts/parallel-handoff-plan.md`: remove inactive automatic orchestration prompt.
- Delete `plan.md`: remove stale root plan artifact from the repository.

## Validation Commands

Run targeted tests after the relevant task:

```bash
npm run test:unit -- test/unit/subagent-guidance.test.ts
```

Run the full unit suite before final completion:

```bash
npm run test:unit
```

Expected full-suite result: all unit tests pass with Node's built-in test runner.

### Task 1: Add Active Guidance Regression Tests

**Files:**
- Modify: `test/unit/subagent-guidance.test.ts`
- Create: `test/unit/active-guidance.test.ts`
- Test: `test/unit/subagent-guidance.test.ts`
- Test: `test/unit/active-guidance.test.ts`

- [ ] **Step 1: Extend generated guidance assertions**

In `test/unit/subagent-guidance.test.ts`, inside the first test named `builds a marked guidance block with parent workflow protocol and agent bullets`, add these assertions after the existing assertion that matches `use \`worker\` for scoped edits and \`reviewer\` for meaningful changes`:

```ts
		assert.match(block, /planner writes full plans to `docs\/plans\/YYYY-MM-DD-<feature-name>\.md` and returns that saved path/i);
		assert.match(block, /does not create or summarize to root `plan\.md`/i);
		assert.match(block, /workers and reviewers read explicit plan, spec, progress, or diff paths supplied by the parent/i);
		assert.match(block, /execute one current unchecked plan task with one `worker`, validate it, review meaningful changes, route accepted fixes through `worker`, then advance/i);
		assert.match(block, /brainstorming starts local context gathering and also starts `researcher` when external facts are needed/i);
```

- [ ] **Step 2: Create active Markdown guidance test file**

Create `test/unit/active-guidance.test.ts` with this complete content:

```ts
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function readRepoFile(relativePath: string): string {
	return fs.readFileSync(path.join(projectRoot, relativePath), "utf-8");
}

test("planner active guidance writes dated plan files and not root plan summaries", () => {
	const planner = readRepoFile("agents/planner.md");
	assert.match(planner, /Save full plans to:\*\* `docs\/plans\/YYYY-MM-DD-<feature-name>\.md`/);
	assert.match(planner, /return the saved plan path/i);
	assert.doesNotMatch(planner, /After saving the full plan, write `plan\.md`/);
	assert.doesNotMatch(planner, /Summary written to `plan\.md`/);
});

test("worker and reviewer do not default to implicit root plan files", () => {
	const worker = readRepoFile("agents/worker.md");
	const reviewer = readRepoFile("agents/reviewer.md");
	assert.doesNotMatch(worker, /defaultReads: context\.md, plan\.md/);
	assert.doesNotMatch(reviewer, /defaultReads: plan\.md, progress\.md/);
	assert.match(worker, /read the explicit plan, spec, progress, and task paths supplied by the parent/i);
	assert.match(reviewer, /read the explicit plan, progress, diff, and requirement paths supplied by the parent/i);
});

test("workflow skills describe per-task execution, review, and external research", () => {
	const brainstorming = readRepoFile("skills/brainstorming/SKILL.md");
	const executing = readRepoFile("skills/executing-plans/SKILL.md");
	const development = readRepoFile("skills/subagent-driven-development/SKILL.md");
	assert.match(brainstorming, /Launch `context-builder` for local context/i);
	assert.match(brainstorming, /Launch `researcher` when the request depends on external facts/i);
	assert.match(executing, /Launch one `worker` for the current unchecked task only/i);
	assert.match(executing, /Launch `reviewer` for meaningful changes before moving to the next task/i);
	assert.match(development, /Route accepted review fixes through `worker`/i);
	assert.match(development, /commit at the task boundary/i);
});

test("removed parallel handoff prompt is not packaged or documented as active", () => {
	assert.equal(fs.existsSync(path.join(projectRoot, "prompts", "parallel-handoff-plan.md")), false);
	const readme = readRepoFile("README.md");
	assert.doesNotMatch(readme, /\/parallel-handoff-plan/);
});

test("root plan artifact is absent from active repository state", () => {
	assert.equal(fs.existsSync(path.join(projectRoot, "plan.md")), false);
});
```

- [ ] **Step 3: Run targeted tests and confirm they fail**

Run:

```bash
node --experimental-strip-types --test test/unit/subagent-guidance.test.ts test/unit/active-guidance.test.ts
```

Expected: FAIL. Failures should cite missing parent-guidance phrases, stale planner `plan.md` summary wording, worker/reviewer `defaultReads`, existing `prompts/parallel-handoff-plan.md`, README `/parallel-handoff-plan`, or existing root `plan.md`.

- [ ] **Step 4: Commit failing tests**

```bash
git add test/unit/subagent-guidance.test.ts test/unit/active-guidance.test.ts
git commit -m "test: cover active orchestration guidance"
```

### Task 2: Fix Planner, Worker, and Reviewer Active Agent Guidance

**Files:**
- Modify: `agents/planner.md`
- Modify: `agents/worker.md`
- Modify: `agents/reviewer.md`
- Test: `test/unit/active-guidance.test.ts`

- [ ] **Step 1: Update planner frontmatter and plan output instructions**

In `agents/planner.md`, remove this frontmatter line:

```yaml
output: plan.md
```

Replace the `Save full plans to` block with:

```markdown
**Save full plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`
- (User preferences for plan location override this default)
- Use the `write` tool to save the full implementation plan there.
- Return the saved plan path and a concise summary in your final response.
- Do not create, update, or summarize to root `plan.md`; dated files under `docs/plans/` are canonical.
```

Replace the `Execution Handoff` section with:

```markdown
## Execution Handoff

After saving the full plan, return a non-interactive handoff:

**"Plan complete and saved to `docs/plans/<filename>.md`. Parent/user can launch `worker` with this plan path."**
```

Do not remove the task template commit step or `Frequent commits` guidance.

- [ ] **Step 2: Update worker frontmatter and context instructions**

In `agents/worker.md`, replace this frontmatter line:

```yaml
defaultReads: context.md, plan.md
```

with:

```yaml
defaultReads: context.md
```

Replace this paragraph:

```markdown
Use the provided tools directly. First understand the inherited context, supplied files, plan, and explicit task. Then implement carefully and minimally.
```

with:

```markdown
Use the provided tools directly. First understand the inherited context and read the explicit plan, spec, progress, and task paths supplied by the parent. Do not assume root `plan.md` exists. Then implement carefully and minimally.
```

Replace this working rule:

```markdown
- If there is supplied context or a plan, read it first.
```

with:

```markdown
- If the parent supplies a plan, spec, progress file, changed-file list, or task path, read those explicit paths first.
```

- [ ] **Step 3: Update reviewer frontmatter and read rules**

In `agents/reviewer.md`, remove this frontmatter line:

```yaml
defaultReads: plan.md, progress.md
```

Replace this working rule:

```markdown
- Read the plan, progress, and relevant files first when available.
```

with:

```markdown
- Read the explicit plan, progress, diff, and requirement paths supplied by the parent when available; do not assume root `plan.md` or `progress.md` exists.
```

- [ ] **Step 4: Run active guidance test and confirm remaining failures are outside agent files**

Run:

```bash
node --experimental-strip-types --test test/unit/active-guidance.test.ts
```

Expected: FAIL only on workflow skill text, removed prompt/README/root artifact, or other tasks not yet implemented. Expected no failures about planner root summaries or worker/reviewer implicit default reads.

- [ ] **Step 5: Commit agent guidance changes**

```bash
git add agents/planner.md agents/worker.md agents/reviewer.md
git commit -m "fix: remove implicit root plan guidance from agents"
```

### Task 3: Align Workflow Skills With Approved Orchestration

**Files:**
- Modify: `skills/brainstorming/SKILL.md`
- Modify: `skills/executing-plans/SKILL.md`
- Modify: `skills/subagent-driven-development/SKILL.md`
- Test: `test/unit/active-guidance.test.ts`

- [ ] **Step 1: Update brainstorming process**

In `skills/brainstorming/SKILL.md`, replace the `## Process` numbered list with:

```markdown
## Process

1. Launch `context-builder` for local context: inspect files, docs, recent commits, patterns, constraints, tests, risks, and integration points.
2. Launch `researcher` when the request depends on external facts such as library behavior, APIs, documentation, standards, current best practices, external references, or recent ecosystem changes.
3. Ask clarifying questions with `ask_user`, one focused question at a time, when required to choose scope or intent before design approval.
4. Launch `oracle` with gathered local context, external research when used, and user answers; request 2-3 approaches, trade-offs, and a recommendation.
5. Present the recommended design in sections scaled to complexity; get user approval.
6. Write the approved spec to a path such as `docs/specs/2026-05-19-superpowers-migration-design.md`.
7. Self-review for incomplete markers, contradictions, ambiguity, and scope creep.
8. Launch `reviewer` to review the written spec; apply accepted fixes inline.
9. Ask the user to review the spec file before planning.
10. Launch `planner` with the approved spec path.
```

- [ ] **Step 2: Update brainstorming subagent contracts**

In the `## Subagent Contracts` section of `skills/brainstorming/SKILL.md`, replace the existing bullet list with:

```markdown
- `context-builder`: local codebase context, constraints, integration points, and validation paths.
- `researcher`: external/library/API/docs/standards/current-practice evidence with sources when external facts are needed.
- `oracle`: design alternatives and recommendation based on gathered evidence.
- `reviewer`: spec completeness, ambiguity, contradictions, and scope control.
- `planner`: implementation plan from the approved spec path.
```

- [ ] **Step 3: Update executing plans process**

In `skills/executing-plans/SKILL.md`, replace the `## Process` numbered list with:

```markdown
## Process

1. Read the full plan path supplied by the user or planner and identify the current unchecked task.
2. Verify prerequisites, scope, expected changed files, and validation commands for that task.
3. Launch one `worker` for the current unchecked task only; include the plan path, task heading, constraints, and validation commands.
4. Inspect worker results, changed files, and command output; run or verify requested checks.
5. Launch `reviewer` for meaningful changes before moving to the next task.
6. Send accepted reviewer fixes back through `worker`; re-review when fixes are substantial.
7. Mark the task complete only after evidence is available.
8. Commit at the task boundary when the plan includes a commit step and the user has not said otherwise.
9. Repeat from step 1 for the next unchecked task.
```

- [ ] **Step 4: Update executing plans contracts**

In `skills/executing-plans/SKILL.md`, replace the `## Subagent Contracts` bullets with:

```markdown
- `worker`: implement only the assigned current unchecked task and report changed files, commands, and blockers.
- `reviewer`: compare changes to the plan task, tests, edge cases, and simplicity before the parent advances.
```

- [ ] **Step 5: Update subagent-driven development process**

In `skills/subagent-driven-development/SKILL.md`, replace the `## Process` numbered list with:

```markdown
## Process

1. Classify the request: new behavior, approved implementation, bug, review, validation, or research.
2. For approved implementation, provide `worker` the explicit plan/spec/progress path and only the current scoped task.
3. Validate worker output and changed files before synthesizing progress.
4. Launch `reviewer` for meaningful changes.
5. Route accepted review fixes through `worker`; do not patch reviewer feedback directly unless it is a trivial parent-only documentation correction.
6. Commit at the task boundary when the plan includes a commit step and the user has not said otherwise.
7. Continue to the next task only after validation and review evidence are complete.
```

- [ ] **Step 6: Update subagent-driven development contracts**

In `skills/subagent-driven-development/SKILL.md`, replace the `## Subagent Contracts` bullets with:

```markdown
- `worker`: scoped implementation for the explicit current task, plan/spec/progress paths, validation commands, and blocker reporting.
- `reviewer`: fresh inspection of meaningful changes against the task, requirements, tests, edge cases, and simplicity.
- `oracle`: decision support for design tradeoffs before implementation scope is approved.
```

- [ ] **Step 7: Run active guidance test and confirm remaining failures are outside skills**

Run:

```bash
node --experimental-strip-types --test test/unit/active-guidance.test.ts
```

Expected: FAIL only on removed prompt/README/root artifact or generated parent guidance not yet implemented. Expected no failures about skill workflow text.

- [ ] **Step 8: Commit skill guidance changes**

```bash
git add skills/brainstorming/SKILL.md skills/executing-plans/SKILL.md skills/subagent-driven-development/SKILL.md
git commit -m "fix: align workflow skills with task-by-task orchestration"
```

### Task 4: Update Generated Parent Guidance

**Files:**
- Modify: `src/runs/shared/subagent-guidance.ts`
- Modify: `test/unit/subagent-guidance.test.ts`
- Test: `test/unit/subagent-guidance.test.ts`

- [ ] **Step 1: Replace parent workflow protocol bullets in TypeScript guidance**

In `src/runs/shared/subagent-guidance.ts`, inside `buildSubagentGuidanceBlock`, replace the Markdown bullets under `### Parent workflow protocol` with this text. Keep `${bullets}` and `${SUBAGENT_GUIDANCE_END}` unchanged after `Available subagents:`.

```ts
### Parent workflow protocol
- Parent owns task routing, decisions, synthesis, and final user response.
- Before acting, select the matching focused workflow skill: \`brainstorming\` for creative work/new behavior/design; \`writing-plans\` then \`executing-plans\` for multi-step implementation; \`systematic-debugging\` for bugs, test failures, or unexpected behavior; \`test-driven-development\` for testable changes; \`requesting-code-review\` for meaningful changes needing fresh review; \`verification-before-completion\` for completion claims.
- Planner writes full plans to \`docs/plans/YYYY-MM-DD-<feature-name>.md\` and returns that saved path. Planner does not create or summarize to root \`plan.md\`.
- Workers and reviewers read explicit plan, spec, progress, or diff paths supplied by the parent. Do not rely on implicit root \`plan.md\`.
- Plan execution: execute one current unchecked plan task with one \`worker\`, validate it, review meaningful changes, route accepted fixes through \`worker\`, then advance to the next unchecked task.
- Preserve planner commit steps. Parent may commit at the task boundary after validation and review unless the user says otherwise.
- Brainstorming starts local context gathering and also starts \`researcher\` when external facts are needed, including library behavior, APIs, docs, standards, external references, or current best practices.
- Clarifying questions remain focused and are asked before design approval when needed.
- When the selected workflow calls for subagents, launch them before direct edits or fixes.
- Bugs, test failures, or unexpected behavior: no direct fix; reproduce or capture the failure, then launch \`scout\` or \`context-builder\` before fix/worker unless delegation is explicitly disabled or unavailable.
- New behavior or features: no direct implementation; use \`brainstorming\`, gather context, consult \`oracle\` when design tradeoffs exist, and get approval before implementation.
- Approved implementation: use \`worker\` for scoped edits and \`reviewer\` for meaningful changes; parent integrates results.
- Independent research, review, or validation: parallelize safe read-only subagents; serialize writes unless isolated.
- Direct action is only for read-only answers, formatting/typo-only edits, or single-file mechanical non-behavioral changes; this exception does not apply to bugs, test failures, unexpected behavior, feature work, or completion claims.
- Explicit no-delegation instructions or subagent launch or model failure permits fallback; disclose skipped or reduced workflow and avoid unsupported completion claims.
- Individual skill instructions override this summary when more specific and non-conflicting.
- This is prompt-level guidance only; no runtime enforcement is guaranteed.
- Child subagents must not run orchestration workflows or launch more subagents unless explicitly authorized by the parent.
```

- [ ] **Step 2: Run generated guidance test**

Run:

```bash
node --experimental-strip-types --test test/unit/subagent-guidance.test.ts
```

Expected: PASS. If a regex fails because of punctuation only, adjust the test regex to match the exact final guidance wording without weakening the behavioral assertions.

- [ ] **Step 3: Run active guidance test and confirm remaining failures are cleanup only**

Run:

```bash
node --experimental-strip-types --test test/unit/active-guidance.test.ts
```

Expected: FAIL only on `prompts/parallel-handoff-plan.md`, README `/parallel-handoff-plan`, or root `plan.md` until Task 5 is complete.

- [ ] **Step 4: Commit generated guidance changes**

```bash
git add src/runs/shared/subagent-guidance.ts test/unit/subagent-guidance.test.ts
git commit -m "fix: update parent orchestration guidance"
```

### Task 5: Remove Inactive Handoff Prompt and Root Plan Artifact

**Files:**
- Modify: `README.md`
- Delete: `prompts/parallel-handoff-plan.md`
- Delete: `plan.md`
- Test: `test/unit/active-guidance.test.ts`

- [ ] **Step 1: Remove active README slash command row**

In `README.md`, delete this row from the slash command table:

```markdown
| `/parallel-handoff-plan` | Combine external research and `context-builder` passes into an implementation handoff plan and meta-prompt. |
```

- [ ] **Step 2: Tighten README plan execution wording if present**

Search `README.md` for the sentence:

```markdown
Have worker implement this approved plan. Afterward, run parallel reviewers, summarize their feedback, and apply the fixes that make sense.
```

Replace it with:

```markdown
Execute this approved plan task-by-task: run one worker for the current unchecked task, validate it, run reviewer for meaningful changes, route accepted fixes through worker, then advance.
```

Search `README.md` for the sentence:

```markdown
Run a review loop on this change until reviewers stop finding fixes worth doing, with a max of 3 rounds.
```

Leave it unchanged; review-loop behavior remains active.

- [ ] **Step 3: Delete removed prompt file**

Run:

```bash
rm prompts/parallel-handoff-plan.md
```

Expected: file no longer exists.

- [ ] **Step 4: Delete root plan artifact**

Run:

```bash
rm plan.md
```

Expected: file no longer exists. If `rm` says `No such file or directory`, continue because the desired state is already true.

- [ ] **Step 5: Run active guidance test**

Run:

```bash
node --experimental-strip-types --test test/unit/active-guidance.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit cleanup changes**

```bash
git add README.md test/unit/active-guidance.test.ts
git rm prompts/parallel-handoff-plan.md plan.md
git commit -m "fix: remove inactive root plan and handoff prompt"
```

### Task 6: Final Validation and Repository-Wide Stale Guidance Scan

**Files:**
- Modify if scan finds active stale behavior: `README.md`, `agents/*.md`, `skills/*/SKILL.md`, `src/runs/shared/subagent-guidance.ts`, `test/unit/*.test.ts`
- Test: `test/unit/subagent-guidance.test.ts`
- Test: `test/unit/active-guidance.test.ts`

- [ ] **Step 1: Run stale active behavior scan**

Run:

```bash
grep -RIn "After saving the full plan, write `plan.md`\|Summary written to `plan.md`\|defaultReads: context.md, plan.md\|defaultReads: plan.md, progress.md\|/parallel-handoff-plan" agents skills src test README.md package.json prompts 2>/dev/null || true
```

Expected output: no matches. Matches under historical files in `docs/specs/` or `docs/plans/` are not included in this command and should not be edited.

- [ ] **Step 2: Run plan location scan**

Run:

```bash
grep -RIn "docs/plans/YYYY-MM-DD-<feature-name>.md" agents skills src test README.md | head -20
```

Expected output includes `agents/planner.md` and `src/runs/shared/subagent-guidance.ts`.

- [ ] **Step 3: Run targeted unit tests**

Run:

```bash
node --experimental-strip-types --test test/unit/subagent-guidance.test.ts test/unit/active-guidance.test.ts
```

Expected: PASS.

- [ ] **Step 4: Run full unit test suite**

Run:

```bash
npm run test:unit
```

Expected: PASS. Node test output should report all unit tests passing.

- [ ] **Step 5: Inspect final diff**

Run:

```bash
git diff --stat && git diff -- agents/planner.md agents/worker.md agents/reviewer.md skills/brainstorming/SKILL.md skills/executing-plans/SKILL.md skills/subagent-driven-development/SKILL.md src/runs/shared/subagent-guidance.ts test/unit/subagent-guidance.test.ts test/unit/active-guidance.test.ts README.md package.json
```

Expected: diff shows only active guidance/test/docs cleanup. No historical changelog/spec/archive rewrites. `package.json` should normally have no diff because `prompts/**/*` already packages remaining prompts generically.

- [ ] **Step 6: Commit final validation fixes if any were needed**

If Step 1 or Step 4 required a small corrective edit, commit it:

```bash
git add agents skills src test README.md package.json
git commit -m "fix: finish orchestration guidance cleanup"
```

If no files changed after Task 5, do not create an empty commit.

## Self-Review Checklist

- Spec requirement 1 covered by Task 2 and Task 4: planner saves dated plans only.
- Spec requirement 2 covered by Task 2: planner returns path and does not create root summary.
- Spec requirement 3 covered by Task 2 and Task 4: worker/reviewer use explicit parent-supplied paths.
- Spec requirements 4-6 covered by Task 3 and Task 4: one worker per unchecked task, validation, reviewer, accepted fixes through worker, task-boundary commits preserved.
- Spec requirement 7 covered by Task 3 and Task 4: brainstorming starts local context and researcher for external facts.
- Spec requirement 8 covered by Task 3 and Task 4: clarifying questions remain focused and before design approval.
- Non-goals covered by Task 6 scan scope: no historical changelog/spec/archive rewrites.
- Removed active prompt and root artifact covered by Task 5.
- Tests covered by Tasks 1, 4, 5, and 6.
