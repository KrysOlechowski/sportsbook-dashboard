import { create } from "zustand";

import {
  calculatePotentialWin,
  calculateTotalOdds,
} from "@/domain/calculations";
import type {
  DomainSnapshot,
  EventId,
  MarketId,
  OutcomeId,
} from "@/domain/types";

export const UI_MARKET_NAME = "1x2";

export type OddsPulse = "up" | "down" | null;

export type BetSelection = {
  eventId: EventId;
  outcomeId: OutcomeId;
  selectedOddsSnapshot: number;
  addedAt: number;
};

export type OddsUpdate = {
  outcomeId: OutcomeId;
  odds: number;
};

export type SportsbookState = DomainSnapshot & {
  pulseByOutcomeId: Record<OutcomeId, OddsPulse>;
  lockedByOutcomeId: Record<OutcomeId, boolean>;
  selectionByEventId: Record<EventId, BetSelection>;
  stake: number;
  lastReplacedEventId: EventId | null;
};

export type SportsbookActions = {
  initializeSnapshot: (snapshot: DomainSnapshot) => void;
  selectOutcome: (eventId: EventId, outcomeId: OutcomeId) => void;
  toggleOutcome: (eventId: EventId, outcomeId: OutcomeId) => void;
  removeSelection: (eventId: EventId) => void;
  clearLastReplacedEventId: () => void;
  setStake: (value: number) => void;
  acceptAllChanges: () => void;
  setOutcomeLock: (outcomeId: OutcomeId, locked: boolean) => void;
  clearOutcomePulse: (outcomeId: OutcomeId) => void;
  applyOddsUpdates: (updates: OddsUpdate[]) => void;
};

export type SportsbookStore = SportsbookState & SportsbookActions;

const EMPTY_SNAPSHOT: DomainSnapshot = {
  eventIds: [],
  eventsById: {},
  marketsById: {},
  outcomesById: {},
  oddsByOutcomeId: {},
};

const DEFAULT_STATE: SportsbookState = {
  ...EMPTY_SNAPSHOT,
  pulseByOutcomeId: {},
  lockedByOutcomeId: {},
  selectionByEventId: {},
  stake: 0,
  lastReplacedEventId: null,
};

export const useSportsbookStore = create<SportsbookStore>((set, get) => ({
  ...DEFAULT_STATE,
  initializeSnapshot: (snapshot) => {
    set({
      ...DEFAULT_STATE,
      ...snapshot,
    });
  },
  selectOutcome: (eventId, outcomeId) => {
    const { selectionByEventId, oddsByOutcomeId } = get();
    const nextSelection: BetSelection = {
      eventId,
      outcomeId,
      selectedOddsSnapshot: oddsByOutcomeId[outcomeId] ?? 1,
      addedAt: Date.now(),
    };

    set({
      selectionByEventId: {
        ...selectionByEventId,
        [eventId]: nextSelection,
      },
      lastReplacedEventId: selectionByEventId[eventId] ? eventId : null,
    });
  },
  toggleOutcome: (eventId, outcomeId) => {
    const { selectionByEventId } = get();
    const current = selectionByEventId[eventId];

    if (current?.outcomeId === outcomeId) {
      const nextSelectionByEventId = { ...selectionByEventId };
      delete nextSelectionByEventId[eventId];
      set({
        selectionByEventId: nextSelectionByEventId,
        lastReplacedEventId: null,
      });
      return;
    }

    get().selectOutcome(eventId, outcomeId);
  },
  removeSelection: (eventId) => {
    const { selectionByEventId } = get();
    if (!selectionByEventId[eventId]) {
      return;
    }

    const nextSelectionByEventId = { ...selectionByEventId };
    delete nextSelectionByEventId[eventId];
    set({
      selectionByEventId: nextSelectionByEventId,
      lastReplacedEventId: null,
    });
  },
  clearLastReplacedEventId: () => {
    set({ lastReplacedEventId: null });
  },
  setStake: (value) => {
    set({
      stake: Number.isFinite(value) ? Math.max(0, value) : 0,
    });
  },
  acceptAllChanges: () => {
    const { selectionByEventId, oddsByOutcomeId } = get();
    const nextSelectionByEventId: Record<EventId, BetSelection> = {};

    for (const [eventId, selection] of Object.entries(selectionByEventId)) {
      nextSelectionByEventId[eventId] = {
        ...selection,
        selectedOddsSnapshot:
          oddsByOutcomeId[selection.outcomeId] ?? selection.selectedOddsSnapshot,
      };
    }

    set({ selectionByEventId: nextSelectionByEventId });
  },
  setOutcomeLock: (outcomeId, locked) => {
    set((state) => ({
      lockedByOutcomeId: {
        ...state.lockedByOutcomeId,
        [outcomeId]: locked,
      },
    }));
  },
  clearOutcomePulse: (outcomeId) => {
    set((state) => ({
      pulseByOutcomeId: {
        ...state.pulseByOutcomeId,
        [outcomeId]: null,
      },
    }));
  },
  applyOddsUpdates: (updates) => {
    if (updates.length === 0) {
      return;
    }

    set((state) => {
      const nextOddsByOutcomeId = { ...state.oddsByOutcomeId };
      const nextPulseByOutcomeId = { ...state.pulseByOutcomeId };
      const nextLockedByOutcomeId = { ...state.lockedByOutcomeId };

      for (const update of updates) {
        const previousOdds = state.oddsByOutcomeId[update.outcomeId];
        nextOddsByOutcomeId[update.outcomeId] = update.odds;
        nextLockedByOutcomeId[update.outcomeId] = false;

        if (typeof previousOdds !== "number") {
          nextPulseByOutcomeId[update.outcomeId] = null;
          continue;
        }

        if (update.odds > previousOdds) {
          nextPulseByOutcomeId[update.outcomeId] = "up";
          continue;
        }

        if (update.odds < previousOdds) {
          nextPulseByOutcomeId[update.outcomeId] = "down";
          continue;
        }

        nextPulseByOutcomeId[update.outcomeId] = null;
      }

      return {
        oddsByOutcomeId: nextOddsByOutcomeId,
        pulseByOutcomeId: nextPulseByOutcomeId,
        lockedByOutcomeId: nextLockedByOutcomeId,
      };
    });
  },
}));

export const selectEventIds = (state: SportsbookStore): EventId[] =>
  state.eventIds;

export const selectMarketIdsForEvent =
  (eventId: EventId) =>
  (state: SportsbookStore): MarketId[] =>
    state.eventsById[eventId]?.marketIds ?? [];

export const selectHasOddsChanges = (state: SportsbookStore): boolean =>
  Object.values(state.selectionByEventId).some((selection) => {
    return state.oddsByOutcomeId[selection.outcomeId] !== selection.selectedOddsSnapshot;
  });

export const selectTotalOdds = (state: SportsbookStore): number =>
  calculateTotalOdds(Object.values(state.selectionByEventId));

export const selectPotentialWin = (state: SportsbookStore): number =>
  calculatePotentialWin(Object.values(state.selectionByEventId), state.stake);
