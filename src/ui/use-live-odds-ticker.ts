import { useEffect } from "react";

import {
  buildRandomOddsUpdates,
  getRandomIntervalMs,
  getRandomLockDurationMs,
} from "@/domain/odds";
import { useSportsbookStore } from "@/store/sportsbook.store";

export const useLiveOddsTicker = (): void => {
  const applyOddsUpdates = useSportsbookStore((state) => state.applyOddsUpdates);
  const setOutcomeLocks = useSportsbookStore((state) => state.setOutcomeLocks);

  useEffect(() => {
    const activeTimeoutIds = new Set<number>();
    let isActive = true;
    const scheduleTimeout = (callback: () => void, delayMs: number): void => {
      let timeoutId = 0;
      timeoutId = window.setTimeout(() => {
        activeTimeoutIds.delete(timeoutId);
        callback();
      }, delayMs);
      activeTimeoutIds.add(timeoutId);
    };

    const scheduleNextTick = () => {
      const intervalMs = getRandomIntervalMs();

      scheduleTimeout(() => {
        if (!isActive) {
          return;
        }

        const { oddsByOutcomeId } = useSportsbookStore.getState();
        const updates = buildRandomOddsUpdates(oddsByOutcomeId);
        const lockDurationMs = getRandomLockDurationMs();
        const outcomeIds = updates.map((update) => update.outcomeId);

        // Lock outcomes briefly to simulate market suspension before odds refresh.
        setOutcomeLocks(outcomeIds, true);

        scheduleTimeout(() => {
          if (!isActive) {
            return;
          }
          applyOddsUpdates(updates);
        }, lockDurationMs);

        scheduleNextTick();
      }, intervalMs);
    };

    scheduleNextTick();

    return () => {
      isActive = false;
      for (const timeoutId of activeTimeoutIds.values()) {
        window.clearTimeout(timeoutId);
      }
      activeTimeoutIds.clear();
    };
  }, [applyOddsUpdates, setOutcomeLocks]);
};
