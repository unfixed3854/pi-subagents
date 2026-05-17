# Agents and Management

## Builtin agents

Builtin agents load at lowest priority. Project agents override user agents, and user/project agents override builtins with the same name.

| Agent | Purpose | Typical role |
| --- | --- | --- |
| `scout` | Fast codebase recon | Writes compact handoff context |
| `planner` | Implementation plans | Writes plans from context |
| `worker` | Implementation | Single-writer execution with escalation |
| `reviewer` | Review/fix specialist | Reviews diffs/plans; may edit only when assigned |
| `context-builder` | Requirements/codebase handoff | Writes structured context and meta-prompts |
| `researcher` | Web research | Writes evidence-backed research briefs |
| `delegate` | Lightweight generic delegate | Generic delegated work |
| `oracle` | Decision consistency | Advisory fork that audits drift and assumptions |

Builtins inherit current Pi default model unless run/user/project settings override `model`. Override builtin defaults before copying full agent files when a small tweak is enough.

## Discovery and scope

Agent files can live in:

- `~/.pi/agent/agents/**/*.md` — user scope
- `.pi/agents/**/*.md` — canonical project scope
- legacy `.agents/**/*.md` — compatibility; `.pi/agents/` wins conflicts

Chains live in:

- `~/.pi/agent/chains/**/*.chain.md` — user scope
- `.pi/chains/**/*.chain.md` — project scope

Discovery is recursive. `.chain.md` files do not define agents. Agents/chains can set `package: code-analysis`; `name: scout` plus `package: code-analysis` registers runtime name `code-analysis.scout` while serialization keeps fields separate.

Precedence by parsed runtime name:

1. project scope
2. user scope
3. builtin agents

Run `subagent({ action: "list" })` when names, scope, or availability are uncertain.

## Persistent overrides

Settings locations:

- User scope: `~/.pi/agent/settings.json`
- Project scope: `.pi/settings.json`

Direct settings example:

```json
{
  "subagents": {
    "agentOverrides": {
      "reviewer": {
        "model": "anthropic/claude-sonnet-4",
        "thinking": "high",
        "fallbackModels": ["openai/gpt-5-mini"]
      }
    }
  }
}
```

Useful override fields: `model`, `fallbackModels`, `thinking`, `systemPromptMode`, `inheritProjectContext`, `inheritSkills`, `defaultContext`, `disabled`, `skills`, `tools`, and `systemPrompt`.

For one run, use inline config instead of persistent settings:

```text
/run reviewer[model=anthropic/claude-sonnet-4] "Review this diff"
```

## Management mode

The `subagent(...)` tool supports management actions. Prefer these when creating/editing subagents on demand without raw file edits.

List:

```typescript
subagent({ action: "list" })
```

Create:

```typescript
subagent({
  action: "create",
  config: {
    name: "my-agent",
    package: "code-analysis",
    description: "Project-specific implementation helper",
    systemPrompt: "Your system prompt here.",
    systemPromptMode: "replace",
    model: "openai-codex/gpt-5.4",
    tools: "read,grep,find,ls,bash"
  }
})
```

Update:

```typescript
subagent({
  action: "update",
  agent: "code-analysis.my-agent",
  config: { thinking: "high" }
})
```

Delete:

```typescript
subagent({ action: "delete", agent: "code-analysis.my-agent" })
```

`config.name` is the local frontmatter name. Optional `config.package` registers runtime name `{package}.{name}`. Use dotted runtime names for `get`, `update`, `delete`, slash commands, and chain steps.

## Creating and editing agents by file

Minimal agent file:

```markdown
---
name: my-agent
package: code-analysis
description: What this agent does
model: openai-codex/gpt-5.4
thinking: high
tools: read, grep, find, ls, bash
systemPromptMode: replace
inheritProjectContext: true
inheritSkills: false
---

Your system prompt here.
```

Omit `package` for traditional unqualified runtime name. Common optional fields include `defaultProgress`, `defaultReads`, `output`, `fallbackModels`, and `maxSubagentDepth`.

Create a user/project agent with the same name only when you want a substantially different agent. For small builtin changes, use `subagents.agentOverrides`.
