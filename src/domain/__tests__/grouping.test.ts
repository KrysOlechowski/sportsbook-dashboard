import type { Event, EventId } from "@/domain/types";
import { groupEventIdsByLeagueCategory } from "@/domain/grouping";

const createEvent = (
  id: EventId,
  sportName: string,
  countryName: string,
  leagueName: string,
): Event => ({
  id,
  name: id,
  startAt: 0,
  eventType: 1,
  category1Id: 1,
  category2Id: 2,
  category3Id: 3,
  category1Name: sportName,
  category2Name: countryName,
  category3Name: leagueName,
  gamesCount: 1,
  isCustomBetAvailable: false,
  marketIds: [],
});

describe("groupEventIdsByLeagueCategory", () => {
  it("groups events by sport/country/league while preserving order", () => {
    const eventIds: EventId[] = ["e1", "e2", "e3", "e4"];
    const eventsById: Record<EventId, Event> = {
      e1: createEvent("e1", "Football", "England", "Premier League"),
      e2: createEvent("e2", "Football", "England", "Premier League"),
      e3: createEvent("e3", "Football", "Spain", "LaLiga"),
      e4: createEvent("e4", "Tennis", "ATP", "ATP Finals"),
    };

    const groups = groupEventIdsByLeagueCategory(eventIds, eventsById);

    expect(groups).toEqual([
      {
        id: "Football::England::Premier League",
        sportName: "Football",
        countryName: "England",
        leagueName: "Premier League",
        eventIds: ["e1", "e2"],
      },
      {
        id: "Football::Spain::LaLiga",
        sportName: "Football",
        countryName: "Spain",
        leagueName: "LaLiga",
        eventIds: ["e3"],
      },
      {
        id: "Tennis::ATP::ATP Finals",
        sportName: "Tennis",
        countryName: "ATP",
        leagueName: "ATP Finals",
        eventIds: ["e4"],
      },
    ]);
  });
});
