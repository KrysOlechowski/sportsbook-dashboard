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
    "outcome-1": 1.5,
    "outcome-2": 3.2,
    "outcome-3": 6.4,
  },
};

describe("bet slip selection", () => {
  beforeEach(() => {
    useSportsbookStore.getState().initializeSnapshot(snapshot);
  });

  it("adds selection for an event", () => {
    useSportsbookStore.getState().selectOutcome("event-1", "outcome-1");
    const state = useSportsbookStore.getState();

    expect(state.selectionByEventId["event-1"]?.outcomeId).toBe("outcome-1");
    expect(state.selectionByEventId["event-1"]?.selectedOddsSnapshot).toBe(1.5);
    expect(state.lastReplacedEventId).toBeNull();
  });

  it("replaces selection when another outcome in same event is picked", () => {
    const store = useSportsbookStore.getState();
    store.selectOutcome("event-1", "outcome-1");
    store.selectOutcome("event-1", "outcome-2");

    const state = useSportsbookStore.getState();
    expect(state.selectionByEventId["event-1"]?.outcomeId).toBe("outcome-2");
    expect(state.selectionByEventId["event-1"]?.selectedOddsSnapshot).toBe(3.2);
    expect(state.lastReplacedEventId).toBe("event-1");
  });

  it("toggles selection off when clicking the same outcome again", () => {
    const store = useSportsbookStore.getState();
    store.selectOutcome("event-1", "outcome-3");
    store.toggleOutcome("event-1", "outcome-3");

    const state = useSportsbookStore.getState();
    expect(state.selectionByEventId["event-1"]).toBeUndefined();
  });

  it("clears replacement highlight marker", () => {
    const store = useSportsbookStore.getState();
    store.selectOutcome("event-1", "outcome-1");
    store.selectOutcome("event-1", "outcome-2");
    expect(useSportsbookStore.getState().lastReplacedEventId).toBe("event-1");

    store.clearLastReplacedEventId();
    expect(useSportsbookStore.getState().lastReplacedEventId).toBeNull();
  });

  it("removes selection via removeSelection action", () => {
    const store = useSportsbookStore.getState();
    store.selectOutcome("event-1", "outcome-1");
    expect(useSportsbookStore.getState().selectionByEventId["event-1"]).toBeDefined();

    store.removeSelection("event-1");
    expect(useSportsbookStore.getState().selectionByEventId["event-1"]).toBeUndefined();
  });
});
