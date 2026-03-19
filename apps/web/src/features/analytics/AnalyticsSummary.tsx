import type { MatchAnalyticsSummary, PositionType } from '@scrambleiq/shared';

interface AnalyticsSummaryProps {
  analytics: MatchAnalyticsSummary;
}

function formatPositionLabel(positionType: PositionType): string {
  return positionType.replaceAll('_', ' ');
}

export function AnalyticsSummary({ analytics }: AnalyticsSummaryProps) {
  if (analytics.totalEventCount === 0 && analytics.totalPositionCount === 0) {
    return <p>Not enough annotation data yet. Add events or position states to generate analytics.</p>;
  }

  const positionEntries = Object.entries(analytics.timeInPositionByTypeSeconds).filter(([, seconds]) => seconds > 0);
  const eventEntries = Object.entries(analytics.eventCountsByType).sort(([, countA], [, countB]) => countB - countA);

  const averageEventsPerMinute =
    analytics.totalTrackedPositionTimeSeconds > 0
      ? (analytics.totalEventCount / (analytics.totalTrackedPositionTimeSeconds / 60)).toFixed(2)
      : null;

  return (
    <>
      <h3>Overview</h3>
      <ul>
        <li>
          <strong>Total events:</strong> {analytics.totalEventCount}
        </li>
        <li>
          <strong>Total positions:</strong> {analytics.totalPositionCount}
        </li>
        <li>
          <strong>Total tracked position time (seconds):</strong> {analytics.totalTrackedPositionTimeSeconds}
        </li>
        <li>
          <strong>Average events per tracked minute:</strong> {averageEventsPerMinute ?? 'N/A'}
        </li>
      </ul>

      <h3>Event counts by type</h3>
      {eventEntries.length === 0 ? (
        <p>No event counts available.</p>
      ) : (
        <ol>
          {eventEntries.map(([eventType, count]) => (
            <li key={eventType}>
              <strong>{eventType}</strong>: {count}
            </li>
          ))}
        </ol>
      )}

      <h3>Time in each position (seconds)</h3>
      {positionEntries.length === 0 ? (
        <p>No tracked position time yet.</p>
      ) : (
        <ul>
          {positionEntries.map(([positionType, seconds]) => (
            <li key={positionType}>
              <strong>{formatPositionLabel(positionType as PositionType)}</strong>: {seconds}
            </li>
          ))}
        </ul>
      )}

      <h3>Top-time by competitor and position (seconds)</h3>
      {(['A', 'B'] as const).map((competitor) => {
        const competitorPositions = Object.entries(analytics.competitorTopTimeByPositionSeconds[competitor]).filter(([, seconds]) => seconds > 0);

        return (
          <section key={competitor} aria-labelledby={`competitor-${competitor}-top-time-heading`}>
            <h4 id={`competitor-${competitor}-top-time-heading`}>Competitor {competitor}</h4>
            {competitorPositions.length === 0 ? (
              <p>No top-time position totals recorded yet.</p>
            ) : (
              <ul>
                {competitorPositions.map(([positionType, seconds]) => (
                  <li key={`${competitor}-${positionType}`}>
                    <strong>{formatPositionLabel(positionType as PositionType)}</strong>: {seconds}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}
