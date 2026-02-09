# SPEC

## Decisions (kept here to avoid extra docs)

1. Domain is market-agnostic (multiple markets per event), but UI renders only `gameName === "1x2"` to match task scope.
2. Bet Slip conflict rule: at most ONE active selection per event (conflicting picks replace the previous selection).
3. Clicking the same selected outcome again: toggle remove (second click removes it from Bet Slip).
4. Total odds: product of selected odds snapshots (accumulator-like).
5. Live updates: every 10–15 seconds; `newOdds = oldOdds * random(0.9..1.1)`; rounded to 2 decimals; clamped to min 1.01.
6. Performance: odds stored by `outcomeId`; `OddsButton` subscribes only to its own `outcomeId` via selector.
7. Sport/league labels are data-driven (`category1Name`, `category3Name`) and never hardcoded.
8. Odds changed handling is must-have: require acceptance; “Place Bet” disabled until user accepts.
9. Selection replacement is communicated via a short highlight on the Bet Slip item.
10. During odds updates, outcomes may be temporarily locked/suspended (disabled + clear signal).
11. “Accept changes” is a global action: “Accept all changes” updates snapshots for all changed selections at once.

## Terminology

- Event: a match (`eventId`, `eventName`, `eventStart`)
- Market/Game: a betting market within an event (`gameId`, `gameName`)
- Outcome: a selectable option within a market (`outcomeId`, `outcomeName`, `odds`)  
  Example for 1x2: outcome is Home (1) / Draw (X) / Away (2)

## Data rules

- Use local `betting_dashboard_data.json` as initial snapshot.
- UI scope: render only the 1x2 market, identified by `gameName === "1x2"`.
- Domain scope: parsing and types remain market-agnostic.

## Bet Slip rules

- At most ONE active selection per event.
- Clicking an outcome:
  - if outcome is not selected for this event -> select it
  - if outcome is already selected for this event -> remove it (toggle remove)
  - if a different outcome is selected for this event -> replace previous selection
- Replacement must be clear via a short highlight on the Bet Slip item (e.g. 600–900ms).

## Bet Slip odds display (important)

Each Bet Slip item shows:

- current odds (primary value)
- `selectedOddsSnapshot` (odds at selection time) as secondary text/badge

If `selectedOddsSnapshot != currentOdds`:

- show “Odds changed” badge
- disable “Place Bet”
- show “Accept all changes” action that updates all snapshots to current odds

## Calculations

- Total Odds = product of `selectedOddsSnapshot` values (not current odds).
- Potential Win = Total Odds \* Stake.

## Live odds simulation

- Frequency: every 10–15 seconds.
- For updated outcomes:
  - `newOdds = oldOdds * randomMultiplier(0.9..1.1)`
  - round to 2 decimals
  - clamp to min 1.01
- UI feedback:
  - blink green if newOdds > oldOdds
  - blink red if newOdds < oldOdds

## Lock/Suspend (must-have)

- During an outcome’s update:
  - mark it as temporarily locked/suspended (e.g. 300–800ms)
  - disable the odds button and show a clear signal (lock icon / placeholder / tooltip “Updating odds…”)
  - then show the updated odds and blink up/down

## State Contract (Zustand store)

This section defines the minimal store shape and responsibilities to keep implementation consistent and performant.

### RSC / Client boundary (Next.js App Router)

- The raw JSON import and mapping to a `DomainSnapshot` must happen in a Server Component (e.g. `app/page.tsx`).
- Zustand store initialization, live ticker (odds updates), and all user interactions must live in Client Components (`"use client"`).
- UI components must not parse or traverse the raw JSON shape. They should render from normalized IDs/maps (store selectors).

### Static (normalized) metadata

- `eventIds: string[]`  
  Ordered list for rendering.
- `eventsById: Record<string, Event>`  
  Event metadata only (names, start time, category/league ids/names).
- `marketsById: Record<string, Market>`  
  Market metadata (e.g. gameName, eventId).
- `outcomesById: Record<string, Outcome>`  
  Outcome metadata (e.g. outcomeName, marketId, eventId). No dynamic odds here.

### Dynamic odds + UI transient state (keyed by outcomeId)

- `oddsByOutcomeId: Record<string, number>`  
  Current odds (live-updating).
- `pulseByOutcomeId: Record<string, "up" | "down" | null>`  
  Blink direction to briefly highlight odds changes.
- `lockedByOutcomeId: Record<string, boolean>`  
  Temporary lock/suspend during an update tick.

### Bet Slip (one selection per event)

- `selectionByEventId: Record<string, BetSelection>`  
  Exactly one selection per event.
  Suggested shape:
  - `eventId: string`
  - `outcomeId: string`
  - `selectedOddsSnapshot: number` (stored at selection time)
  - `addedAt: number` (timestamp, optional)
- `stake: number`  
  Single stake for accumulator.
- `lastReplacedEventId: string | null`  
  Used to drive a brief highlight when a selection is replaced.

### Derived values (via selectors)

- `hasOddsChanges: boolean`  
  True if any selection snapshot differs from current odds.
- `totalOdds: number`  
  Product of `selectedOddsSnapshot` values (not current odds).
- `potentialWin: number`  
  `totalOdds * stake`.

### Actions (suggested minimal API)

- `selectOutcome(eventId, outcomeId)`  
  Adds/replaces selection for an event. If replacing, update `lastReplacedEventId`.
  Stores `selectedOddsSnapshot = oddsByOutcomeId[outcomeId]`.
- `toggleOutcome(eventId, outcomeId)`  
  If the same outcome is already selected for that event: remove it. Otherwise behave like selectOutcome.
- `removeSelection(eventId)`  
  Removes selection.
- `setStake(value)`  
  Updates stake (sanitized/validated).
- `acceptAllChanges()`  
  Updates every `selectedOddsSnapshot` to the current odds for that outcomeId, clearing “odds changed”.
- `tickOdds()` / `applyOddsUpdates(updates)`  
  Live simulation: sets `lockedByOutcomeId` during update, updates odds, sets `pulseByOutcomeId`.

Performance note:

- Prefer rendering lists by IDs (`eventIds`) and selecting per-row/per-button slices with selectors.
- `OddsButton` should subscribe only to `oddsByOutcomeId[outcomeId]`, `pulseByOutcomeId[outcomeId]`,
  `lockedByOutcomeId[outcomeId]`, and “isSelected for event” status.

## Odds feed extension point (SSE/WebSocket-ready)

To keep the task scope small while staying “production-shaped”, odds updates should flow through a single, swappable feed abstraction:

- The UI and store must not know whether updates come from a mock timer or a real server stream.
- A feed implementation is responsible only for emitting batches of updates (e.g., “these outcomeIds changed to these odds”).
- The store exposes a single action to apply updates, which:
  - updates `oddsByOutcomeId`
  - sets temporary `lockedByOutcomeId` for outcomes being updated (lock/suspend)
  - sets `pulseByOutcomeId` (up/down) for blink feedback
- Current implementation: client-side mock feed (timer-based).
- Future swap (no UI changes): SSE or WebSocket stream from a backend endpoint.

This keeps Level 4 performance guarantees intact and makes it easy to replace the mock with a real-time server feed later.

## Performance requirements (Level 4)

- Live updates must not re-render the entire list.
- OddsButton subscribes to a minimal state slice (by `outcomeId` + selection status).
- Verify via Profiler or logs.
