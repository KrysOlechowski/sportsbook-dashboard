import rawDashboardEvents from "@/data/betting_dashboard_data.json";
import { parseRawDashboardEvents } from "@/domain/raw-dashboard-guard";

describe("parseRawDashboardEvents", () => {
  it("accepts valid dashboard payload", () => {
    expect(() => parseRawDashboardEvents(rawDashboardEvents)).not.toThrow();
  });

  it("throws when payload is not an array", () => {
    expect(() => parseRawDashboardEvents({})).toThrow(
      "Invalid dashboard payload: expected an array of events.",
    );
  });

  it("throws when event shape is invalid", () => {
    const invalidPayload = [{ ...rawDashboardEvents[0], eventGames: null }];

    expect(() => parseRawDashboardEvents(invalidPayload)).toThrow(
      "Invalid dashboard payload: event at index 0 has unexpected shape.",
    );
  });
});
