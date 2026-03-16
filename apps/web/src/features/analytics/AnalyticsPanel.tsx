import type { MatchesApi } from '../../matches-api';
import { AnalyticsSummary } from './AnalyticsSummary';
import { useMatchAnalytics } from './useMatchAnalytics';

interface AnalyticsPanelProps {
  api: MatchesApi;
  matchId: string;
  refreshTrigger: number;
}

export function AnalyticsPanel({ api, matchId, refreshTrigger }: AnalyticsPanelProps) {
  const { analytics, analyticsError, isLoadingAnalytics } = useMatchAnalytics({ api, matchId, refreshTrigger });

  return (
    <section aria-labelledby="analytics-summary-heading">
      <h2 id="analytics-summary-heading">Analytics Summary</h2>

      {isLoadingAnalytics ? <p>Loading analytics summary...</p> : null}
      {analyticsError ? <p>{analyticsError}</p> : null}

      {!isLoadingAnalytics && !analyticsError && analytics ? <AnalyticsSummary analytics={analytics} /> : null}
    </section>
  );
}
