import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

function readExtensionSource(): string {
	const testDir = path.dirname(fileURLToPath(import.meta.url));
	return fs.readFileSync(path.resolve(testDir, "..", "..", "src/extension/index.ts"), "utf-8");
}

function readRegisteredSubagentDescription(): string {
	const match = readExtensionSource().match(/name:\s*"subagent",[\s\S]*?description:\s*`([\s\S]*?)`,\r?\n\s*parameters: SubagentParams,/);
	assert.ok(match, "expected to find the registered subagent tool description");
	return match[1]!;
}

describe("registered subagent tool description", () => {
	it("injects parent prompt guidance from the before-agent-start extension event", () => {
		const source = readExtensionSource();
		assert.match(source, /pi\.on\("before_agent_start"/);
		assert.match(source, /getActiveTools\(\)\.includes\("subagent"\)/);
		assert.match(source, /appendSubagentGuidanceToPrompt\(event\.systemPrompt, event\.systemPromptOptions\.cwd\)/);
	});

	it("does not advertise hardcoded builtin agent names", () => {
		const description = readRegisteredSubagentDescription();

		for (const builtinName of ["scout", "worker", "planner"]) {
			assert.doesNotMatch(description, new RegExp(`\\b${builtinName}\\b`));
		}
		assert.doesNotMatch(description, /use \{ action: "list" \} to inspect configured agents\/chains/i);
		assert.doesNotMatch(description, /executable\/non-disabled/i);
		assert.match(description, /\{ action: "list" \} - discover executable agents\/chains/i);
		assert.doesNotMatch(description, /disabled builtins/i);
		assert.match(description, /output\?,reads\?,progress\?/i);
	});
});
