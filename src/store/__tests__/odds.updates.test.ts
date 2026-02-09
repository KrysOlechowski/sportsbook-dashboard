import type { DomainSnapshot } from "@/domain/types";
import { useSportsbookStore } from "@/store/sportsbook.store";

const snapshot: DomainSnapshot = {
  eventIds: ["event-1"],
  eventsById: {
    "event-1": {
      id: "event-1",
      name: "Event 1",
      startAt: 1767816900000,
      eventType: 1,
      category1Id: 1,
      category2Id: 2,
      category3Id: 3,
      category1Name: "Sport",
      category2Name: "Country",
      category3Name: "League",
      gamesCount: 1,
      isCustomBetAvailable: false,
      marketIds: ["market-1"],
    },
  },
  marketsById: {
    "market-1": {
      id: "market-1",
      eventId: "event-1",
      name: "1x2",
      type: 1,
      outcomeIds: ["outcome-1", "outcome-2", "outcome-3"],
    },
  },
  outcomesById: {
    "outcome-1": {
      id: "outcome-1",
      marketId: "market-1",
      eventId: "event-1",
      name: "Home",
      position: 0,
    },
    "outcome-2": {
      id: "outcome-2",
      marketId: "market-1",
      eventId: "event-1",
      name: "Draw",
      position: 1,
    },
    "outcome-3": {
      id: "outcome-3",
      marketId: "market-1",
      eventId: "event-1",
      name: "Away",
      position: 2,
    },
  },
  oddsByOutcomeId: {
    "outcome-1": 2.0,
    "outcome-2": 3.0,
    "outcome-3": 4.0,
  },
};

describe("odds updates", () => {
  beforeEach(() => {
    useSportsbookStore.getState().initializeSnapshot(snapshot);
  });

  it("updates only targeted outcomes and sets pulse direction", () => {
    const store = useSportsbookStore.getState();

    store.applyOddsUpdates([
      { outcomeId: "outcome-1", odds: 2.2 },
      { outcomeId: "outcome-2", odds: 2.8 },
    ]);

    const state = useSportsbookStore.getState();
    expect(state.oddsByOutcomeId["outcome-1"]).toBe(2.2);
    expect(state.oddsByOutcomeId["outcome-2"]).toBe(2.8);
    expect(state.oddsByOutcomeId["outcome-3"]).toBe(4.0);

    expect(state.pulseByOutcomeId["outcome-1"]).toBe("up");
    expect(state.pulseByOutcomeId["outcome-2"]).toBe("down");
    expect(state.pulseByOutcomeId["outcome-3"]).toBeUndefined();
  });

  it("clears pulse state for a single outcome", () => {
    const store = useSportsbookStore.getState();

    store.applyOddsUpdates([{ outcomeId: "outcome-1", odds: 2.2 }]);
    expect(useSportsbookStore.getState().pulseByOutcomeId["outcome-1"]).toBe("up");

    store.clearOutcomePulse("outcome-1");
    expect(useSportsbookStore.getState().pulseByOutcomeId["outcome-1"]).toBeNull();
  });

  it("locks outcome and unlocks it after odds update is applied", () => {
    const store = useSportsbookStore.getState();

    store.setOutcomeLock("outcome-1", true);
    expect(useSportsbookStore.getState().lockedByOutcomeId["outcome-1"]).toBe(true);

    store.applyOddsUpdates([{ outcomeId: "outcome-1", odds: 2.3 }]);
    expect(useSportsbookStore.getState().lockedByOutcomeId["outcome-1"]).toBe(false);
  });

  it("does nothing on toggle when outcome is locked", () => {
    const store = useSportsbookStore.getState();

    store.selectOutcome("event-1", "outcome-2");
    expect(useSportsbookStore.getState().selectionByEventId["event-1"]?.outcomeId).toBe(
      "outcome-2",
    );

    store.setOutcomeLock("outcome-2", true);
    store.toggleOutcome("event-1", "outcome-2");

    expect(useSportsbookStore.getState().selectionByEventId["event-1"]?.outcomeId).toBe(
      "outcome-2",
    );
  });
});
