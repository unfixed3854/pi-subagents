import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function readRepoFile(relativePath: string): string {
	return fs.readFileSync(path.join(projectRoot, relativePath), "utf-8");
}

test("planner active guidance writes dated plan files and returns saved paths", () => {
	const planner = readRepoFile("agents/planner.md");
	assert.match(planner, /Save full plans to:\*\* `docs\/plans\/YYYY-MM-DD-<feature-name>\.md`/);
	assert.match(planner, /return the saved plan path/i);
	const rootPlan = String.raw`plan\.md`;
	assert.doesNotMatch(planner, new RegExp(`${"After saving the full plan"}, write ` + "`" + rootPlan + "`"));
	assert.doesNotMatch(planner, new RegExp(`${"Summary written"} to ` + "`" + rootPlan + "`"));
});

test("worker and reviewer read explicit parent-supplied paths", () => {
	const worker = readRepoFile("agents/worker.md");
	const reviewer = readRepoFile("agents/reviewer.md");
	assert.doesNotMatch(worker, new RegExp(String.raw`defaultReads: context\.md, ${String.raw`plan\.md`}`));
	assert.doesNotMatch(reviewer, new RegExp(String.raw`defaultReads: ${String.raw`plan\.md`}, progress\.md`));
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
	const removedPromptName = `${"parallel-handoff"}-plan.md`;
	assert.equal(fs.existsSync(path.join(projectRoot, "prompts", removedPromptName)), false);
	const readme = readRepoFile("README.md");
	assert.doesNotMatch(readme, new RegExp(String.raw`/${"parallel-handoff"}-plan`));
});

test("root plan artifact is absent from active repository state", () => {
	assert.equal(fs.existsSync(path.join(projectRoot, "plan.md")), false);
});
