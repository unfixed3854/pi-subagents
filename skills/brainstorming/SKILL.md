---
name: brainstorming
description: You MUST use this before creative work, new behavior, feature design, adding functionality, or modifying behavior.
---

# Brainstorming Ideas Into Designs

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use before any behavior change, feature, component, architecture change, or ambiguous request. Even small changes need a short design if they alter behavior.

## Process

1. Launch `context-builder` to inspect files, docs, recent commits, patterns, constraints, tests, risks, and integration points.
2. Ask clarifying questions with `ask_user`, one focused question at a time.
3. Launch `oracle` with gathered context and answers; request 2-3 approaches, trade-offs, and a recommendation.
4. Present the recommended design in sections scaled to complexity; get user approval.
5. Write the approved spec to a path such as `docs/specs/2026-05-19-superpowers-migration-design.md`.
6. Self-review for incomplete markers, contradictions, ambiguity, and scope creep.
7. Launch `reviewer` to review the written spec; apply accepted fixes inline.
8. Ask the user to review the spec file before planning.
9. Launch `planner` with the approved spec.

## Required Gates

- Do not write code, scaffold, launch `worker`, or implement before user-approved design.
- Do not skip reviewer review of the written spec.
- User approval is required before planning starts.

## Subagent Contracts

- `context-builder`: local context, constraints, tests, risks, open questions.
- `oracle`: alternative approaches and recommendation; no edits.
- `reviewer`: spec contradictions, ambiguity, missing validation, scope creep.
- `planner`: implementation plan from the approved reviewed spec.

## Stop Conditions

Stop when the request is too broad for one spec, user rejects design, review finds unresolved blockers, or implementation is requested before design approval.
