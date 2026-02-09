import rawDashboardEvents from "@/data/betting_dashboard_data.json";
import { mapRawDashboardEventsToDomainSnapshot } from "@/domain/mapping";
import type { RawDashboardEvent } from "@/domain/types";
import { SportsbookDashboard } from "@/ui/sportsbook-dashboard";

const snapshot = mapRawDashboardEventsToDomainSnapshot(
  rawDashboardEvents as RawDashboardEvent[],
);

export default function Home() {
  return <SportsbookDashboard initialSnapshot={snapshot} />;
}
