"use client";

import { memo, useEffect, useState } from "react";

import { isValidOdds } from "@/domain/odds";
import { type BetSelection, useSportsbookStore } from "@/store/sportsbook.store";
import {
  selectHasOddsChanges,
  selectPotentialWin,
  selectTotalOdds,
} from "@/store/sportsbook.selectors";
import { formatOdds } from "@/ui/formatters";
import {
  formatStakeInputValue,
  isStakeInputValueValid,
  normalizeStakeInputValue,
  parseStakeInputValue,
} from "@/ui/stake-input";

const BET_PLACED_MESSAGE = "Bet placed successfully.";

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

const BetPlacedToast = ({ message }: { message: string | null }) => {
  if (!message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 z-50 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 shadow-sm lg:px-4.5 lg:py-3 lg:text-lg"
    >
      {message}
    </p>
  );
};

const BetSlipSummary = ({
  totalOdds,
  potentialWin,
}: {
  totalOdds: number;
  potentialWin: number;
}) => (
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
);

const BetSlipActions = ({
  hasOddsChanges,
  canPlaceBet,
  onAcceptAllChanges,
  onPlaceBet,
}: {
  hasOddsChanges: boolean;
  canPlaceBet: boolean;
  onAcceptAllChanges: () => void;
  onPlaceBet: () => void;
}) => (
  <div className="mt-3 flex flex-col gap-2">
    {hasOddsChanges ? (
      <button
        type="button"
        onClick={onAcceptAllChanges}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:border-zinc-400"
      >
        Accept all changes
      </button>
    ) : null}
    <button
      type="button"
      disabled={!canPlaceBet}
      onClick={onPlaceBet}
      className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
        !canPlaceBet
          ? "cursor-not-allowed bg-zinc-300 text-zinc-600"
          : "bg-zinc-900 text-white hover:bg-zinc-800"
      }`}
    >
      Place Bet
    </button>
  </div>
);

const useTimedMessage = (durationMs: number) => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage(null);
    }, durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [durationMs, message]);

  return {
    message,
    setMessage,
  };
};

const useStakeInput = (stake: number, setStake: (value: number) => void) => {
  const [stakeInputValue, setStakeInputValue] = useState<string>(() =>
    formatStakeInputValue(stake),
  );

  useEffect(() => {
    setStakeInputValue(formatStakeInputValue(stake));
  }, [stake]);

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

  return {
    stakeInputValue,
    handleStakeInputChange,
    handleStakeInputBlur,
  };
};

export const BetSlip = memo(function BetSlip() {
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
  const { message: betPlacedMessage, setMessage: setBetPlacedMessage } =
    useTimedMessage(2800);
  const { stakeInputValue, handleStakeInputBlur, handleStakeInputChange } =
    useStakeInput(stake, setStake);

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

  const handlePlaceBet = () => {
    if (!canPlaceBet) {
      return;
    }

    clearSelections();
    setBetPlacedMessage(BET_PLACED_MESSAGE);
  };

  return (
    <aside className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:w-96">
      <h2 className="text-lg font-semibold text-zinc-900">Bet Slip</h2>
      <BetPlacedToast message={betPlacedMessage} />

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
          {selections.map((selection) => (
            <BetSlipItem
              key={selection.eventId}
              selection={selection}
              isReplaced={selection.eventId === lastReplacedEventId}
            />
          ))}
        </ul>
      )}

      <BetSlipSummary totalOdds={totalOdds} potentialWin={potentialWin} />
      <BetSlipActions
        hasOddsChanges={hasOddsChanges}
        canPlaceBet={canPlaceBet}
        onAcceptAllChanges={acceptAllChanges}
        onPlaceBet={handlePlaceBet}
      />
    </aside>
  );
});
