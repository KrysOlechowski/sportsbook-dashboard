import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import type { DomainSnapshot } from "@/domain/types";
import { useSportsbookStore } from "@/store/sportsbook.store";
import { SportsbookDashboard } from "@/ui/sportsbook-dashboard";

jest.mock("@/ui/use-live-odds-ticker", () => ({
  useLiveOddsTicker: () => undefined,
}));

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

const renderDashboard = () => {
  render(<SportsbookDashboard initialSnapshot={snapshot} />);
};

const getPlaceBetButton = () => screen.getByRole("button", { name: "Place Bet" });
const getAcceptAllChangesButton = () =>
  screen.getByRole("button", { name: "Accept all changes" });
const getLockedOddsButton = () => screen.getByTitle("Updating odds...");
const getHomeOddsButton = () => screen.getByTitle("Home");

describe("SportsbookDashboard critical UI flows", () => {
  beforeEach(() => {
    renderDashboard();
  });

  it("disables Place Bet when odds changed, then enables after accepting all changes", () => {
    act(() => {
      useSportsbookStore.getState().selectOutcome("event-1", "outcome-1");
      useSportsbookStore.getState().setStake(10);
    });

    expect(getPlaceBetButton()).toBeEnabled();

    act(() => {
      useSportsbookStore
        .getState()
        .applyOddsUpdates([{ outcomeId: "outcome-1", odds: 2.3 }]);
    });

    expect(getPlaceBetButton()).toBeDisabled();

    fireEvent.click(getAcceptAllChangesButton());

    expect(getPlaceBetButton()).toBeEnabled();
  });

  it("renders locked OddsButton as disabled and ignores click while locked", () => {
    act(() => {
      useSportsbookStore.getState().setOutcomeLock("outcome-1", true);
    });

    const lockedButton = getLockedOddsButton();

    expect(lockedButton).toBeDisabled();
    fireEvent.click(lockedButton);

    expect(useSportsbookStore.getState().selectionByEventId["event-1"]).toBeUndefined();
  });

  it("re-enables odds button after update and shows pulse class for increased odds", () => {
    act(() => {
      useSportsbookStore.getState().setOutcomeLock("outcome-1", true);
      useSportsbookStore
        .getState()
        .applyOddsUpdates([{ outcomeId: "outcome-1", odds: 2.3 }]);
    });

    const homeButton = getHomeOddsButton();

    expect(homeButton).toBeEnabled();
    expect(homeButton).toHaveClass("border-emerald-500");
    expect(homeButton).toHaveTextContent("2.30");
  });
});
