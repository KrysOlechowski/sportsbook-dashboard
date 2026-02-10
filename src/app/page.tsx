import rawDashboardEvents from "@/data/betting_dashboard_data.json";
import { mapRawDashboardEventsToDomainSnapshot } from "@/domain/mapping";
import { parseRawDashboardEvents } from "@/domain/raw-dashboard-guard";
import { SportsbookDashboard } from "@/ui/sportsbook-dashboard";

const snapshot = mapRawDashboardEventsToDomainSnapshot(
  parseRawDashboardEvents(rawDashboardEvents),
);

export default function Home() {
  return <SportsbookDashboard initialSnapshot={snapshot} />;
}
