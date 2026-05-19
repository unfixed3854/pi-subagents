# Superpowers Migration Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the umbrella pi-subagents skill with a complete subagent-native Superpowers workflow suite.

**Architecture:** Keep existing child agents as execution primitives. Add focused parent skills and support skills. Update system prompt guidance so parent sessions discover and apply focused workflows before implementation, debugging, review, and completion.

**Tech Stack:** TypeScript, Node test runner, Pi skill markdown, pi-subagents extension prompt guidance.

---

## File Structure

- Modify: `src/runs/shared/subagent-guidance.ts` — add workflow-skill enforcement text to parent prompt guidance.
- Modify: `test/unit/subagent-guidance.test.ts` — assert focused workflow guidance is present and injected once.
- Modify: `test/unit/skills-fallback.test.ts` — replace umbrella-skill assumptions with focused/support skill discovery expectations.
- Create: `test/unit/package-skills.test.ts` — lock packaged skill inventory and block old umbrella skill.
- Delete: `skills/pi-subagents/` — remove broad parent orchestration manual.
- Keep/modify: `skills/brainstorming/SKILL.md` — align with new support skills and approved migration direction.
- Create: `skills/subagent-orchestration/SKILL.md` — support skill for parent/child boundaries and launch contracts.
- Create: `skills/quality-gates/SKILL.md` — support skill for review, TDD, verification, and completion evidence.
- Create focused workflow skill files for: `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `requesting-code-review`, `receiving-code-review`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `using-git-worktrees`, `finishing-a-development-branch`, `writing-skills`, `using-pi-superpowers`.
- Modify: `README.md` only after tests pass, documenting focused skills as the primary workflow surface.

## Task 1: Prompt Guidance Contract

**Files:**
- Modify: `test/unit/subagent-guidance.test.ts`
- Modify: `src/runs/shared/subagent-guidance.ts`

- [ ] **Step 1: Add failing assertions for focused workflow guidance**

In `test/unit/subagent-guidance.test.ts`, extend `builds a marked guidance block with agent bullets` with:

```ts
assert.ok(block.includes("Use focused parent skills before acting"));
assert.ok(block.includes("brainstorming"));
assert.ok(block.includes("writing-plans"));
assert.ok(block.includes("systematic-debugging"));
assert.ok(block.includes("verification-before-completion"));
assert.ok(block.includes("Child subagents must not run orchestration workflows"));
```

- [ ] **Step 2: Run the targeted test and verify failure**

Run: `npm run test:unit -- test/unit/subagent-guidance.test.ts`
Expected: FAIL because the new focused-skill guidance text is not present.

- [ ] **Step 3: Update guidance block text**

In `src/runs/shared/subagent-guidance.ts`, replace the paragraph and numbered list inside `buildSubagentGuidanceBlock()` with concise text that includes:

```ts
`Use focused parent skills before acting:
1. Use brainstorming before creative work, new behavior, feature design, or behavior changes.
2. Use writing-plans before multi-step implementation.
3. Use systematic-debugging before fixing bugs, test failures, or unexpected behavior.
4. Use verification-before-completion before claiming work is done, fixed, passing, or ready.
5. Use subagent-orchestration for parent/child launch contracts and quality-gates for review, TDD, and evidence rules.
6. Child subagents must not run orchestration workflows unless explicitly instructed by the parent.

Available subagents:
${bullets}`
```

Keep `SUBAGENT_GUIDANCE_START`, heading, `bullets`, and `SUBAGENT_GUIDANCE_END` behavior unchanged.

- [ ] **Step 4: Verify targeted test passes**

Run: `npm run test:unit -- test/unit/subagent-guidance.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/runs/shared/subagent-guidance.ts test/unit/subagent-guidance.test.ts
git commit -m "feat: guide focused subagent workflows"
```

## Task 2: Packaged Skill Inventory Tests

**Files:**
- Create: `test/unit/package-skills.test.ts`
- Modify: `test/unit/skills-fallback.test.ts`

- [ ] **Step 1: Create failing packaged skill inventory test**

Create `test/unit/package-skills.test.ts`:

```ts
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const skillsDir = path.join(projectRoot, "skills");
const expected = [
	"brainstorming",
	"dispatching-parallel-agents",
	"executing-plans",
	"finishing-a-development-branch",
	"quality-gates",
	"receiving-code-review",
	"requesting-code-review",
	"subagent-driven-development",
	"subagent-orchestration",
	"systematic-debugging",
	"test-driven-development",
	"using-git-worktrees",
	"using-pi-superpowers",
	"verification-before-completion",
	"writing-plans",
	"writing-skills",
];

test("packaged focused workflow skills are present", () => {
	for (const name of expected) {
		assert.ok(fs.existsSync(path.join(skillsDir, name, "SKILL.md")), `missing ${name}`);
	}
});

test("old umbrella pi-subagents skill is not packaged", () => {
	assert.equal(fs.existsSync(path.join(skillsDir, "pi-subagents", "SKILL.md")), false);
});
```

- [ ] **Step 2: Update fallback skill test expectation**

In `test/unit/skills-fallback.test.ts`, rename `does not expose pi-subagents as a child-injectable skill` to `discovers focused workflow skills normally`. Replace its body with:

```ts
makeProjectSkill(tempDir, "subagent-orchestration", "Parent orchestration support.");
makeProjectSkill(tempDir, "quality-gates", "Use evidence gates.");

const available = discoverAvailableSkills(tempDir).map((skill) => skill.name);
assert.equal(available.includes("subagent-orchestration"), true);
assert.equal(available.includes("quality-gates"), true);

const { resolved, missing } = resolveSkills(["subagent-orchestration", "quality-gates"], tempDir);
assert.deepEqual(missing, []);
assert.deepEqual(resolved.map((skill) => skill.name).sort(), ["quality-gates", "subagent-orchestration"]);
```

- [ ] **Step 3: Run tests and verify failure**

Run: `npm run test:unit -- test/unit/package-skills.test.ts test/unit/skills-fallback.test.ts`
Expected: FAIL because new skill files do not exist and old `pi-subagents` still exists.

- [ ] **Step 4: Commit test contract**

```bash
git add test/unit/package-skills.test.ts test/unit/skills-fallback.test.ts
git commit -m "test: lock focused workflow skill inventory"
```

## Task 3: Support Skills

**Files:**
- Delete: `skills/pi-subagents/`
- Create: `skills/subagent-orchestration/SKILL.md`
- Create: `skills/quality-gates/SKILL.md`

- [ ] **Step 1: Remove umbrella skill directory**

Run: `rm -rf skills/pi-subagents`
Expected: directory removed. Do not remove `skills/brainstorming`.

- [ ] **Step 2: Create `subagent-orchestration` skill**

Create `skills/subagent-orchestration/SKILL.md` with frontmatter:

```md
---
name: subagent-orchestration
description: Use when a parent session needs to delegate work to subagents, compose chains, run parallel read/review/research tasks, or enforce parent/child boundaries.
---
```

Body must include these exact sections: `# Subagent Orchestration`, `## Parent Role`, `## Child Boundary`, `## Launch Contracts`, `## Parallelism`, `## Escalation`. Include rules that parent owns decisions, child subagents do not launch subagents, writes are single-threaded by default, and child prompts include goal, context, constraints, validation, output, and stop rules.

- [ ] **Step 3: Create `quality-gates` skill**

Create `skills/quality-gates/SKILL.md` with frontmatter:

```md
---
name: quality-gates
description: Use before reviews, TDD work, verification, completion claims, merge decisions, or any workflow that needs evidence before assertions.
---
```

Body must include these exact sections: `# Quality Gates`, `## TDD Gate`, `## Review Gate`, `## Verification Gate`, `## Completion Gate`, `## Failure Handling`. Include rules that claims require command output or explicit inability to validate.

- [ ] **Step 4: Run inventory tests**

Run: `npm run test:unit -- test/unit/package-skills.test.ts test/unit/skills-fallback.test.ts`
Expected: still FAIL because focused workflow skills are not created yet, but old umbrella failure is resolved.

- [ ] **Step 5: Commit support skills**

```bash
git add skills/subagent-orchestration/SKILL.md skills/quality-gates/SKILL.md
git rm -r skills/pi-subagents
git commit -m "feat: add shared workflow support skills"
```

## Task 4: Focused Workflow Skills

**Files:**
- Modify: `skills/brainstorming/SKILL.md`
- Create focused skill files listed in the file structure.

- [ ] **Step 1: Create each missing focused skill directory**

Create these directories under `skills/`: `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `requesting-code-review`, `receiving-code-review`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `using-git-worktrees`, `finishing-a-development-branch`, `writing-skills`, `using-pi-superpowers`.

- [ ] **Step 2: Use required section shape for every focused skill**

Each `SKILL.md` must contain this exact section sequence after frontmatter: title, `Parent skill` statement, `## When to Use`, `## Process`, `## Required Gates`, `## Subagent Contracts`, and `## Stop Conditions`. Use the table in Step 3 for the concrete title, description, process focus, gates, contracts, and stop rules.

- [ ] **Step 3: Migrate Superpowers content subagent-natively**

For each Superpowers source skill under `/home/magmast/Projects/github.com/obra/superpowers/skills/`, preserve trigger intent and hard gates, but rewrite process steps to use existing pi subagents. Do not copy old platform-specific instructions verbatim when they conflict with parent-skill orchestration.

| Skill | Title | Description | Process focus | Gates/contracts/stop rules |
| --- | --- | --- | --- | --- |
| `writing-plans` | Writing Plans | Use when requirements or an approved spec need a concrete implementation plan before code changes. | Gather context with `context-builder`; invoke `planner`; save plans to `docs/plans/YYYY-MM-DD-feature.md`. | Stop for ambiguous scope; require user approval before worker execution. |
| `executing-plans` | Executing Plans | Use when a written implementation plan is ready to execute with review checkpoints. | Parent loads plan, assigns one `worker`, runs `reviewer`, then validates. | Stop on plan ambiguity, failed validation, or unapproved scope change. |
| `subagent-driven-development` | Subagent-Driven Development | Use when an approved plan has independent implementation tasks. | Parent decomposes work, uses isolated workers only when state is independent, integrates serially. | Single writer by default; use worktrees for parallel writers; reviewers inspect merged result. |
| `dispatching-parallel-agents` | Dispatching Parallel Agents | Use for independent read, review, research, or validation tasks. | Parent identifies independent domains and launches parallel `scout`, `researcher`, or `reviewer` tasks. | No shared-write parallelism without explicit worktree plan. |
| `requesting-code-review` | Requesting Code Review | Use after meaningful changes and before merge/completion. | Run fresh-context `reviewer` fanout against diff, tests, and requirements. | Parent triages findings; accepted fixes go to one `worker`; re-review non-trivial fixes. |
| `receiving-code-review` | Receiving Code Review | Use before applying human or automated review feedback. | Verify each comment, classify correctness vs preference, ask when unclear. | Do not blindly agree; cite evidence; stop for contradictory or unsafe feedback. |
| `systematic-debugging` | Systematic Debugging | Use for bugs, test failures, or unexpected behavior before fixes. | Reproduce, gather evidence, inspect patterns, form hypotheses, then patch through plan/worker. | No fix before root-cause evidence; stop if reproduction is impossible. |
| `test-driven-development` | Test-Driven Development | Use before implementing features or bug fixes. | RED failing test, GREEN minimal implementation, REFACTOR, verify. | Do not write implementation first unless changing tests is impossible and documented. |
| `verification-before-completion` | Verification Before Completion | Use before claiming complete, fixed, passing, ready, or reviewed. | Run targeted validation and report exact commands. | No success claims without evidence; report skipped/unavailable checks. |
| `using-git-worktrees` | Using Git Worktrees | Use when work needs isolation from current workspace or parallel writers. | Detect current isolation, create or use worktree, record path and branch. | Stop if workspace is dirty and isolation choice needs user decision. |
| `finishing-a-development-branch` | Finishing a Development Branch | Use when implementation is complete and integration choice remains. | Verify tests, detect base branch, present merge/PR/cleanup options. | User chooses destructive or publishing actions. |
| `writing-skills` | Writing Skills | Use when creating, editing, or validating skills. | Treat skill changes as behavior changes; brainstorm when creative; test discovery/packaging. | Require trigger clarity, frontmatter, gates, and package inventory tests. |
| `using-pi-superpowers` | Using Pi Superpowers | Use at session start or when workflow skill discovery/enforcement is needed. | Explain focused skills and support skills; route user requests to the right parent skill. | Do not replace task-specific skills; it only enforces discovery and routing. |

- [ ] **Step 4: Align existing brainstorming skill**

Edit `skills/brainstorming/SKILL.md` so it references `subagent-orchestration` and `quality-gates`, keeps the approved flow `context-builder → ask_user → oracle → design approval → spec → self-review → reviewer → user review → planner`, and writes specs to paths such as `docs/specs/2026-05-19-superpowers-migration-design.md`.

- [ ] **Step 5: Run inventory tests**

Run: `npm run test:unit -- test/unit/package-skills.test.ts test/unit/skills-fallback.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit focused workflow skills**

```bash
git add skills test/unit/package-skills.test.ts test/unit/skills-fallback.test.ts
git commit -m "feat: migrate superpowers workflows as focused skills"
```

## Task 5: README and Documentation Update

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README workflow surface**

Replace references that present `pi-subagents` as the primary skill/manual with text that says focused parent skills are the primary workflow surface and subagents are the execution primitives.

- [ ] **Step 2: Add focused skill table**

Add a README table with columns `Skill`, `Use when`, and `Primary subagents`. Include every focused and support skill from `test/unit/package-skills.test.ts`.

- [ ] **Step 3: Add migration note**

Add a short note: `The old umbrella pi-subagents skill has been replaced by focused workflow skills plus support skills.`

- [ ] **Step 4: Run package tests**

Run: `npm run test:unit -- test/unit/package-skills.test.ts test/unit/subagent-guidance.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit docs**

```bash
git add README.md
git commit -m "docs: document focused workflow skills"
```

## Task 6: Full Validation

**Files:**
- No source edits unless validation fails.

- [ ] **Step 1: Run unit tests**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 2: Run integration tests**

Run: `npm run test:integration`
Expected: PASS.

- [ ] **Step 3: Run full test suite**

Run: `npm run test:all`
Expected: PASS.

- [ ] **Step 4: Inspect final diff**

Run: `git diff --stat HEAD~5..HEAD`
Expected: shows guidance/test updates, deleted `skills/pi-subagents`, new focused/support skills, README update.

- [ ] **Step 5: Completion evidence**

Report exact commands run and their PASS/FAIL status. If any command cannot run, report why and do not claim full validation.
