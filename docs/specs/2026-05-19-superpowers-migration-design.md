# Superpowers Migration Design

## Goal

Merge `~/Projects/github.com/obra/superpowers` workflow behavior into this package as subagent-native pi workflows.

## Approved Direction

- Scope: complete migration pass, not only a vertical slice.
- Parity target: subagent-native behavior over exact Superpowers semantics.
- Exposure: focused parent skills by default.
- Existing broad `skills/pi-subagents` may be removed or replaced.
- Architecture: layered suite — focused workflow skills plus reusable support skills.
- Extension should inject concise always-on guidance near available subagents, similar in spirit to Superpowers' `using-superpowers` enforcement.

## Architecture

Migration becomes a layered workflow suite. Each migrated Superpowers workflow becomes a parent skill whose job is orchestration policy: when to use it, which subagents to launch, which gates require user approval, which artifacts to write, and which validation evidence is required.

Reusable references become first-class support skills, not inert docs. Focused skills reference support skills for shared orchestration patterns instead of duplicating long instructions.

Existing agents remain the execution primitives: `context-builder`, `oracle`, `planner`, `worker`, `reviewer`, `researcher`, `scout`, and `delegate`. Add new agents only if migration exposes a distinct child role not covered by existing agents. Prompt recipes may remain, but focused skills become the main trigger surface.

## Skill Taxonomy

Focused parent skills:

- `brainstorming`: design/spec gate with context-builder, oracle, reviewer, and planner handoff.
- `writing-plans`: planner-backed plan creation; align current planner agent if needed.
- `executing-plans`: parent-supervised worker execution with review checkpoints.
- `subagent-driven-development`: decompose independent implementation tasks and coordinate workers.
- `dispatching-parallel-agents`: generic parallel read/review/research/work decomposition.
- `requesting-code-review`: reviewer fanout before completion or merge.
- `receiving-code-review`: triage and verify review feedback before applying it.
- `systematic-debugging`: context gathering, root-cause work, hypothesis testing, and oracle/reviewer use before fixes.
- `test-driven-development`: parent/worker TDD contract and verification gates.
- `verification-before-completion`: evidence gate before completion claims.
- `using-git-worktrees`: isolation/worktree policy for parallel or risky work.
- `finishing-a-development-branch`: final verification and merge/PR/cleanup decision support.
- `writing-skills`: author and validate skills in this repo.
- `using-pi-superpowers` or equivalent: onboarding/enforcement replacement for Superpowers' `using-superpowers`.

Support skills:

- `subagent-orchestration`: parent/child boundaries, launch contracts, async/fork/worktree rules, and escalation rules.
- `quality-gates`: review, verification, TDD, completion-evidence, and no-claim-without-proof patterns.

## Extension Guidance Insertion

The extension should add a concise system prompt fragment near the available-subagents listing. It should enforce workflow discovery without dumping every skill.

Required guidance:

1. For creative work or behavior changes, use `brainstorming` before implementation.
2. For multi-step code work, use `writing-plans` before worker execution.
3. For bugs or test failures, use `systematic-debugging` before fixes.
4. Before completion claims, use `verification-before-completion`.
5. Parent skills orchestrate; child subagents must not recursively orchestrate unless explicitly allowed.
6. Focused skills supersede the old umbrella `pi-subagents` skill.

## Runtime Flow

1. User asks naturally.
2. System prompt nudges the parent session to load the relevant focused parent skill.
3. Parent skill gathers context and asks required user questions or approval gates.
4. Parent launches existing subagents for context, planning, implementation, review, or research.
5. Artifacts go to existing repo conventions (`docs/specs`, `docs/plans`) unless a migrated skill needs a stronger convention.
6. Completion requires explicit evidence from validation commands, reviews, or documented inability to validate.

## Validation

Package-level checks:

- Extension prompt insertion appears once, near available subagents.
- Prompt guidance is not injected into child contexts where forbidden.
- Focused skills and support skills are included in packaging/install output.
- Removed or retired umbrella skill is not advertised as the primary interface.
- Existing subagent command tests still pass.

Skill-level checks:

- Each migrated skill has frontmatter name/description, trigger conditions, parent/child boundary rules, gates, artifact paths, and validation expectations.
- No migrated skill tells child agents to launch subagents unless explicitly intended.
- Support skills avoid circular instructions and are referenced by focused workflow skills.

## Error Handling

- If subagent tooling is unavailable, skills may fall back to direct parent execution for read-only/context steps only, then stop before implementation if required subagent gates cannot run.
- If user approval is missing, broad or risky workflows stop and ask.
- If validation cannot run, completion reports that explicitly instead of claiming success.

## Non-Goals

- Exact reproduction of Superpowers internal wording or docs paths.
- New child agents unless existing roles cannot express a workflow.
- Implementation before the migration plan is approved.
