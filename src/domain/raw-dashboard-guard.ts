import type { RawDashboardEvent } from "@/domain/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const isRawDashboardOutcome = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isFiniteNumber(value.outcomeId) &&
    isString(value.outcomeName) &&
    isFiniteNumber(value.outcomeOdds) &&
    isFiniteNumber(value.outcomePosition)
  );
};

const isRawDashboardGame = (value: unknown): boolean => {
  if (!isRecord(value) || !Array.isArray(value.outcomes)) {
    return false;
  }

  return (
    isFiniteNumber(value.gameId) &&
    isString(value.gameName) &&
    isFiniteNumber(value.gameType) &&
    value.outcomes.every(isRawDashboardOutcome)
  );
};

const isRawDashboardEvent = (value: unknown): value is RawDashboardEvent => {
  if (!isRecord(value) || !Array.isArray(value.eventGames)) {
    return false;
  }

  return (
    isFiniteNumber(value.eventId) &&
    isString(value.eventName) &&
    isFiniteNumber(value.eventStart) &&
    isFiniteNumber(value.eventType) &&
    isFiniteNumber(value.category1Id) &&
    isFiniteNumber(value.category2Id) &&
    isFiniteNumber(value.category3Id) &&
    isString(value.category1Name) &&
    isString(value.category2Name) &&
    isString(value.category3Name) &&
    isFiniteNumber(value.gamesCount) &&
    isBoolean(value.isCustomBetAvailable) &&
    value.eventGames.every(isRawDashboardGame)
  );
};

export const parseRawDashboardEvents = (
  value: unknown,
): RawDashboardEvent[] => {
  if (!Array.isArray(value)) {
    throw new Error("Invalid dashboard payload: expected an array of events.");
  }

  for (let index = 0; index < value.length; index += 1) {
    if (!isRawDashboardEvent(value[index])) {
      throw new Error(
        `Invalid dashboard payload: event at index ${index} has unexpected shape.`,
      );
    }
  }

  return value;
};
