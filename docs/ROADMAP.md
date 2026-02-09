# ROADMAP

This roadmap mirrors the recruitment task levels (1–4). Focus on correctness, clarity, and performance.

## Level 0 — Project setup

- [✅] Scaffold Next.js App Router + TypeScript + Tailwind
- [✅] Add data file: `src/data/betting_dashboard_data.json`
- [✅] Define domain types (events, markets/games, outcomes)
- [✅] Add Zustand store skeleton (market-agnostic domain, UI stays on 1x2)

## Level 0 — Testing bootstrap (Jest + RTL)

- [✅] Add Jest configuration + jsdom environment
- [ ] Add RTL setup (@testing-library/jest-dom)
- [ ] Add npm run test + npm run test:watch
- [ ] Verify a single dummy test passes (smoke)

## Level 1 — Events list

- [✅] Parse JSON into normalized maps (events/markets/outcomes)
- [✅] For each event show:
  - [✅] eventName
  - [✅] formatted eventStart
  - [✅] odds buttons for `gameName === "1x2"`: 1 / X / 2 (with tooltips)
- [ ] Optional: group by league/category (After level 2 and 3)

## Level 2 — Bet Slip

- [ ] Add selection on odds click

### Tests (Jest)

- [ ] Add `src/store/__tests__/betslip.selection.test.ts` (add/replace/toggle)

- [ ] Enforce one selection per event (replace conflicts)
- [ ] Replacement: brief highlight on Bet Slip item
- [ ] Toggle remove by clicking selected outcome
- [ ] Remove selection via (X) in Bet Slip
- [ ] Empty Bet Slip state (must-have)
- [ ] Stake input with validation (>= 0)
- [ ] Calculations:
  - [ ] Total Odds (product of snapshots)
  - [ ] Potential Win = Total Odds \* Stake

### Tests (Jest)

- [ ] Add `src/store/__tests__/betslip.oddsChanged.test.ts` (snapshot vs current + acceptAllChanges)
- [ ] Add `src/domain/__tests__/calculations.test.ts` (totalOdds/potentialWin from snapshots)

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

### Tests (Jest)

- [ ] Add `src/domain/__tests__/odds.test.ts` (rounding/clamp/multiplier)
- [ ] Add `src/store/__tests__/odds.updates.test.ts` (pulse + lock + targeted updates)

## Level 4 — Performance / render optimization

- [ ] Odds ticks do NOT cause full list re-render
- [ ] Strategy:
  - [ ] store odds in a map keyed by `outcomeId`
  - [ ] OddsButton subscribes only to its own `outcomeId` via selector
  - [ ] avoid passing large nested objects down as props; prefer IDs + selectors
- [ ] Add proof:
  - [ ] console logs on OddsButton renders OR React Profiler notes/screenshot

## Bonus — Cypress

- [ ] Add 1–2 e2e flows once core is stable:
  - [ ] `cypress/e2e/betslip.e2e.cy.ts` (select 1/X/2, replace selection)
  - [ ] `cypress/e2e/oddsChanged.e2e.cy.ts` (odds changed badge + accept all changes)

## Final Polish

- [ ] Responsive layout (desktop + mobile)
- [ ] Basic error handling for missing/invalid odds
- [ ] Final README update
