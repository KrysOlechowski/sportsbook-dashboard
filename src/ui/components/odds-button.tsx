"use client";

import { memo, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { isValidOdds } from "@/domain/odds";
import type { EventId, OutcomeId } from "@/domain/types";
import { useSportsbookStore } from "@/store/sportsbook.store";
import { formatOdds, getOneXTwoLabel } from "@/ui/formatters";

type OddsButtonProps = {
  eventId: EventId;
  outcomeId: OutcomeId;
};

export const OddsButton = memo(function OddsButton({
  eventId,
  outcomeId,
}: OddsButtonProps) {
  const {
    outcome,
    odds,
    pulse,
    locked,
    selectedOutcomeId,
    toggleOutcome,
    clearOutcomePulse,
  } = useSportsbookStore(
    useShallow((state) => ({
      outcome: state.outcomesById[outcomeId],
      odds: state.oddsByOutcomeId[outcomeId],
      pulse: state.pulseByOutcomeId[outcomeId],
      locked: state.lockedByOutcomeId[outcomeId],
      selectedOutcomeId: state.selectionByEventId[eventId]?.outcomeId ?? null,
      toggleOutcome: state.toggleOutcome,
      clearOutcomePulse: state.clearOutcomePulse,
    })),
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

  const label = getOneXTwoLabel(outcome.position, outcome.name);
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
