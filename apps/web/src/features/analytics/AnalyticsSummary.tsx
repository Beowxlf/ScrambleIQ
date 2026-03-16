import type { MatchAnalyticsSummary } from '@scrambleiq/shared';

interface AnalyticsSummaryProps {
  analytics: MatchAnalyticsSummary;
}

export function AnalyticsSummary({ analytics }: AnalyticsSummaryProps) {
  if (analytics.totalEventCount === 0 && analytics.totalPositionCount === 0) {
    return <p>Not enough annotation data yet. Add events or position states to generate analytics.</p>;
  }

  return (
    <>
      <p>Total events: {analytics.totalEventCount}</p>
      <p>Total positions: {analytics.totalPositionCount}</p>
      <p>Total tracked position time (seconds): {analytics.totalTrackedPositionTimeSeconds}</p>

      <h3>Event counts by type</h3>
      {Object.keys(analytics.eventCountsByType).length === 0 ? (
        <p>No event counts available.</p>
      ) : (
        <ul>
          {Object.entries(analytics.eventCountsByType).map(([eventType, count]) => (
            <li key={eventType}>
              {eventType}: {count}
            </li>
          ))}
        </ul>
      )}

      <h3>Time in each position (seconds)</h3>
      <ul>
        {Object.entries(analytics.timeInPositionByTypeSeconds).map(([positionType, seconds]) => (
          <li key={positionType}>
            {positionType}: {seconds}
          </li>
        ))}
      </ul>

      <h3>Top-time by competitor and position (seconds)</h3>
      {(['A', 'B'] as const).map((competitor) => (
        <div key={competitor}>
          <h4>Competitor {competitor}</h4>
          <ul>
            {Object.entries(analytics.competitorTopTimeByPositionSeconds[competitor]).map(([positionType, seconds]) => (
              <li key={`${competitor}-${positionType}`}>
                {positionType}: {seconds}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
