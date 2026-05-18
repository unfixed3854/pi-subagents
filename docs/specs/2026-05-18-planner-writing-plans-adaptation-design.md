# Planner Writing-Plans Adaptation Design

Date: 2026-05-18

## Goal

Adapt `agents/planner.md` into an almost 1:1 Pi-compatible port of Obra Superpowers `skills/writing-plans/SKILL.md`, and add README attribution to Jesse Vincent / Obra.

## Context

Current `agents/planner.md` is concise and functional but does not preserve the source skill structure. The source `writing-plans` skill includes scope checks, file-structure guidance, bite-sized TDD task granularity, a fixed plan header, task template, no-placeholder rules, self-review, and an execution handoff. Existing `skills/brainstorming/SKILL.md` shows the adaptation pattern: preserve Obra workflow semantics, swap Superpowers-specific handoffs for Pi subagents, and add only narrow Pi runtime constraints.

## Approved Approach

Use a strict adapted port. Replace the planner body with the source skill section order and templates, changing only text that would be wrong in Pi.

Keep Pi runtime frontmatter intact:

- `name: planner`
- `output: plan.md`
- `defaultReads: context.md`
- `defaultContext: fork`
- planning-only permissions; no implementation edits

User preference: prefer Superpowers-style `docs/plans/YYYY-MM-DD-<feature-name>.md` for the plan document. Because agent frontmatter `output` is a static path, do not set it to a literal date/name template. Keep runtime `output: plan.md`; instruct the planner agent to write the full implementation plan to `docs/plans/YYYY-MM-DD-<feature-name>.md` and return/summarize that path in `plan.md`.

## Adaptation Rules

- Preserve source headings and order from `writing-plans/SKILL.md` as much as possible.
- Replace “writing-plans skill” with “planner agent”.
- Replace `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md` with Pi path `docs/plans/YYYY-MM-DD-<feature-name>.md` where practical.
- Replace Superpowers execution options with non-interactive Pi handoff language: “Plan saved. Parent/user can launch `worker` with this plan.” Do not offer choices or promise to dispatch subagents from inside the child agent.
- Add explicit guardrail: planner reads, analyzes, and writes the plan only; it must not edit implementation code.
- Avoid broad new Pi orchestration prose that would drift from source fidelity.

## Files

- `agents/planner.md`: expand prompt into near-1:1 adapted port.
- `README.md`: update the existing bundled-skill credit sentence or adjacent attribution block so it credits both `brainstorming` and packaged `planner` adaptations from Obra, without implying planner is a skill.
- Optional: `CHANGELOG.md` only if repository convention requires user-visible changes recorded.

## Validation

- Compare adapted `agents/planner.md` section-by-section against `/home/magmast/Projects/github.com/obra/superpowers/skills/writing-plans/SKILL.md`.
- Check no stale `superpowers:*`, `docs/superpowers`, or Obra-only handoff remains unless clearly cited as source.
- Run `npm run test:unit` as minimum validation.
- Inspect README attribution for clear credit to Jesse Vincent / Obra and MIT source link.

## Open Question Resolved

Output path: user prefers Superpowers-style `docs/plans/YYYY-MM-DD-<feature-name>.md`. Implementation should choose the closest Pi-compatible way to honor that without breaking planner→worker handoff behavior.
