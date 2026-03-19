import type { MatchAnalyticsSummary, PositionType } from '@scrambleiq/shared';

interface AnalyticsSummaryProps {
  analytics: MatchAnalyticsSummary;
}

type Competitor = 'A' | 'B';

function formatPositionLabel(positionType: PositionType): string {
  return positionType.replaceAll('_', ' ');
}

function formatShare(numerator: number, denominator: number): string {
  if (denominator <= 0) {
    return '0%';
  }

  return `${Math.round((numerator / denominator) * 100)}%`;
}

function getAnnotationCoverageLabel(analytics: MatchAnalyticsSummary): string {
  const totalAnnotations = analytics.totalEventCount + analytics.totalPositionCount;

  if (totalAnnotations < 5 || analytics.totalTrackedPositionTimeSeconds < 60) {
    return 'Sparse';
  }

  if (totalAnnotations < 15 || analytics.totalTrackedPositionTimeSeconds < 180) {
    return 'Developing';
  }

  return 'Substantial';
}

function getCompetitorTopControlTotal(analytics: MatchAnalyticsSummary, competitor: Competitor): number {
  return Object.values(analytics.competitorTopTimeByPositionSeconds[competitor]).reduce((total, seconds) => total + seconds, 0);
}

function getMostTrackedTopControlPosition(analytics: MatchAnalyticsSummary, competitor: Competitor): [PositionType, number] | null {
  const entries = Object.entries(analytics.competitorTopTimeByPositionSeconds[competitor]).filter(([, seconds]) => seconds > 0) as [PositionType, number][];

  if (entries.length === 0) {
    return null;
  }

  entries.sort(([, a], [, b]) => b - a);
  return entries[0];
}

export function AnalyticsSummary({ analytics }: AnalyticsSummaryProps) {
  if (analytics.totalEventCount === 0 && analytics.totalPositionCount === 0) {
    return <p>Not enough annotation data yet. Add events or position states to generate analytics.</p>;
  }

  const eventEntries = Object.entries(analytics.eventCountsByType).sort(([, countA], [, countB]) => countB - countA);
  const positionEntries = (Object.entries(analytics.timeInPositionByTypeSeconds).filter(([, seconds]) => seconds > 0) as [PositionType, number][]).sort(
    ([, secondsA], [, secondsB]) => secondsB - secondsA,
  );

  const topEvent = eventEntries[0] ?? null;
  const topPosition = positionEntries[0] ?? null;

  const competitorATotalTopControlSeconds = getCompetitorTopControlTotal(analytics, 'A');
  const competitorBTotalTopControlSeconds = getCompetitorTopControlTotal(analytics, 'B');

  const totalTopControlSeconds = competitorATotalTopControlSeconds + competitorBTotalTopControlSeconds;

  const topControlSummary =
    totalTopControlSeconds === 0
      ? 'No top-control time has been tracked yet.'
      : competitorATotalTopControlSeconds === competitorBTotalTopControlSeconds
        ? `Top control was even, with ${competitorATotalTopControlSeconds} seconds each.`
        : competitorATotalTopControlSeconds > competitorBTotalTopControlSeconds
          ? `Competitor A led top control by ${competitorATotalTopControlSeconds - competitorBTotalTopControlSeconds} seconds.`
          : `Competitor B led top control by ${competitorBTotalTopControlSeconds - competitorATotalTopControlSeconds} seconds.`;

  const averageEventsPerMinute =
    analytics.totalTrackedPositionTimeSeconds > 0
      ? (analytics.totalEventCount / (analytics.totalTrackedPositionTimeSeconds / 60)).toFixed(2)
      : null;

  return (
    <>
      <h3>Coach summary</h3>
      <ul>
        <li>
          <strong>Annotation coverage:</strong> {getAnnotationCoverageLabel(analytics)} ({analytics.totalEventCount + analytics.totalPositionCount} total annotations)
        </li>
        <li>
          <strong>Most frequent event:</strong>{' '}
          {topEvent ? `${topEvent[0]} (${topEvent[1]} of ${analytics.totalEventCount} events)` : 'No events recorded.'}
        </li>
        <li>
          <strong>Most tracked position:</strong>{' '}
          {topPosition
            ? `${formatPositionLabel(topPosition[0])} (${topPosition[1]}s, ${formatShare(topPosition[1], analytics.totalTrackedPositionTimeSeconds)} of tracked time)`
            : 'No tracked position time yet.'}
        </li>
        <li>
          <strong>Top-control leader:</strong> {topControlSummary}
        </li>
      </ul>

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

      <h3>Most frequent events</h3>
      {eventEntries.length === 0 ? (
        <p>No event counts available.</p>
      ) : (
        <ol>
          {eventEntries.map(([eventType, count]) => (
            <li key={eventType}>
              <strong>{eventType}</strong>: {count} ({formatShare(count, analytics.totalEventCount)})
            </li>
          ))}
        </ol>
      )}

      <h3>Positional time distribution</h3>
      {positionEntries.length === 0 ? (
        <p>No tracked position time yet.</p>
      ) : (
        <ul>
          {positionEntries.map(([positionType, seconds]) => (
            <li key={positionType}>
              <strong>{formatPositionLabel(positionType)}</strong>: {seconds}s ({formatShare(seconds, analytics.totalTrackedPositionTimeSeconds)})
            </li>
          ))}
        </ul>
      )}

      <h3>Top control by competitor</h3>
      {(['A', 'B'] as const).map((competitor) => {
        const competitorTotal = getCompetitorTopControlTotal(analytics, competitor);
        const topControlPosition = getMostTrackedTopControlPosition(analytics, competitor);

        return (
          <section key={competitor} aria-labelledby={`competitor-${competitor}-top-time-heading`}>
            <h4 id={`competitor-${competitor}-top-time-heading`}>Competitor {competitor}</h4>
            <ul>
              <li>
                <strong>Total top control time:</strong> {competitorTotal}s
              </li>
              <li>
                <strong>Most-held top position:</strong>{' '}
                {topControlPosition ? `${formatPositionLabel(topControlPosition[0])} (${topControlPosition[1]}s)` : 'No top-control position totals recorded yet.'}
              </li>
            </ul>
          </section>
        );
      })}
    </>
  );
}
