"use client";

import { useEffect, useMemo, useState } from "react";

import { groupEventIdsByLeagueCategory } from "@/domain/grouping";
import type { DomainSnapshot } from "@/domain/types";
import { useSportsbookStore } from "@/store/sportsbook.store";
import { getMobileBetSlipToggleLabel } from "@/ui/betslip-mobile";
import { BetSlip } from "@/ui/components/betslip";
import { EventRow } from "@/ui/components/event-row";
import { useLiveOddsTicker } from "@/ui/use-live-odds-ticker";

type SportsbookDashboardProps = {
  initialSnapshot: DomainSnapshot;
};

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
                aria-label="Close Bet Slip"
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
