# ROADMAP

This roadmap mirrors the recruitment task levels (1–4). Focus on correctness, clarity, and performance.

## Level 0 — Project setup

- [✅] Scaffold Next.js App Router + TypeScript + Tailwind
- [✅] Add data file: `src/data/betting_dashboard_data.json`
- [✅] Define domain types (events, markets/games, outcomes)
- [✅] Add Zustand store skeleton (market-agnostic domain, UI stays on 1x2)

## Level 1 — Events list

- [ ] Parse JSON into normalized maps (events/markets/outcomes)
- [ ] For each event show:
  - [ ] eventName
  - [ ] formatted eventStart
  - [ ] odds buttons for `gameName === "1x2"`: 1 / X / 2 (with tooltips)
- [ ] Optional: group by league/category

## Level 2 — Bet Slip

- [ ] Add selection on odds click
- [ ] Enforce one selection per event (replace conflicts)
- [ ] Replacement: brief highlight on Bet Slip item
- [ ] Toggle remove by clicking selected outcome
- [ ] Remove selection via (X) in Bet Slip
- [ ] Empty Bet Slip state (must-have)
- [ ] Stake input with validation (>= 0)
- [ ] Calculations:
  - [ ] Total Odds (product of snapshots)
  - [ ] Potential Win = Total Odds \* Stake

## Level 3 — Live simulation + odds changed (must-have)

- [ ] Timer: random interval between 10–15 seconds
- [ ] Update a subset of outcomes:
  - [ ] `newOdds = oldOdds * random(0.9..1.1)`
  - [ ] round to 2 decimals
  - [ ] clamp min 1.01
- [ ] Blink:
  - [ ] green on increase
  - [ ] red on decrease
- [ ] Lock/suspend (must-have):
  - [ ] temporarily disable updated outcomes with a clear signal
  - [ ] clicks during lock do nothing
- [ ] Bet Slip odds changed (must-have):
  - [ ] store `selectedOddsSnapshot` at selection time
  - [ ] show current odds + snapshot in Bet Slip items
  - [ ] when odds changed: show badge “Odds changed”
  - [ ] disable “Place Bet” until “Accept all changes”
  - [ ] “Accept all changes” updates snapshots for all changed selections

## Level 4 — Performance / render optimization

- [ ] Odds ticks do NOT cause full list re-render
- [ ] Strategy:
  - [ ] store odds in a map keyed by `outcomeId`
  - [ ] OddsButton subscribes only to its own `outcomeId` via selector
  - [ ] avoid passing large nested objects down as props; prefer IDs + selectors
- [ ] Add proof:
  - [ ] console logs on OddsButton renders OR React Profiler notes/screenshot

## Optional: Minimal unit tests (recommended)

- [ ] Add a small test suite for `src/domain/odds.ts` (rounding, clamp, multiplier range)

## Final Polish

- [ ] Responsive layout (desktop + mobile)
- [ ] Basic error handling for missing/invalid odds
- [ ] Final README update
