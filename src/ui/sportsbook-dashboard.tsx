"use client";

import { useEffect } from "react";

import type { DomainSnapshot, EventId, OutcomeId } from "@/domain/types";
import {
  selectPotentialWin,
  selectTotalOdds,
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

function OddsButton({
  eventId,
  outcomeId,
}: {
  eventId: EventId;
  outcomeId: OutcomeId;
}) {
  const outcome = useSportsbookStore((state) => state.outcomesById[outcomeId]);
  const odds = useSportsbookStore((state) => state.oddsByOutcomeId[outcomeId]);
  const selectedOutcomeId = useSportsbookStore(
    (state) => state.selectionByEventId[eventId]?.outcomeId ?? null,
  );
  const toggleOutcome = useSportsbookStore((state) => state.toggleOutcome);

  if (!outcome || typeof odds !== "number") {
    return null;
  }

  const label = ONE_X_TWO_LABELS[outcome.position] ?? outcome.name;
  const isSelected = selectedOutcomeId === outcomeId;

  return (
    <button
      type="button"
      onClick={() => toggleOutcome(eventId, outcomeId)}
      aria-pressed={isSelected}
      title={outcome.name}
      className={`flex min-w-20 items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
        isSelected
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400"
      }`}
    >
      <span>{label}</span>
      <span>{formatOdds(odds)}</span>
    </button>
  );
}

function BetSlip() {
  const selectionByEventId = useSportsbookStore((state) => state.selectionByEventId);
  const eventsById = useSportsbookStore((state) => state.eventsById);
  const outcomesById = useSportsbookStore((state) => state.outcomesById);
  const oddsByOutcomeId = useSportsbookStore((state) => state.oddsByOutcomeId);
  const lastReplacedEventId = useSportsbookStore((state) => state.lastReplacedEventId);
  const clearLastReplacedEventId = useSportsbookStore(
    (state) => state.clearLastReplacedEventId,
  );
  const removeSelection = useSportsbookStore((state) => state.removeSelection);
  const stake = useSportsbookStore((state) => state.stake);
  const setStake = useSportsbookStore((state) => state.setStake);
  const totalOdds = useSportsbookStore(selectTotalOdds);
  const potentialWin = useSportsbookStore(selectPotentialWin);

  const selections = Object.values(selectionByEventId);

  useEffect(() => {
    if (!lastReplacedEventId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearLastReplacedEventId();
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [lastReplacedEventId, clearLastReplacedEventId]);

  return (
    <aside className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:w-96">
      <h2 className="text-lg font-semibold text-zinc-900">Bet Slip</h2>

      <div className="mt-3">
        <label
          htmlFor="stake-input"
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
        >
          Stake
        </label>
        <input
          id="stake-input"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={Number.isFinite(stake) ? stake : 0}
          onChange={(event) => setStake(Number(event.target.value))}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
        />
      </div>

      {selections.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No selections yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {selections.map((selection) => {
            const event = eventsById[selection.eventId];
            const outcome = outcomesById[selection.outcomeId];
            const currentOdds = oddsByOutcomeId[selection.outcomeId];
            const isReplaced = selection.eventId === lastReplacedEventId;

            if (!event || !outcome || typeof currentOdds !== "number") {
              return null;
            }

            return (
              <li
                key={selection.eventId}
                className={`rounded-lg border p-3 transition-colors duration-300 ${
                  isReplaced
                    ? "border-amber-400 bg-amber-100"
                    : "border-zinc-200 bg-zinc-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-zinc-900">{event.name}</p>
                  <button
                    type="button"
                    aria-label={`Remove ${event.name} selection`}
                    onClick={() => removeSelection(selection.eventId)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-semibold text-zinc-700 hover:border-zinc-400"
                  >
                    X
                  </button>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{outcome.name}</p>
                <p className="mt-1 text-sm font-medium text-zinc-800">
                  Odds: {formatOdds(currentOdds)}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-600">Total Odds</span>
          <span className="font-semibold text-zinc-900">{formatOdds(totalOdds)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-zinc-600">Potential Win</span>
          <span className="font-semibold text-zinc-900">
            {formatOdds(potentialWin)}
          </span>
        </div>
      </div>
    </aside>
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
            <OddsButton key={outcomeId} eventId={eventId} outcomeId={outcomeId} />
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
      <section className="mx-auto w-full max-w-6xl">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Live Sportsbook Dashboard
          </h1>
          <p className="text-sm text-zinc-600">
            Events list with 1x2 markets from local snapshot data
          </p>
        </header>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
          <ul className="flex flex-1 flex-col gap-3">
            {eventIds.map((eventId) => (
              <EventRow key={eventId} eventId={eventId} />
            ))}
          </ul>
          <BetSlip />
        </div>
      </section>
    </main>
  );
}
