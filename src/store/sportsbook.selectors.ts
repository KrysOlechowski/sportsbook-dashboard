import {
  calculatePotentialWin,
  calculateTotalOdds,
} from "@/domain/calculations";
import { isValidOdds } from "@/domain/odds";
import type { EventId, MarketId } from "@/domain/types";
import type { SportsbookStore } from "@/store/sportsbook.store";

export const selectEventIds = (state: SportsbookStore): EventId[] =>
  state.eventIds;

export const selectMarketIdsForEvent =
  (eventId: EventId) =>
  (state: SportsbookStore): MarketId[] =>
    state.eventsById[eventId]?.marketIds ?? [];

export const selectHasOddsChanges = (state: SportsbookStore): boolean =>
  Object.values(state.selectionByEventId).some((selection) => {
    const currentOdds = state.oddsByOutcomeId[selection.outcomeId];
    if (!isValidOdds(currentOdds)) {
      return true;
    }

    return currentOdds !== selection.selectedOddsSnapshot;
  });

export const selectTotalOdds = (state: SportsbookStore): number =>
  calculateTotalOdds(Object.values(state.selectionByEventId));

export const selectPotentialWin = (state: SportsbookStore): number =>
  calculatePotentialWin(Object.values(state.selectionByEventId), state.stake);
