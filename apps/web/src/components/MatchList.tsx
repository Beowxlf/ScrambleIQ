import type { MatchSummary } from '@scrambleiq/shared';

interface MatchListProps {
  matches: MatchSummary[];
  isLoadingMatches: boolean;
  matchesError: string | null;
  competitorFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  hasVideoOnly: boolean;
  pageSize: number;
  pageOffset: number;
  totalMatches: number;
  onCompetitorFilterChange: (value: string) => void;
  onDateFromFilterChange: (value: string) => void;
  onDateToFilterChange: (value: string) => void;
  onHasVideoOnlyChange: (value: boolean) => void;
  onPageSizeChange: (value: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onViewMatch: (matchId: string) => void;
}

export function MatchList({
  matches,
  isLoadingMatches,
  matchesError,
  competitorFilter,
  dateFromFilter,
  dateToFilter,
  hasVideoOnly,
  pageSize,
  pageOffset,
  totalMatches,
  onCompetitorFilterChange,
  onDateFromFilterChange,
  onDateToFilterChange,
  onHasVideoOnlyChange,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
  onViewMatch,
}: MatchListProps) {
  const currentPage = Math.floor(pageOffset / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(totalMatches / pageSize));
  const canGoPrevious = pageOffset > 0;
  const canGoNext = pageOffset + pageSize < totalMatches;

  return (
    <section aria-labelledby="match-list-heading" className="surface-card">
      <h2 id="match-list-heading">Matches</h2>

      <div className="match-filters-grid">
        <div>
          <label htmlFor="competitor-filter">Filter by competitor</label>
          <input
            id="competitor-filter"
            name="competitor-filter"
            value={competitorFilter}
            onChange={(event) => onCompetitorFilterChange(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="date-from-filter">Date from</label>
          <input
            id="date-from-filter"
            name="date-from-filter"
            type="date"
            value={dateFromFilter}
            onChange={(event) => onDateFromFilterChange(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="date-to-filter">Date to</label>
          <input
            id="date-to-filter"
            name="date-to-filter"
            type="date"
            value={dateToFilter}
            onChange={(event) => onDateToFilterChange(event.target.value)}
          />
        </div>
      </div>

      <div className="match-list-toolbar">
        <label htmlFor="has-video-filter" className="muted">
          <input
            id="has-video-filter"
            name="has-video-filter"
            type="checkbox"
            checked={hasVideoOnly}
            onChange={(event) => onHasVideoOnlyChange(event.target.checked)}
          />
          Has video only
        </label>

        <div>
          <label htmlFor="page-size">Matches per page</label>
          <select id="page-size" name="page-size" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <p>
        Page {currentPage} of {totalPages} ({totalMatches} total)
      </p>

      <div className="button-row">
        <button type="button" onClick={onPreviousPage} disabled={!canGoPrevious}>
          Previous Page
        </button>
        <button type="button" onClick={onNextPage} disabled={!canGoNext}>
          Next Page
        </button>
      </div>

      {isLoadingMatches ? <p>Loading matches...</p> : null}
      {matchesError ? <p>{matchesError}</p> : null}
      {!isLoadingMatches && !matchesError && matches.length === 0 ? <p>No matches yet.</p> : null}

      {!isLoadingMatches && !matchesError && matches.length > 0 ? (
        <ul className="match-list-results">
          {matches.map((match) => (
            <li key={match.matchId} className="match-list-item">
              <div className="match-list-item__header">
                <h3>{match.title}</h3>
                <button type="button" onClick={() => onViewMatch(match.matchId)}>
                  View Match
                </button>
              </div>

              <p className="muted">Date: {match.eventDate}</p>
              <p className="muted">
                Competitors: {match.competitorA} vs {match.competitorB}
              </p>
              <p className="muted">
                Video: {match.hasVideo ? 'Yes' : 'No'} · Events: {match.eventCount} · Positions: {match.positionCount}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
