# AGENTS

This repository contains a recruitment task implementation for a simplified live sportsbook dashboard.  
Any AI agent (Codex) working on this repo must follow the rules below.

## Primary Sources of Truth

1. README.md — how to run and what is implemented.
2. docs/SPEC.md — REQUIRED behaviour and decisions. If unclear, SPEC wins.
3. docs/QA.md — manual scenarios and edge cases. Keep QA green.
4. docs/ROADMAP.md — implementation order and scope control.

If docs conflict:

- SPEC overrides ROADMAP.
- QA should be updated only if behaviour changes intentionally and stays within task scope.

## Scope Guardrails (do not expand scope)

- UI must render only the 1x2 market (`gameName === "1x2"`).
- Live odds must be simulated (no external APIs).
- Avoid adding features not required by the task.

## Behaviour Requirements (must match SPEC)

- One active selection per event (conflicts replace previous selection).
- Replacement is communicated via a brief highlight on the Bet Slip item.
- Clicking the same selected outcome toggles removal.
- Total odds = product of `selectedOddsSnapshot` values.
- Potential win = total odds \* stake.
- Live updates: random interval 10–15s; multiplier 0.9–1.1; round 2 decimals; clamp min 1.01.
- UI blink: green on increase, red on decrease.
- Lock/suspend (must-have): updated outcomes are temporarily disabled with a clear signal; clicks during lock do nothing.
- Bet Slip odds changed (must-have): show current odds + snapshot; if changed:
  - show “Odds changed”
  - disable “Place Bet”
  - require “Accept all changes” (global accept) to update snapshots

## Architecture Guidelines (Level 4 first)

- Separate static metadata from dynamic odds:
  - static: events/markets/outcomes
  - dynamic: oddsByOutcomeId (+ locked/pulse per outcomeId)
- Components that display odds must subscribe to the smallest possible slice of state:
  - OddsButton subscribes only to its outcomeId (odds/lock/pulse) and selection status.
- Prefer IDs + selectors over passing large objects/arrays through props.

## Performance pitfalls to avoid (Level 4)

- Do NOT pass the full events list (or large nested objects) down the component tree as props.
- Render lists by IDs (e.g., eventIds) and select row/button data via selectors.
- Keep odds in oddsByOutcomeId so updates affect only the smallest UI unit (OddsButton).

## Reporting important changes (in chat)

After completing each task, always report in chat:

- What changed (1–3 bullets)
- Why (1 bullet)
- Any user-visible behaviour changes (1 bullet)
- Files touched (list)

## Implementation Workflow

1. Pick the next item from docs/ROADMAP.md.
2. Confirm expected behaviour in docs/SPEC.md.
3. Implement the smallest change that satisfies the requirement.
4. Validate against docs/QA.md (especially Live + Performance).
5. Update README.md only when external behaviour/setup changes.
6. After completing each ROADMAP item, add or update at least 1 relevant test (domain/store first).
7. When adding tests, only add new files under src/**/**tests**/** plus minimal test config files. Do not refactor or restructure the project unless strictly necessary.

## Code Quality Rules

- TypeScript first; avoid any.
- src/domain should not import React.
- Sport/league labels must be data-driven (category1Name, category3Name), never hardcoded.
- Format odds consistently (2 decimals).
- Avoid new dependencies unless necessary for the task.

## Output format for AI-assisted changes

Prefer:

- concise diffs
- minimal new files
- clear naming aligned with the sportsbook domain (event/market/outcome, bet slip, odds)
