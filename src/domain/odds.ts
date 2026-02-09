import type { OutcomeId } from "@/domain/types";

export const MIN_LIVE_TICK_INTERVAL_MS = 10_000;
export const MAX_LIVE_TICK_INTERVAL_MS = 15_000;
export const MIN_LIVE_MULTIPLIER = 0.9;
export const MAX_LIVE_MULTIPLIER = 1.1;
export const MIN_ODDS = 1.01;
export const MIN_LOCK_DURATION_MS = 300;
export const MAX_LOCK_DURATION_MS = 800;

type RandomFn = () => number;

export type OddsUpdateInput = Record<OutcomeId, number>;

export type OddsUpdate = {
  outcomeId: OutcomeId;
  odds: number;
};

export const getRandomIntervalMs = (random: RandomFn = Math.random): number => {
  const range = MAX_LIVE_TICK_INTERVAL_MS - MIN_LIVE_TICK_INTERVAL_MS + 1;
  return MIN_LIVE_TICK_INTERVAL_MS + Math.floor(random() * range);
};

export const getRandomMultiplier = (random: RandomFn = Math.random): number => {
  const range = MAX_LIVE_MULTIPLIER - MIN_LIVE_MULTIPLIER;
  return MIN_LIVE_MULTIPLIER + random() * range;
};

export const getRandomLockDurationMs = (
  random: RandomFn = Math.random,
): number => {
  const range = MAX_LOCK_DURATION_MS - MIN_LOCK_DURATION_MS + 1;
  return MIN_LOCK_DURATION_MS + Math.floor(random() * range);
};

export const roundOdds = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const clampMinOdds = (value: number): number => {
  return Math.max(MIN_ODDS, value);
};

export const computeNextOdds = (
  currentOdds: number,
  random: RandomFn = Math.random,
): number => {
  const withMultiplier = currentOdds * getRandomMultiplier(random);
  const rounded = roundOdds(withMultiplier);
  return clampMinOdds(rounded);
};

export const isValidOdds = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value) && value >= MIN_ODDS;
};

export const buildRandomOddsUpdates = (
  oddsByOutcomeId: OddsUpdateInput,
  random: RandomFn = Math.random,
): OddsUpdate[] => {
  const outcomeIds = Object.keys(oddsByOutcomeId) as OutcomeId[];
  if (outcomeIds.length === 0) {
    return [];
  }

  const shuffled = [...outcomeIds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  const subsetSize = Math.max(1, Math.ceil(shuffled.length * 0.25));
  return shuffled.slice(0, subsetSize).map((outcomeId) => ({
    outcomeId,
    odds: computeNextOdds(oddsByOutcomeId[outcomeId], random),
  }));
};
