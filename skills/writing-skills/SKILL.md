---
name: writing-skills
description: Use when creating, editing, migrating, or validating pi skills.
---

# Writing Skills

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use for new skills, skill rewrites, packaging skill suites, changing triggers, or validating skill discovery.

## Process

1. Treat skill edits as runtime/product/user-visible guidance changes; use `brainstorming` when the guidance change is creative or broad.
2. Define the trigger, audience, hard gates, and expected workflow.
3. Write concise frontmatter with `name` and `description`.
4. Structure the skill with clear when/process/gates/contracts/stop sections.
5. Add or update tests for discovery, packaging, and prompt guidance.
6. Run targeted tests and reviewer review.

## Required Gates

- Skills must not contain vague fill-in markers.
- Descriptions must be trigger-focused.
- Parent skills must state user approval, review, or verification gates when relevant.

## Subagent Contracts

- `context-builder`: inspect existing skill patterns and package manifests.
- `worker`: write or edit skill files and tests.
- `reviewer`: check trigger clarity, gates, conflicts, and packaging.

## Stop Conditions

Stop when skill behavior conflicts with system instructions, trigger scope is unclear, or tests cannot prove discovery.
