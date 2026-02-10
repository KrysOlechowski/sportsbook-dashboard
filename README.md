# 🏟️ Live Sportsbook Dashboard

A recruitment project that implements a simplified live sportsbook experience:

- ⚽ event list with odds,
- 🧾 Bet Slip with real bookmaker-style constraints,
- 🔄 live odds simulation with user safety guards,
- ⚡ render-optimized state subscriptions.

## 🎯 Recruitment Brief (from assignment)

The task requested a simplified sportsbook app that:

- shows available matches,
- allows adding picks to a Bet Slip,
- simulates "Live" behavior where odds can change over time.

Required stack in the brief:

- Next.js (App Router),
- Tailwind CSS,
- TypeScript,
- state management of choice (I used Zustand).

## ✅ Delivery Summary

| Area                         | Status | Notes                                                               |
| ---------------------------- | ------ | ------------------------------------------------------------------- |
| Level 1: Events list         | Done   | Data mapped from JSON, start time formatting, `1/X/2` market UI     |
| Level 2: Bet Slip rules      | Done   | One selection per event, replace/toggle/remove, stake, totals       |
| Level 3: Live simulation     | Done   | Random timed odds updates, pulse feedback, lock/suspend behavior    |
| Level 3: Odds changed safety | Done   | Snapshot vs current odds, `Accept all changes`, guarded `Place Bet` |
| Level 4: Performance         | Done   | Outcome-level selectors to avoid full-list re-render on ticks       |
| Final Polish                 | Done   | Responsive desktop/mobile UI + invalid/missing odds handling        |

## 🧠 Product Behavior

### 📅 Events and markets

- Initial snapshot comes from `src/data/betting_dashboard_data.json`.
- Domain model supports multiple markets.
- UI scope intentionally renders only market `name === "1x2"`.
- Events are grouped by sport/country/league from category data.
- `1x2` outcomes are precomputed during snapshot initialization.

### 🧾 Bet Slip rules

- Max one active selection per event.
- New outcome in same event replaces previous selection.
- Clicking selected outcome again removes it (toggle behavior).
- Selection stores `selectedOddsSnapshot` at selection time.
- Calculations:
  - `Total Odds`: product of snapshots.
  - `Potential Win`: `Total Odds * Stake`.

### 📈 Live odds and acceptance flow

- Update interval is randomized between `10-15s`.
- Updated outcomes use: `newOdds = oldOdds * random(0.9..1.1)`.
- Odds are rounded to 2 decimals and clamped to minimum `1.01`.
- Updated outcomes are temporarily locked (disabled) during transition.
- If current odds differ from snapshot:
  - Bet Slip shows `Odds changed`.
  - `Place Bet` is disabled.
  - `Accept all changes` updates snapshots and re-enables betting.

## 🏗️ Architecture

- `src/domain`: pure business logic (types, mapping, odds math, grouping, calculations).
- `src/store/sportsbook.store.ts`: single state boundary for odds, bet slip, and interactions.
- `src/ui/sportsbook-dashboard.tsx`: page-level UI wired through store selectors.
- `src/app/page.tsx`: server-side data mapping and snapshot handoff.

Performance-oriented state design:

- dynamic odds stored in maps keyed by `outcomeId`,
- each odds button subscribes only to its own small state slice,
- odds ticks avoid re-rendering the entire events list.

No React Compiler — optimizations are intentional and manual (selectors, stable dependencies).

I intentionally prioritized clarity and straightforward flows because this is a recruitment task, not a production system.
Small optimizations were added only where they improve behavior without hurting readability.

## 🧰 Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Jest + Testing Library (`jsdom`)

## 🚀 Run Locally

```bash
npm install
npm run dev
```

App: `http://localhost:3000`

### 🔧 Useful commands

```bash
npm run lint
npm run test
npm run test:watch
npm run build
npm run start
```

## 👀 Reviewer Quick Path

1. Add selections from different events and verify replace/toggle-remove behavior.
2. Wait for a live tick and verify temporary lock (`disabled`) and `Odds changed` badge.
3. Confirm `Place Bet` stays disabled until `Accept all changes`.
4. Click `Accept all changes` and verify `Place Bet` is enabled again.
5. Check mobile Bet Slip open/close behavior.

## 📊 Optional: Render Debug Counter

To print `OddsButton` render counts in DevTools Console:

```bash
# .env.local
NEXT_PUBLIC_RENDER_DEBUG=1
```

Then restart the dev server.

## 🧾 Documentation and Evidence

- 📋 Behaviour is defined in `docs/SPEC.md`
- ✅ Manual flows and edge cases live in `docs/QA.md`
- 🧭 Implementation order is tracked in `docs/ROADMAP.md`
- 📈 Performance can be validated via React Profiler and/or console render logs (`OddsButton`)

## 🗂️ Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  data/
    betting_dashboard_data.json
  domain/
    types.ts
    mapping.ts
    odds.ts
    calculations.ts
    grouping.ts
    __tests__/
  store/
    sportsbook.store.ts
    __tests__/
  ui/
    sportsbook-dashboard.tsx
    betslip-mobile.ts
    __tests__/

docs/
  SPEC.md
  QA.md
  ROADMAP.md
  AGENTS.md
```

## 🧪 Tests

Automated coverage focuses on stable, high-signal areas:

- Domain:
  - `src/domain/__tests__/mapping.test.ts`
  - `src/domain/__tests__/odds.test.ts`
  - `src/domain/__tests__/calculations.test.ts`
  - `src/domain/__tests__/grouping.test.ts`
- Store:
  - `src/store/__tests__/betslip.selection.test.ts`
  - `src/store/__tests__/betslip.oddsChanged.test.ts`
  - `src/store/__tests__/odds.updates.test.ts`
- UI helper:
  - `src/ui/__tests__/betslip-mobile.test.ts`
  - `src/ui/__tests__/stake-input.test.ts`
