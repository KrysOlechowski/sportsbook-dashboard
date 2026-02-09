"use client";

import { useEffect } from "react";

import type { DomainSnapshot, EventId, OutcomeId } from "@/domain/types";
import {
  UI_MARKET_NAME,
  type SportsbookStore,
  useSportsbookStore,
} from "@/store/sportsbook.store";

type SportsbookDashboardProps = {
  initialSnapshot: DomainSnapshot;
};

const EMPTY_OUTCOME_IDS: OutcomeId[] = [];

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const ONE_X_TWO_LABELS: Record<number, string> = {
  0: "1",
  1: "X",
  2: "2",
};

const formatOdds = (value: number): string => value.toFixed(2);

const formatEventStart = (timestamp: number): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown start time";
  }

  return DATE_TIME_FORMATTER.format(date);
};

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

function OddsButton({ outcomeId }: { outcomeId: OutcomeId }) {
  const outcome = useSportsbookStore((state) => state.outcomesById[outcomeId]);
  const odds = useSportsbookStore((state) => state.oddsByOutcomeId[outcomeId]);

  if (!outcome || typeof odds !== "number") {
    return null;
  }

  const label = ONE_X_TWO_LABELS[outcome.position] ?? outcome.name;

  return (
    <button
      type="button"
      title={outcome.name}
      className="flex min-w-20 items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900"
    >
      <span>{label}</span>
      <span>{formatOdds(odds)}</span>
    </button>
  );
}

function EventRow({ eventId }: { eventId: EventId }) {
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
        <p className="text-sm text-zinc-600">{formatEventStart(event.startAt)}</p>
      </div>

      <p className="mt-1 text-xs text-zinc-500">
        {event.category1Name} • {event.category3Name}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {oneXTwoOutcomeIds.length > 0 ? (
          oneXTwoOutcomeIds.map((outcomeId) => (
            <OddsButton key={outcomeId} outcomeId={outcomeId} />
          ))
        ) : (
          <p className="text-sm text-zinc-500">No 1x2 market available</p>
        )}
      </div>
    </li>
  );
}

export function SportsbookDashboard({ initialSnapshot }: SportsbookDashboardProps) {
  const initializeSnapshot = useSportsbookStore(
    (state) => state.initializeSnapshot,
  );
  const eventIds = useSportsbookStore((state) => state.eventIds);

  useEffect(() => {
    initializeSnapshot(initialSnapshot);
  }, [initialSnapshot, initializeSnapshot]);

  return (
    <main className="min-h-screen bg-zinc-100 p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Live Sportsbook Dashboard
          </h1>
          <p className="text-sm text-zinc-600">
            Events list with 1x2 markets from local snapshot data
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {eventIds.map((eventId) => (
            <EventRow key={eventId} eventId={eventId} />
          ))}
        </ul>
      </section>
    </main>
  );
}
