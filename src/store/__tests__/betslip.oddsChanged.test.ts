import type { DomainSnapshot } from "@/domain/types";
import { useSportsbookStore } from "@/store/sportsbook.store";
import { selectHasOddsChanges } from "@/store/sportsbook.selectors";

const snapshot: DomainSnapshot = {
  eventIds: ["event-1", "event-2"],
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
    "event-2": {
      id: "event-2",
      name: "Event 2",
      startAt: 1767817900000,
      eventType: 1,
      category1Id: 1,
      category2Id: 2,
      category3Id: 4,
      category1Name: "Sport",
      category2Name: "Country",
      category3Name: "League 2",
      gamesCount: 1,
      isCustomBetAvailable: false,
      marketIds: ["market-2"],
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
    "market-2": {
      id: "market-2",
      eventId: "event-2",
      name: "1x2",
      type: 1,
      outcomeIds: ["outcome-4", "outcome-5", "outcome-6"],
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
    "outcome-4": {
      id: "outcome-4",
      marketId: "market-2",
      eventId: "event-2",
      name: "Home 2",
      position: 0,
    },
    "outcome-5": {
      id: "outcome-5",
      marketId: "market-2",
      eventId: "event-2",
      name: "Draw 2",
      position: 1,
    },
    "outcome-6": {
      id: "outcome-6",
      marketId: "market-2",
      eventId: "event-2",
      name: "Away 2",
      position: 2,
    },
  },
  oddsByOutcomeId: {
    "outcome-1": 1.5,
    "outcome-2": 3.2,
    "outcome-3": 6.4,
    "outcome-4": 1.9,
    "outcome-5": 3.0,
    "outcome-6": 4.8,
  },
};

describe("bet slip odds changed handling", () => {
  beforeEach(() => {
    useSportsbookStore.getState().initializeSnapshot(snapshot);
  });

  it("marks hasOddsChanges when current odds differ from selected snapshot", () => {
    const store = useSportsbookStore.getState();

    store.selectOutcome("event-1", "outcome-1");
    expect(selectHasOddsChanges(useSportsbookStore.getState())).toBe(false);

    store.applyOddsUpdates([{ outcomeId: "outcome-1", odds: 1.9 }]);
    expect(selectHasOddsChanges(useSportsbookStore.getState())).toBe(true);
  });

  it("acceptAllChanges updates snapshots for all changed selections", () => {
    const store = useSportsbookStore.getState();

    store.selectOutcome("event-1", "outcome-2");
    store.selectOutcome("event-2", "outcome-4");
    store.applyOddsUpdates([
      { outcomeId: "outcome-2", odds: 3.6 },
      { outcomeId: "outcome-4", odds: 2.2 },
    ]);
    expect(selectHasOddsChanges(useSportsbookStore.getState())).toBe(true);

    store.acceptAllChanges();

    const state = useSportsbookStore.getState();
    expect(state.selectionByEventId["event-1"]?.selectedOddsSnapshot).toBe(3.6);
    expect(state.selectionByEventId["event-2"]?.selectedOddsSnapshot).toBe(2.2);
    expect(selectHasOddsChanges(state)).toBe(false);
  });

  it("keeps previous snapshot when current odds become invalid", () => {
    const store = useSportsbookStore.getState();
    store.selectOutcome("event-1", "outcome-1");
    const initialSnapshot = useSportsbookStore.getState().selectionByEventId["event-1"]
      ?.selectedOddsSnapshot;

    useSportsbookStore.setState((state) => ({
      oddsByOutcomeId: {
        ...state.oddsByOutcomeId,
        "outcome-1": Number.NaN,
      },
    }));

    expect(selectHasOddsChanges(useSportsbookStore.getState())).toBe(true);
    store.acceptAllChanges();

    expect(useSportsbookStore.getState().selectionByEventId["event-1"]?.selectedOddsSnapshot).toBe(
      initialSnapshot,
    );
    expect(selectHasOddsChanges(useSportsbookStore.getState())).toBe(true);
  });
});
