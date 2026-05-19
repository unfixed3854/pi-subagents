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
	return `${SUBAGENT_GUIDANCE_START}\n## Subagent-driven development\n\nUse focused parent skills before acting:\n1. Use brainstorming before creative work, new behavior, feature design, or behavior changes.\n2. Use writing-plans before multi-step implementation.\n3. Use systematic-debugging before fixing bugs, test failures, or unexpected behavior.\n4. Use verification-before-completion before claiming work is done, fixed, passing, or ready.\n5. Use subagent-orchestration for parent/child launch contracts and quality-gates for review, TDD, and evidence rules.\n6. Child subagents must not run orchestration workflows unless explicitly instructed by the parent.\n\nAvailable subagents:\n${bullets}\n${SUBAGENT_GUIDANCE_END}`;
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
