"use client";

import { useEffect, useMemo } from "react";

import {
  buildRandomOddsUpdates,
  getRandomIntervalMs,
  getRandomLockDurationMs,
} from "@/domain/odds";
import { groupEventIdsByLeagueCategory } from "@/domain/grouping";
import type { DomainSnapshot, EventId, OutcomeId } from "@/domain/types";
import {
  selectHasOddsChanges,
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
  const pulse = useSportsbookStore((state) => state.pulseByOutcomeId[outcomeId]);
  const locked = useSportsbookStore((state) => state.lockedByOutcomeId[outcomeId]);
  const selectedOutcomeId = useSportsbookStore(
    (state) => state.selectionByEventId[eventId]?.outcomeId ?? null,
  );
  const toggleOutcome = useSportsbookStore((state) => state.toggleOutcome);
  const clearOutcomePulse = useSportsbookStore((state) => state.clearOutcomePulse);

  useEffect(() => {
    if (!pulse) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearOutcomePulse(outcomeId);
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pulse, outcomeId, clearOutcomePulse]);

  if (!outcome || typeof odds !== "number") {
    return null;
  }

  const label = ONE_X_TWO_LABELS[outcome.position] ?? outcome.name;
  const isSelected = selectedOutcomeId === outcomeId;
  const hasUpPulse = pulse === "up";
  const hasDownPulse = pulse === "down";

  return (
    <button
      type="button"
      disabled={Boolean(locked)}
      onClick={() => toggleOutcome(eventId, outcomeId)}
      aria-pressed={isSelected}
      title={locked ? "Updating odds..." : outcome.name}
      className={`flex min-w-20 items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-300 ${
        locked
          ? "cursor-not-allowed border-zinc-300 bg-zinc-100 text-zinc-500"
          : hasUpPulse
          ? "border-emerald-500 bg-emerald-100 text-emerald-900"
          : hasDownPulse
            ? "border-rose-500 bg-rose-100 text-rose-900"
            : isSelected
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400"
      }`}
    >
      <span>{label}</span>
      <span>{locked ? "..." : formatOdds(odds)}</span>
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
  const hasOddsChanges = useSportsbookStore(selectHasOddsChanges);
  const acceptAllChanges = useSportsbookStore((state) => state.acceptAllChanges);

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
            const selectedOddsSnapshot = selection.selectedOddsSnapshot;
            const isReplaced = selection.eventId === lastReplacedEventId;
            const isOddsChanged = currentOdds !== selectedOddsSnapshot;

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
                  Current: {formatOdds(currentOdds)}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Snapshot: {formatOdds(selectedOddsSnapshot)}
                </p>
                {isOddsChanged ? (
                  <p className="mt-2 inline-flex rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                    Odds changed
                  </p>
                ) : null}
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

      <div className="mt-3 flex flex-col gap-2">
        {hasOddsChanges ? (
          <button
            type="button"
            onClick={acceptAllChanges}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:border-zinc-400"
          >
            Accept all changes
          </button>
        ) : null}
        <button
          type="button"
          disabled={hasOddsChanges || selections.length === 0}
          className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
            hasOddsChanges || selections.length === 0
              ? "cursor-not-allowed bg-zinc-300 text-zinc-600"
              : "bg-zinc-900 text-white hover:bg-zinc-800"
          }`}
        >
          Place Bet
        </button>
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
  const eventsById = useSportsbookStore((state) => state.eventsById);
  const applyOddsUpdates = useSportsbookStore((state) => state.applyOddsUpdates);
  const setOutcomeLock = useSportsbookStore((state) => state.setOutcomeLock);
  const eventGroups = useMemo(() => {
    return groupEventIdsByLeagueCategory(eventIds, eventsById);
  }, [eventIds, eventsById]);

  useEffect(() => {
    initializeSnapshot(initialSnapshot);
  }, [initialSnapshot, initializeSnapshot]);

  useEffect(() => {
    const activeTimeoutIds: number[] = [];
    let isActive = true;

    const scheduleNextTick = () => {
      const intervalMs = getRandomIntervalMs();

      const tickTimeoutId = window.setTimeout(() => {
        if (!isActive) {
          return;
        }

        const { oddsByOutcomeId } = useSportsbookStore.getState();
        const updates = buildRandomOddsUpdates(oddsByOutcomeId);
        const lockDurationMs = getRandomLockDurationMs();

        for (const update of updates) {
          setOutcomeLock(update.outcomeId, true);
        }

        const applyTimeoutId = window.setTimeout(() => {
          if (!isActive) {
            return;
          }
          applyOddsUpdates(updates);
        }, lockDurationMs);
        activeTimeoutIds.push(applyTimeoutId);

        scheduleNextTick();
      }, intervalMs);
      activeTimeoutIds.push(tickTimeoutId);
    };

    scheduleNextTick();

    return () => {
      isActive = false;
      for (const timeoutId of activeTimeoutIds) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [applyOddsUpdates, setOutcomeLock]);

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
          <div className="flex flex-1 flex-col gap-5">
            {eventGroups.map((group) => (
              <section key={group.id}>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-600">
                  {group.sportName} • {group.countryName} • {group.leagueName}
                </h2>
                <ul className="flex flex-col gap-3">
                  {group.eventIds.map((eventId) => (
                    <EventRow key={eventId} eventId={eventId} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <BetSlip />
        </div>
      </section>
    </main>
  );
}
