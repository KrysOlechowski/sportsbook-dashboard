import { useEffect } from "react";

import {
  buildRandomOddsUpdates,
  getRandomIntervalMs,
  getRandomLockDurationMs,
} from "@/domain/odds";
import { useSportsbookStore } from "@/store/sportsbook.store";

export const useLiveOddsTicker = (): void => {
  const applyOddsUpdates = useSportsbookStore((state) => state.applyOddsUpdates);
  const setOutcomeLock = useSportsbookStore((state) => state.setOutcomeLock);

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
};
