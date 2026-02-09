"use client";

import { memo, useEffect, useMemo, useState } from "react";

import { isValidOdds } from "@/domain/odds";
import { groupEventIdsByLeagueCategory } from "@/domain/grouping";
import type { DomainSnapshot, EventId, OutcomeId } from "@/domain/types";
import { getMobileBetSlipToggleLabel } from "@/ui/betslip-mobile";
import { useLiveOddsTicker } from "@/ui/use-live-odds-ticker";
import {
  type BetSelection,
  selectHasOddsChanges,
  selectPotentialWin,
  selectTotalOdds,
  UI_MARKET_NAME,
  type SportsbookStore,
  useSportsbookStore,
} from "@/store/sportsbook.store";
import {
  formatStakeInputValue,
  isStakeInputValueValid,
  normalizeStakeInputValue,
  parseStakeInputValue,
} from "@/ui/stake-input";

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

const OddsButton = memo(function OddsButton({
  eventId,
  outcomeId,
}: {
  eventId: EventId;
  outcomeId: OutcomeId;
}) {
  const outcome = useSportsbookStore((state) => state.outcomesById[outcomeId]);
  const odds = useSportsbookStore((state) => state.oddsByOutcomeId[outcomeId]);
  const pulse = useSportsbookStore(
    (state) => state.pulseByOutcomeId[outcomeId],
  );
  const locked = useSportsbookStore(
    (state) => state.lockedByOutcomeId[outcomeId],
  );
  const selectedOutcomeId = useSportsbookStore(
    (state) => state.selectionByEventId[eventId]?.outcomeId ?? null,
  );
  const toggleOutcome = useSportsbookStore((state) => state.toggleOutcome);
  const clearOutcomePulse = useSportsbookStore(
    (state) => state.clearOutcomePulse,
  );

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

  if (!outcome) {
    return null;
  }

  const label = ONE_X_TWO_LABELS[outcome.position] ?? outcome.name;
  const isSelected = selectedOutcomeId === outcomeId;
  const hasUpPulse = pulse === "up";
  const hasDownPulse = pulse === "down";
  const isOddsAvailable = isValidOdds(odds);
  const isDisabled = Boolean(locked) || !isOddsAvailable;
  if (process.env.NEXT_PUBLIC_RENDER_DEBUG === "1") {
    // Optional proof for Level 4: only touched outcome buttons should re-render on ticks.
    console.count(`render:odds-button:${outcomeId}`);
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => toggleOutcome(eventId, outcomeId)}
      aria-pressed={isSelected}
      title={
        locked
          ? "Updating odds..."
          : isOddsAvailable
            ? outcome.name
            : "Odds unavailable"
      }
      className={`flex min-w-20 items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-300 ${
        locked
          ? "cursor-not-allowed border-zinc-300 bg-zinc-100 text-zinc-500"
          : !isOddsAvailable
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
      <span>{locked ? "..." : isOddsAvailable ? formatOdds(odds) : "N/A"}</span>
    </button>
  );
});

const BetSlipItem = memo(function BetSlipItem({
  selection,
  isReplaced,
}: {
  selection: BetSelection;
  isReplaced: boolean;
}) {
  const event = useSportsbookStore((state) => state.eventsById[selection.eventId]);
  const outcome = useSportsbookStore(
    (state) => state.outcomesById[selection.outcomeId],
  );
  const currentOdds = useSportsbookStore(
    (state) => state.oddsByOutcomeId[selection.outcomeId],
  );
  const removeSelection = useSportsbookStore((state) => state.removeSelection);

  if (!event || !outcome) {
    return null;
  }

  const selectedOddsSnapshot = selection.selectedOddsSnapshot;
  const isCurrentOddsAvailable = isValidOdds(currentOdds);
  const isOddsChanged =
    !isCurrentOddsAvailable || currentOdds !== selectedOddsSnapshot;

  return (
    <li
      className={`rounded-lg border p-3 transition-colors duration-300 ${
        isReplaced ? "border-amber-400 bg-amber-100" : "border-zinc-200 bg-zinc-50"
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
        Current: {isCurrentOddsAvailable ? formatOdds(currentOdds) : "N/A"}
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        Snapshot: {formatOdds(selectedOddsSnapshot)}
      </p>
      {isOddsChanged ? (
        <p className="mt-2 inline-flex rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
          {isCurrentOddsAvailable ? "Odds changed" : "Odds unavailable"}
        </p>
      ) : null}
    </li>
  );
});

function BetSlip() {
  const selectionByEventId = useSportsbookStore(
    (state) => state.selectionByEventId,
  );
  const lastReplacedEventId = useSportsbookStore(
    (state) => state.lastReplacedEventId,
  );
  const clearLastReplacedEventId = useSportsbookStore(
    (state) => state.clearLastReplacedEventId,
  );
  const clearSelections = useSportsbookStore((state) => state.clearSelections);
  const stake = useSportsbookStore((state) => state.stake);
  const setStake = useSportsbookStore((state) => state.setStake);
  const totalOdds = useSportsbookStore(selectTotalOdds);
  const potentialWin = useSportsbookStore(selectPotentialWin);
  const hasOddsChanges = useSportsbookStore(selectHasOddsChanges);
  const acceptAllChanges = useSportsbookStore(
    (state) => state.acceptAllChanges,
  );
  const [betPlacedMessage, setBetPlacedMessage] = useState<string | null>(null);
  const [stakeInputValue, setStakeInputValue] = useState<string>(() =>
    formatStakeInputValue(stake),
  );

  const selections = Object.values(selectionByEventId);
  const canPlaceBet =
    !hasOddsChanges &&
    selections.length > 0 &&
    Number.isFinite(stake) &&
    stake > 0;

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

  useEffect(() => {
    if (!betPlacedMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBetPlacedMessage(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [betPlacedMessage]);

  useEffect(() => {
    setStakeInputValue(formatStakeInputValue(stake));
  }, [stake]);

  const handlePlaceBet = () => {
    if (!canPlaceBet) {
      return;
    }

    clearSelections();
    setBetPlacedMessage("Bet placed successfully.");
  };

  const handleStakeInputChange = (value: string) => {
    const normalizedValue = normalizeStakeInputValue(value);
    if (!isStakeInputValueValid(normalizedValue)) {
      return;
    }

    setStakeInputValue(normalizedValue);
    const parsedValue = parseStakeInputValue(normalizedValue);
    if (parsedValue !== null) {
      setStake(parsedValue);
    }
  };

  const handleStakeInputBlur = () => {
    setStakeInputValue(formatStakeInputValue(stake));
  };

  return (
    <aside className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:w-96">
      <h2 className="text-lg font-semibold text-zinc-900">Bet Slip</h2>
      {betPlacedMessage ? (
        <p
          aria-live="polite"
          className="pointer-events-none fixed top-4 right-4 z-50 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 shadow-sm lg:px-[18px] lg:py-3 lg:text-lg"
        >
          {betPlacedMessage}
        </p>
      ) : null}

      <div className="mt-3">
        <label
          htmlFor="stake-input"
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
        >
          Stake
        </label>
        <input
          id="stake-input"
          type="text"
          autoComplete="off"
          inputMode="decimal"
          placeholder="0.00"
          value={stakeInputValue}
          onChange={(event) => handleStakeInputChange(event.target.value)}
          onBlur={handleStakeInputBlur}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
        />
      </div>

      {selections.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No selections yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {selections.map((selection) => {
            const isReplaced = selection.eventId === lastReplacedEventId;

            return (
              <BetSlipItem
                key={selection.eventId}
                selection={selection}
                isReplaced={isReplaced}
              />
            );
          })}
        </ul>
      )}

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-600">Total Odds</span>
          <span className="font-semibold text-zinc-900">
            {formatOdds(totalOdds)}
          </span>
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
          disabled={!canPlaceBet}
          onClick={handlePlaceBet}
          className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
            !canPlaceBet
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

const EventRow = memo(function EventRow({ eventId }: { eventId: EventId }) {
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

export function SportsbookDashboard({
  initialSnapshot,
}: SportsbookDashboardProps) {
  const initializeSnapshot = useSportsbookStore(
    (state) => state.initializeSnapshot,
  );
  const eventIds = useSportsbookStore((state) => state.eventIds);
  const eventsById = useSportsbookStore((state) => state.eventsById);
  const selectionCount = useSportsbookStore(
    (state) => Object.keys(state.selectionByEventId).length,
  );
  const eventGroups = useMemo(() => {
    return groupEventIdsByLeagueCategory(eventIds, eventsById);
  }, [eventIds, eventsById]);
  const [isMobileBetSlipOpen, setIsMobileBetSlipOpen] = useState(false);

  useEffect(() => {
    initializeSnapshot(initialSnapshot);
  }, [initialSnapshot, initializeSnapshot]);
  useLiveOddsTicker();

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
          <div className="hidden lg:block">
            <BetSlip />
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setIsMobileBetSlipOpen(true)}
        className="fixed right-4 bottom-4 z-30 rounded-full bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-lg lg:hidden"
      >
        {getMobileBetSlipToggleLabel(selectionCount)}
      </button>

      {isMobileBetSlipOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close Bet Slip overlay"
            onClick={() => setIsMobileBetSlipOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMobileBetSlipOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 bg-white text-sm font-semibold text-zinc-700"
              >
                X
              </button>
            </div>
            <BetSlip />
          </div>
        </div>
      ) : null}
    </main>
  );
}
