---
name: using-pi-superpowers
description: Use at session start or when routing a request to the correct focused pi-superpowers workflow skill.
---

# Using Pi Superpowers

Parent skill. Use with `subagent-orchestration` and `quality-gates` when delegation, review, TDD, or validation is involved.

## When to Use

Use to discover and route workflow skills. It does not replace task-specific skills.

## Process

### Pre-edit classification gate

Before any `edit` or `write`, classify the request as one of:
- read-only answer
- docs-only wording change
- formatting/typo-only edit
- mechanical edit that does not change runtime/product/user-visible behavior
- feature implementation
- bug fix, test-failure fix, or unexpected behavior
- async/UI behavior or integration/API behavior
- other implementation that changes runtime/product/user-visible behavior

Only the first four categories may use direct action. For feature implementation, bug fixes, test-failure fixes, unexpected behavior, async/UI behavior, integration/API behavior, or other runtime/product/user-visible implementation, stop direct editing and route through the focused workflow skill. If the work appears small but changes runtime/product/user-visible behavior, call `ask_user` and ask whether to skip the full workflow before editing.

1. Before acting, identify whether a focused skill applies.
2. Use `brainstorming` for creative work or runtime/product/user-visible implementation.
3. Use `writing-plans` before multi-step implementation.
4. Use `systematic-debugging` before bug or test-failure fixes.
5. Use `test-driven-development` before feature or bug implementation when tests are practical.
6. Use `requesting-code-review` and `receiving-code-review` around review loops.
7. Use `verification-before-completion` before success claims.
8. Use `subagent-orchestration` and `quality-gates` as shared support skills.

## Required Gates

- Invoke the most specific applicable skill before responding with action.
- Parent orchestrates; children do not recursively orchestrate unless explicitly allowed.
- Focused skills supersede the old umbrella `pi-subagents` skill.
- Direct action never overrides selected workflow skills; implementation that changes runtime/product/user-visible behavior requires workflow approval or explicit user permission to skip it.

## Subagent Contracts

- Use `context-builder`, `planner`, `worker`, `reviewer`, `oracle`, `scout`, and `researcher` according to the selected workflow.
- Give child agents explicit goal, context, constraints, validation, output, and stop rules.

## Stop Conditions

Stop when no applicable skill is clear, user intent conflicts with workflow gates, or acting would skip a required approval/review/verification gate.
