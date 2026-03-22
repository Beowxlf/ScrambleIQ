import type { MatchesApi } from '../../matches-api';
import { useMatchReviewSummary } from './useMatchReviewSummary';

interface MatchReviewSummaryPanelProps {
  api: MatchesApi;
  matchId: string;
  refreshTrigger: number;
}

export function MatchReviewSummaryPanel({ api, matchId, refreshTrigger }: MatchReviewSummaryPanelProps) {
  const { reviewSummary, reviewSummaryError, isLoadingReviewSummary } = useMatchReviewSummary({ api, matchId, refreshTrigger });

  return (
    <section aria-labelledby="match-review-summary-heading">
      <h2 id="match-review-summary-heading">Single-Match Review Summary</h2>
      <p>Deterministic summary from saved match metadata, manual annotations, analytics, and validation state.</p>

      {isLoadingReviewSummary ? <p>Loading review summary...</p> : null}
      {reviewSummaryError ? <p>{reviewSummaryError}</p> : null}

      {!isLoadingReviewSummary && !reviewSummaryError && reviewSummary ? (
        <div>
          <p>
            <strong>Match:</strong> {reviewSummary.match.title} ({reviewSummary.match.date})
          </p>
          <p>
            <strong>Competitors:</strong> {reviewSummary.match.competitorA} vs {reviewSummary.match.competitorB}
          </p>
          <p>
            <strong>Ruleset:</strong> {reviewSummary.match.ruleset}
          </p>
          <ul>
            <li>Event count: {reviewSummary.eventCount}</li>
            <li>Position count: {reviewSummary.positionCount}</li>
            <li>Video attached: {reviewSummary.hasVideo ? 'Yes' : 'No'}</li>
            <li>Total tracked position time: {reviewSummary.analytics.totalTrackedPositionTimeSeconds} seconds</li>
            <li>Validation ready: {reviewSummary.validation.isValid ? 'Yes' : 'No'}</li>
            <li>Total validation issues: {reviewSummary.validation.issueCount}</li>
            <li>
              Issue severity counts: info {reviewSummary.validation.issueCountsBySeverity.info}, warning{' '}
              {reviewSummary.validation.issueCountsBySeverity.warning}, error {reviewSummary.validation.issueCountsBySeverity.error}
            </li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
