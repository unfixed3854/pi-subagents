---
name: brainstorming
description: You MUST use this before creative work, feature design, adding functionality, or implementation that changes runtime/product/user-visible behavior.
---

# Brainstorming Ideas Into Designs

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use before feature implementation, component changes, architecture changes, ambiguous requests, or other implementation that changes runtime/product/user-visible behavior. Even small runtime/product/user-visible changes need a short design unless the parent/user explicitly approves skipping the workflow.

## Process

1. Launch `context-builder` for local context: inspect files, docs, recent commits, patterns, constraints, tests, risks, and integration points.
2. Launch `researcher` when the request depends on external facts such as library behavior, APIs, documentation, standards, current best practices, external references, or recent ecosystem changes.
3. If implementation appears small but changes runtime/product/user-visible behavior, use `ask_user` before any code edit: ask whether to run the normal brainstorming/spec/plan workflow or explicitly skip it for this task.
4. Ask clarifying questions with `ask_user`, one focused question at a time, when required to choose scope or intent before design approval.
5. Launch `oracle` with gathered local context, external research when used, and user answers; request 2-3 approaches, trade-offs, and a recommendation.
6. Present the recommended design in sections scaled to complexity; get user approval.
7. Write the approved spec to a path such as `docs/specs/2026-05-19-superpowers-migration-design.md`.
8. Self-review for incomplete markers, contradictions, ambiguity, and scope creep.
9. Launch `reviewer` to review the written spec; apply accepted fixes inline.
10. Ask the user to review the spec file before planning.
11. Launch `planner` with the approved spec path.

## Required Gates

- Do not write code, scaffold, launch `worker`, or implement before user-approved design.
- Do not skip reviewer review of the written spec.
- User approval is required before planning starts.
- Loading this skill is not sufficient; follow the process before editing.
- Do not treat feature implementation, async/UI behavior, integration/API behavior, or other runtime/product/user-visible implementation as direct-action work unless the user explicitly approved skipping the workflow through `ask_user`.

## Subagent Contracts

- `context-builder`: local codebase context, constraints, integration points, and validation paths.
- `researcher`: external/library/API/docs/standards/current-practice evidence with sources when external facts are needed.
- `oracle`: design alternatives and recommendation based on gathered evidence.
- `reviewer`: spec completeness, ambiguity, contradictions, and scope control.
- `planner`: implementation plan from the approved spec path.

## Stop Conditions

Stop when the request is too broad for one spec, user rejects design, review finds unresolved blockers, or implementation is requested before design approval.
