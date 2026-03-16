import type { MatchSummary } from '@scrambleiq/shared';

interface MatchListProps {
  matches: MatchSummary[];
  isLoadingMatches: boolean;
  matchesError: string | null;
  competitorFilter: string;
  hasVideoOnly: boolean;
  onCompetitorFilterChange: (value: string) => void;
  onHasVideoOnlyChange: (value: boolean) => void;
  onViewMatch: (matchId: string) => void;
}

export function MatchList({
  matches,
  isLoadingMatches,
  matchesError,
  competitorFilter,
  hasVideoOnly,
  onCompetitorFilterChange,
  onHasVideoOnlyChange,
  onViewMatch,
}: MatchListProps) {
  return (
    <section aria-labelledby="match-list-heading">
      <h2 id="match-list-heading">Matches</h2>

      <label htmlFor="competitor-filter">Filter by competitor</label>
      <input
        id="competitor-filter"
        name="competitor-filter"
        value={competitorFilter}
        onChange={(event) => onCompetitorFilterChange(event.target.value)}
      />

      <label htmlFor="has-video-filter">Has video only</label>
      <input
        id="has-video-filter"
        name="has-video-filter"
        type="checkbox"
        checked={hasVideoOnly}
        onChange={(event) => onHasVideoOnlyChange(event.target.checked)}
      />

      {isLoadingMatches ? <p>Loading matches...</p> : null}
      {matchesError ? <p>{matchesError}</p> : null}

      {!isLoadingMatches && !matchesError && matches.length === 0 ? <p>No matches yet.</p> : null}

      {!isLoadingMatches && !matchesError && matches.length > 0 ? (
        <ul>
          {matches.map((match) => (
            <li key={match.matchId}>
              <h3>{match.title}</h3>
              <p>Date: {match.eventDate}</p>
              <p>Competitors: {match.competitorA} vs {match.competitorB}</p>
              <p>Events: {match.eventCount}</p>
              <p>Positions: {match.positionCount}</p>
              <p>Video: {match.hasVideo ? 'Yes' : 'No'}</p>
              <button type="button" onClick={() => onViewMatch(match.matchId)}>
                View Match
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
