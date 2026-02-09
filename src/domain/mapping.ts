import type {
  DomainSnapshot,
  Event,
  EventId,
  Market,
  MarketId,
  Outcome,
  OutcomeId,
  RawDashboardEvent,
} from "@/domain/types";

const toEventId = (eventId: number): EventId => String(eventId);
const toMarketId = (marketId: number): MarketId => String(marketId);
const toOutcomeId = (outcomeId: number): OutcomeId => String(outcomeId);

export const mapRawDashboardEventsToDomainSnapshot = (
  rawEvents: RawDashboardEvent[],
): DomainSnapshot => {
  const eventIds: EventId[] = [];
  const eventsById: Record<EventId, Event> = {};
  const marketsById: Record<MarketId, Market> = {};
  const outcomesById: Record<OutcomeId, Outcome> = {};
  const oddsByOutcomeId: Record<OutcomeId, number> = {};

  for (const rawEvent of rawEvents) {
    const eventId = toEventId(rawEvent.eventId);
    const marketIds: MarketId[] = [];

    for (const rawGame of rawEvent.eventGames) {
      const marketId = toMarketId(rawGame.gameId);
      const outcomeIds: OutcomeId[] = [];

      for (const rawOutcome of rawGame.outcomes) {
        const outcomeId = toOutcomeId(rawOutcome.outcomeId);
        const outcome: Outcome = {
          id: outcomeId,
          marketId,
          eventId,
          name: rawOutcome.outcomeName,
          position: rawOutcome.outcomePosition,
        };

        outcomesById[outcomeId] = outcome;
        oddsByOutcomeId[outcomeId] = rawOutcome.outcomeOdds;
        outcomeIds.push(outcomeId);
      }

      const market: Market = {
        id: marketId,
        eventId,
        name: rawGame.gameName,
        type: rawGame.gameType,
        outcomeIds,
      };

      marketsById[marketId] = market;
      marketIds.push(marketId);
    }

    const event: Event = {
      id: eventId,
      name: rawEvent.eventName,
      startAt: rawEvent.eventStart,
      eventType: rawEvent.eventType,
      category1Id: rawEvent.category1Id,
      category2Id: rawEvent.category2Id,
      category3Id: rawEvent.category3Id,
      category1Name: rawEvent.category1Name,
      category2Name: rawEvent.category2Name,
      category3Name: rawEvent.category3Name,
      gamesCount: rawEvent.gamesCount,
      isCustomBetAvailable: rawEvent.isCustomBetAvailable,
      marketIds,
    };

    eventsById[eventId] = event;
    eventIds.push(eventId);
  }

  return {
    eventIds,
    eventsById,
    marketsById,
    outcomesById,
    oddsByOutcomeId,
  };
};
