import {
  buildRandomOddsUpdates,
  clampMinOdds,
  computeNextOdds,
  getRandomIntervalMs,
  getRandomLockDurationMs,
  getRandomMultiplier,
  MAX_LOCK_DURATION_MS,
  MAX_LIVE_TICK_INTERVAL_MS,
  MIN_LOCK_DURATION_MS,
  MIN_LIVE_MULTIPLIER,
  MIN_LIVE_TICK_INTERVAL_MS,
  MIN_ODDS,
  roundOdds,
} from "@/domain/odds";

describe("domain odds helpers", () => {
  it("returns random interval within 10-15 seconds", () => {
    expect(getRandomIntervalMs(() => 0)).toBe(MIN_LIVE_TICK_INTERVAL_MS);
    expect(getRandomIntervalMs(() => 0.999999)).toBe(MAX_LIVE_TICK_INTERVAL_MS);
  });

  it("returns lock duration within 300-800 ms", () => {
    expect(getRandomLockDurationMs(() => 0)).toBe(MIN_LOCK_DURATION_MS);
    expect(getRandomLockDurationMs(() => 0.999999)).toBe(MAX_LOCK_DURATION_MS);
  });

  it("rounds odds to 2 decimals", () => {
    expect(roundOdds(2.005)).toBe(2.01);
    expect(roundOdds(3.554)).toBe(3.55);
    expect(roundOdds(3.555)).toBe(3.56);
  });

  it("clamps odds to min 1.01", () => {
    expect(clampMinOdds(0.99)).toBe(MIN_ODDS);
    expect(clampMinOdds(1.8)).toBe(1.8);
  });

  it("keeps multiplier in 0.9..1.1", () => {
    expect(getRandomMultiplier(() => 0)).toBe(MIN_LIVE_MULTIPLIER);
    expect(getRandomMultiplier(() => 1)).toBe(1.1);
  });

  it("updates subset with rounded and clamped odds", () => {
    const updates = buildRandomOddsUpdates(
      {
        a: 1.2,
        b: 2.0,
        c: 3.0,
        d: 4.0,
      },
      () => 0,
    );

    expect(updates.length).toBeGreaterThanOrEqual(1);
    expect(updates.length).toBeLessThanOrEqual(4);

    for (const update of updates) {
      expect(update.odds).toBeGreaterThanOrEqual(MIN_ODDS);
      expect(Number.isInteger(update.odds * 100)).toBe(true);
    }
  });

  it("computes next odds using multiplier then round and clamp", () => {
    expect(computeNextOdds(2, () => 0)).toBe(1.8);
    expect(computeNextOdds(1, () => 0)).toBe(1.01);
  });
});
