"use client";

import { memo } from "react";

import type { EventId, OutcomeId } from "@/domain/types";
import {
  UI_MARKET_NAME,
  type SportsbookStore,
  useSportsbookStore,
} from "@/store/sportsbook.store";
import { formatEventStart } from "@/ui/formatters";
import { OddsButton } from "@/ui/components/odds-button";

const EMPTY_OUTCOME_IDS: OutcomeId[] = [];

const selectOneXTwoOutcomeIdsByEventId =
  (eventId: EventId) =>
  (state: SportsbookStore): OutcomeId[] => {
    const event = state.eventsById[eventId];
    if (!event) {
      return EMPTY_OUTCOME_IDS;
    }

    const marketId = event.marketIds.find(
      (candidateMarketId) =>
        state.marketsById[candidateMarketId]?.name === UI_MARKET_NAME,
    );
    if (!marketId) {
      return EMPTY_OUTCOME_IDS;
    }

    return state.marketsById[marketId]?.outcomeIds ?? EMPTY_OUTCOME_IDS;
  };

type EventRowProps = {
  eventId: EventId;
};

export const EventRow = memo(function EventRow({ eventId }: EventRowProps) {
  const event = useSportsbookStore((state) => state.eventsById[eventId]);
  const oneXTwoOutcomeIds = useSportsbookStore(
    selectOneXTwoOutcomeIdsByEventId(eventId),
  );

  if (!event) {
    return null;
  }

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-zinc-900">{event.name}</h2>
        <p className="text-sm text-zinc-600">
          {formatEventStart(event.startAt)}
        </p>
      </div>

      <p className="mt-1 text-xs text-zinc-500">
        {event.category1Name} • {event.category3Name}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {oneXTwoOutcomeIds.length > 0 ? (
          oneXTwoOutcomeIds.map((outcomeId) => (
            <OddsButton
              key={outcomeId}
              eventId={eventId}
              outcomeId={outcomeId}
            />
          ))
        ) : (
          <p className="text-sm text-zinc-500">No 1x2 market available</p>
        )}
      </div>
    </li>
  );
});
