export type EventId = string;
export type MarketId = string;
export type OutcomeId = string;

export type Outcome = {
  id: OutcomeId;
  marketId: MarketId;
  eventId: EventId;
  name: string;
  position: number;
};

export type Market = {
  id: MarketId;
  eventId: EventId;
  name: string;
  type: number;
  outcomeIds: OutcomeId[];
};

export type Event = {
  id: EventId;
  name: string;
  startAt: number;
  eventType: number;
  category1Id: number;
  category2Id: number;
  category3Id: number;
  category1Name: string;
  category2Name: string;
  category3Name: string;
  gamesCount: number;
  isCustomBetAvailable: boolean;
  marketIds: MarketId[];
};

export type DomainSnapshot = {
  eventIds: EventId[];
  eventsById: Record<EventId, Event>;
  marketsById: Record<MarketId, Market>;
  outcomesById: Record<OutcomeId, Outcome>;
  oddsByOutcomeId: Record<OutcomeId, number>;
};

export type RawDashboardOutcome = {
  outcomeId: number;
  outcomeName: string;
  outcomeOdds: number;
  outcomePosition: number;
};

export type RawDashboardGame = {
  gameId: number;
  gameName: string;
  gameType: number;
  outcomes: RawDashboardOutcome[];
};

export type RawDashboardEvent = {
  eventId: number;
  eventName: string;
  eventStart: number;
  eventType: number;
  category1Id: number;
  category2Id: number;
  category3Id: number;
  category1Name: string;
  category2Name: string;
  category3Name: string;
  gamesCount: number;
  eventGames: RawDashboardGame[];
  isCustomBetAvailable: boolean;
};
