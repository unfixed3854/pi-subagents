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
	it("builds a marked guidance block with agent bullets", () => {
		const block = buildSubagentGuidanceBlock([agent("worker", "builtin", "Writes code"), agent("custom", "project", "Custom help")]);
		assert.ok(block.startsWith(SUBAGENT_GUIDANCE_START));
		assert.ok(block.endsWith(SUBAGENT_GUIDANCE_END));
		assert.ok(block.includes("Use focused parent skills before acting"));
		assert.ok(block.includes("brainstorming"));
		assert.ok(block.includes("writing-plans"));
		assert.ok(block.includes("systematic-debugging"));
		assert.ok(block.includes("verification-before-completion"));
		assert.ok(block.includes("Child subagents must not run orchestration workflows"));
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
