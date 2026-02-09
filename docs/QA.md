# QA Checklist

## Functional

- [ ] Events list renders from `betting_dashboard_data.json`
- [ ] Only `gameName === "1x2"` is rendered in the UI
- [ ] Clicking odds adds a selection to Bet Slip
- [ ] Conflicting selection for same event is replaced (one selection per event)
- [ ] Replacement is clear (short highlight on the Bet Slip item)
- [ ] Clicking the same selected outcome toggles removal
- [ ] Stake input works and is validated
- [ ] Potential Win = Total Odds \* Stake

## Live

- [ ] Odds update every 10–15 seconds
- [ ] Multiplier range respected (0.9–1.1)
- [ ] Odds rounded to 2 decimals
- [ ] Odds clamped to min 1.01
- [ ] Blink effect indicates increase/decrease
- [ ] Lock/suspend: updated outcomes are temporarily disabled with a clear signal
- [ ] During lock: clicks do nothing (no selection changes)
- [ ] After unlock: odds appear and blink reflects direction

## Bet Slip: odds changed (must-have)

- [ ] Bet Slip shows current odds + `selectedOddsSnapshot`
- [ ] When current != snapshot: “Odds changed” badge appears
- [ ] “Place Bet” is disabled until “Accept all changes”
- [ ] “Accept all changes” updates snapshots for ALL changed selections and re-enables “Place Bet”

## Accessibility / UX (lightweight)

- [ ] Odds buttons have a clear accessible label (e.g. “Home (1)”, “Draw (X)”, “Away (2)”) via tooltip/title and/or aria-label

## Performance

- [ ] Updating odds does not re-render entire list
- [ ] Only changed OddsButtons re-render
- [ ] Proof recorded (Profiler screenshot/notes or console logs)

## UI/Responsive (must-have)

- [ ] Desktop layout: list left, Bet Slip right
- [ ] Mobile layout: Bet Slip collapsible/overlay
- [ ] Empty state for Bet Slip is clear and helpful

## Build

- [ ] `npm run lint` passes
- [ ] `npm run build` passes

---

# Manual Test Scenarios (User flows)

## 1) Add a selection to Bet Slip

Given the events list is visible  
When I click an odds button (1 / X / 2) for an event  
Then the selection appears in Bet Slip  
And the clicked odds button is visually marked as selected

## 2) Replace selection for the same event + highlight

Given I selected “Home (1)” for Event A  
When I click “Draw (X)” for Event A  
Then the Bet Slip still contains only one selection for Event A  
And the selection is replaced with “Draw (X)”  
And the Bet Slip item briefly highlights

## 3) Toggle remove on same selection

Given I selected outcome O for Event A  
When I click the same outcome O again  
Then the selection is removed from Bet Slip  
And the odds button is no longer selected

## 4) Empty Bet Slip state

Given the Bet Slip is empty  
Then I see a short message explaining how to add a selection

---

# Manual Test Scenarios (Live)

## 5) Odds update tick

Given the app is running  
When 10–15 seconds pass  
Then a subset of odds updates  
And updated odds blink green (increase) or red (decrease)

## 6) Lock/suspend during update

Given tick updates outcome O  
When odds are being updated  
Then the OddsButton for outcome O is temporarily disabled  
And UI clearly signals “updating” (lock/placeholder + tooltip)

## 7) Lock click safety (micro)

Given outcome O is locked  
When I click its OddsButton  
Then nothing changes (no selection toggles, no Bet Slip updates)

## 8) Unlock behaviour (micro)

Given outcome O was locked and then unlocks  
When the new odds are shown  
Then the button re-enables  
And blink indicates direction of change

## 9) Odds changed in Bet Slip + acceptance (must-have)

Given I added a selection with `selectedOddsSnapshot = X`  
When current odds changes to Y  
Then Bet Slip shows “Odds changed” and snapshot/current values  
And “Place Bet” is disabled  
When I click “Accept all changes”  
Then snapshots update to current odds for all changed selections  
And “Place Bet” becomes enabled

---

# Optional: Minimal unit tests (low effort, high signal)

## 10) Domain odds helpers (odds.ts)

- Test rounding to 2 decimals
- Test clamp min 1.01
- Test multiplier range produces expected bounds
- Test that invalid inputs are handled safely (if implemented)
