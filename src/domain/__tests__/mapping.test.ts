import rawEvents from "@/data/betting_dashboard_data.json";
import { mapRawDashboardEventsToDomainSnapshot } from "@/domain/mapping";
import type { RawDashboardEvent } from "@/domain/types";

describe("mapRawDashboardEventsToDomainSnapshot", () => {
  it("builds a normalized snapshot with consistent references", () => {
    const input = (rawEvents as RawDashboardEvent[]).slice(0, 3);
    const snapshot = mapRawDashboardEventsToDomainSnapshot(input);

    expect(snapshot.eventIds.length).toBe(3);
    expect(Object.keys(snapshot.eventsById)).toHaveLength(3);
    expect(Object.keys(snapshot.marketsById).length).toBeGreaterThan(0);
    expect(Object.keys(snapshot.outcomesById).length).toBeGreaterThan(0);
    expect(Object.keys(snapshot.oddsByOutcomeId).length).toBeGreaterThan(0);

    for (const eventId of snapshot.eventIds) {
      const event = snapshot.eventsById[eventId];
      expect(event).toBeDefined();

      for (const marketId of event.marketIds) {
        const market = snapshot.marketsById[marketId];
        expect(market).toBeDefined();
        expect(market.eventId).toBe(eventId);

        for (const outcomeId of market.outcomeIds) {
          const outcome = snapshot.outcomesById[outcomeId];
          expect(outcome).toBeDefined();
          expect(outcome.marketId).toBe(marketId);
          expect(outcome.eventId).toBe(eventId);
          expect(typeof snapshot.oddsByOutcomeId[outcomeId]).toBe("number");
        }
      }
    }
  });
});
