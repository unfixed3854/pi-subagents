import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgentConfig } from "../../src/agents/agents.ts";
import { appendSubagentGuidanceToPrompt, buildSubagentGuidanceBlock, hasSubagentTool, sortAgentsForGuidance, SUBAGENT_GUIDANCE_END, SUBAGENT_GUIDANCE_START } from "../../src/runs/shared/subagent-guidance.ts";

function agent(name: string, source: AgentConfig["source"], description = `${name} description`, disabled = false): AgentConfig {
	return {
		name,
		description,
		source,
		disabled,
		filePath: `/tmp/${name}.md`,
		systemPrompt: "prompt",
		systemPromptMode: "replace",
		inheritProjectContext: false,
		inheritSkills: false,
	};
}

describe("subagent guidance", () => {
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
		assert.match(block, /planner writes full plans to `docs\/plans\/YYYY-MM-DD-<feature-name>\.md` and returns that saved path/i);
		assert.match(block, /workers and reviewers read explicit plan, spec, progress, or diff paths supplied by the parent/i);
		assert.doesNotMatch(block, /create or summarize to root `plan\.md`/i);
		assert.doesNotMatch(block, /implicit root `plan\.md`/i);
		assert.match(block, /execute one current unchecked plan task with one `worker`, validate it, review meaningful changes, route accepted fixes through `worker`, then advance/i);
		assert.match(block, /brainstorming starts local context gathering and also starts `researcher` when external facts are needed/i);
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

	it("returns empty string when no agents are available", () => {
		assert.equal(buildSubagentGuidanceBlock([]), "");
	});

	it("sorts builtins before project and user agents", () => {
		assert.deepEqual(sortAgentsForGuidance([
			agent("z-user", "user"),
			agent("b-project", "project"),
			agent("a-builtin", "builtin"),
			agent("disabled", "builtin", "disabled", true),
		]).map((a) => a.name), ["a-builtin", "b-project", "z-user"]);
	});

	it("limits the prompt list to 30 one-line entries", () => {
		const block = buildSubagentGuidanceBlock(Array.from({ length: 35 }, (_, i) => agent(`agent-${String(i).padStart(2, "0")}`, "builtin", "line one\nline two")));
		assert.equal(block.split("\n").filter((line) => line.startsWith("- agent-")).length, 30);
		assert.ok(!block.includes("line one\nline two"));
	});

	it("appends guidance to a parent system prompt once", () => {
		const prompt = appendSubagentGuidanceToPrompt("Parent prompt", process.cwd());
		assert.ok(prompt.startsWith("Parent prompt\n\n"));
		assert.ok(prompt.includes(SUBAGENT_GUIDANCE_START));
		assert.ok(prompt.includes("Available subagents:"));
		assert.equal(appendSubagentGuidanceToPrompt(prompt, process.cwd()), prompt);
	});

	it("detects subagent availability from the resolved tool surface", () => {
		assert.equal(hasSubagentTool(["read", "subagent"]), true);
		assert.equal(hasSubagentTool(["read"], ["/repo/pi-subagents/src/extension/index.ts"]), true);
		assert.equal(hasSubagentTool(["read", "write"]), false);
	});
});
