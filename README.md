# 🏟️ Live Sportsbook Dashboard (Recruitment Task)

A simplified **live sportsbook** dashboard that lists events (matches) and lets the user add selections to a **Bet Slip**.  
The app simulates real-time behaviour where **odds change over time**.

---

## ✨ Highlights

- ⚽ **1x2 market UI** (Home / Draw / Away)
- 🧾 **Bet Slip** with conflict rules (one selection per event)
- 🔁 **Live odds ticker** (updates every 10–15 seconds)
- 🟢🔴 **Blink feedback** on odds changes (up/down)
- 🔒 **Temporary lock/suspend** during odds updates
- ✅ **Odds-changed handling** with mandatory acceptance before placing a bet
- 🚀 **Level 4 performance**: only affected odds buttons re-render (selector-based)

---

## 🧰 Tech Stack

- ⚛️ Next.js (App Router)
- 🟦 TypeScript
- 🎨 Tailwind CSS
- 🧠 Zustand (fine-grained selectors for performance)

---

## ✅ Requirements Coverage (Levels 1–4)

### Level 1 — Events list

- Renders events from `betting_dashboard_data.json`
- Displays: `eventName`, formatted `eventStart`
- Renders odds buttons for the `1x2` market

### Level 2 — Bet Slip

- Clicking an odds button adds a selection to Bet Slip
- Conflicts for the same event are resolved by **replacing** the previous selection
- Replacement is communicated via a short **highlight** on the Bet Slip item
- Clicking the same selected outcome toggles removal
- Stake input
- Calculation: **Total Odds × Stake**

### Level 3 — Live simulation

- Simulates odds feed updates every **10–15 seconds**
- Updates a subset of outcomes using multiplier **0.9–1.1**
- Visual feedback:
  - 🟢 blink on increase
  - 🔴 blink on decrease
- **Odds changed** (must-have, implemented properly):
  - Bet Slip shows **current odds** and **selected odds snapshot**
  - if odds changed: “Odds changed” badge
  - **Place Bet** is disabled until the user clicks **Accept all changes**
- During an odds update, an outcome can be temporarily **locked/suspended** (button disabled + clear signal)

### Level 4 — Render optimization

- Odds updates do **not** re-render the entire list
- Only affected odds buttons / rows re-render

---

## 🧪 Quality & Evidence

- 📋 Behaviour is defined in `docs/SPEC.md`
- ✅ Manual flows and edge cases live in `docs/QA.md`
- 🧭 Implementation order is tracked in `docs/ROADMAP.md`
- 🤖 Codex workflow rules are captured in `docs/AGENTS.md`
- 📈 Performance validated via React Profiler and/or console render logs (`OddsButton`)

---

## 🧩 Domain decision (markets)

- The domain model supports multiple markets per event, but the UI renders only `gameName === "1x2"` to match the task scope.

---

## 🗃️ Data Source

- `src/data/betting_dashboard_data.json` is treated as the initial snapshot.

---

## 🚀 Getting Started (npm)

    npm install
    npm run dev

## 🔧 Useful Commands

    npm run lint
    npm run build
    npm run start

---

## 🗂️ Project Structure

    /
    ├─ app/
    │  ├─ layout.tsx
    │  ├─ page.tsx
    │  └─ globals.css
    │
    ├─ docs/
    │  ├─ ROADMAP.md
    │  ├─ SPEC.md
    │  ├─ QA.md
    │  └─ AGENTS.md
    │
    ├─ src/
    │  ├─ data/
    │  │  └─ betting_dashboard_data.json
    │  │
    │  ├─ domain/
    │  │  ├─ types.ts
    │  │  ├─ mapping.ts
    │  │  └─ odds.ts
    │  │
    │  ├─ store/
    │  │  ├─ sportsbook.store.ts
    │  │  └─ selectors.ts
    │  │
    │  ├─ ui/
    │  │  ├─ components/
    │  │  │  ├─ events/
    │  │  │  │  ├─ EventsList.tsx
    │  │  │  │  ├─ LeagueSection.tsx
    │  │  │  │  ├─ EventRow.tsx
    │  │  │  │  ├─ Market1x2Row.tsx
    │  │  │  │  └─ OddsButton.tsx
    │  │  │  └─ betslip/
    │  │  │     ├─ BetSlip.tsx
    │  │  │     ├─ BetSlipItem.tsx
    │  │  │     ├─ StakeInput.tsx
    │  │  │     └─ BetSlipSummary.tsx
    │  │  │
    │  │  └─ hooks/
    │  │     ├─ useOdds.ts
    │  │     └─ useSelection.ts
    │  │
    │  └─ lib/
    │     └─ time.ts
    │
    └─ package.json

---

## Optional: Render Debug Counter (Level 4 proof)

To enable `OddsButton` render counters in the browser console:

1. Create `.env.local` in project root:
   `NEXT_PUBLIC_RENDER_DEBUG=1`
2. Restart dev server:
   `npm run dev`
3. Open browser DevTools Console and wait for live odds ticks.
   You will see logs like:
   `render:odds-button:<outcomeId>: <count>`

Disable by removing the variable or setting:
`NEXT_PUBLIC_RENDER_DEBUG=0`

---

## 📝 Notes

- `src/domain` contains pure domain logic (no React imports).
- `src/store` keeps odds and bet slip state; selectors/hooks minimize re-renders (Level 4).
- Sport/league labels are data-driven (no hardcoded sport names).
- I used an AI coding assistant (Codex) to speed up scaffolding and repetitive refactors.
- All domain and UX decisions (Bet Slip rules, odds snapshot vs current with mandatory acceptance, temporary lock/suspend, and Level 4 performance constraints) were designed and validated by me using the SPEC/QA docs and profiling evidence.
