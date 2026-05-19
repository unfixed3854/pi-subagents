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
	const actual = fs.readdirSync(skillsDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.filter((name) => fs.existsSync(path.join(skillsDir, name, "SKILL.md")))
		.sort();
	assert.deepEqual(actual, expected);
});

test("old umbrella pi-subagents skill is not packaged", () => {
	assert.equal(fs.existsSync(path.join(skillsDir, "pi-subagents", "SKILL.md")), false);
});
