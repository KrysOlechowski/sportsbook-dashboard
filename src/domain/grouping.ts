import type { Event, EventId } from "@/domain/types";

export type EventGroup = {
  id: string;
  sportName: string;
  countryName: string;
  leagueName: string;
  eventIds: EventId[];
};

export const groupEventIdsByLeagueCategory = (
  eventIds: EventId[],
  eventsById: Record<EventId, Event>,
): EventGroup[] => {
  const groupsById: Record<string, EventGroup> = {};
  const orderedGroupIds: string[] = [];

  for (const eventId of eventIds) {
    const event = eventsById[eventId];
    if (!event) {
      continue;
    }

    const groupId = `${event.category1Name}::${event.category2Name}::${event.category3Name}`;
    if (!groupsById[groupId]) {
      groupsById[groupId] = {
        id: groupId,
        sportName: event.category1Name,
        countryName: event.category2Name,
        leagueName: event.category3Name,
        eventIds: [],
      };
      orderedGroupIds.push(groupId);
    }

    groupsById[groupId].eventIds.push(eventId);
  }

  return orderedGroupIds.map((groupId) => groupsById[groupId]);
};
