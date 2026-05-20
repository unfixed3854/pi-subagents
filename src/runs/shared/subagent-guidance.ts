import type { AgentConfig } from "../../agents/agents.ts";
import { discoverAgents } from "../../agents/agents.ts";

export const SUBAGENT_GUIDANCE_START = "<!-- pi-subagents-guidance:start -->";
export const SUBAGENT_GUIDANCE_END = "<!-- pi-subagents-guidance:end -->";
const MAX_GUIDANCE_AGENTS = 30;
const MAX_DESCRIPTION_LENGTH = 100;

function oneLine(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
	const text = oneLine(value);
	if (text.length <= maxLength) return text;
	return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function sourceRank(source: AgentConfig["source"]): number {
	if (source === "builtin") return 0;
	if (source === "project") return 1;
	return 2;
}

export function sortAgentsForGuidance(agents: AgentConfig[]): AgentConfig[] {
	return [...agents]
		.filter((agent) => agent.disabled !== true)
		.sort((a, b) => sourceRank(a.source) - sourceRank(b.source) || a.name.localeCompare(b.name));
}

export function discoverAgentsForGuidance(cwd: string): AgentConfig[] {
	return sortAgentsForGuidance(discoverAgents(cwd, "both").agents).slice(0, MAX_GUIDANCE_AGENTS);
}

export function buildSubagentGuidanceBlock(agents: AgentConfig[]): string {
	const listedAgents = sortAgentsForGuidance(agents).slice(0, MAX_GUIDANCE_AGENTS);
	if (listedAgents.length === 0) return "";
	const bullets = listedAgents
		.map((agent) => `- ${agent.name} — ${truncate(agent.description || "No description", MAX_DESCRIPTION_LENGTH)}`)
		.join("\n");
	return `${SUBAGENT_GUIDANCE_START}
## Subagent-driven development

### Parent workflow protocol
- Parent owns task routing, decisions, synthesis, and final user response.
- Before acting, select the matching focused workflow skill: \`brainstorming\` for creative work/new behavior/design; \`writing-plans\` then \`executing-plans\` for multi-step implementation; \`systematic-debugging\` for bugs, test failures, or unexpected behavior; \`test-driven-development\` for testable changes; \`requesting-code-review\` for meaningful changes needing fresh review; \`verification-before-completion\` for completion claims.
- Planner writes full plans to \`docs/plans/YYYY-MM-DD-<feature-name>.md\` and returns that saved path.
- Workers and reviewers read explicit plan, spec, progress, or diff paths supplied by the parent.
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

Available subagents:
${bullets}
${SUBAGENT_GUIDANCE_END}`;
}

export function appendSubagentGuidanceToPrompt(systemPrompt: string, cwd: string): string {
	if (systemPrompt.includes(SUBAGENT_GUIDANCE_START)) return systemPrompt;
	const guidance = buildSubagentGuidanceBlock(discoverAgentsForGuidance(cwd));
	if (!guidance) return systemPrompt;
	return systemPrompt.trim() ? `${systemPrompt}\n\n${guidance}` : guidance;
}

export function hasSubagentTool(tools?: string[], extensions?: string[]): boolean {
	return Boolean(tools?.some((tool) => tool === "subagent" || /(^|[/\\])subagent(s)?([-.].*)?\.(ts|js)$/.test(tool))
		|| extensions?.some((extension) => /(^|[/\\])pi-subagents[/\\]src[/\\]extension[/\\]index\.(ts|js)$/.test(extension)));
}
