import { CSSProperties } from 'react';

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

const listStyles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #d8e0ec',
    borderRadius: '10px',
    padding: '1rem',
  },
  heading: {
    margin: 0,
    fontSize: '1.05rem',
  },
  subheading: {
    margin: '0.4rem 0 0.9rem',
    color: '#465976',
    fontSize: '0.9rem',
  },
  filterGrid: {
    display: 'grid',
    gap: '0.75rem',
    gridTemplateColumns: 'repeat(3, minmax(150px, 1fr))',
    marginBottom: '0.65rem',
  },
  filterField: {
    display: 'grid',
    gap: '0.3rem',
  },
  filterLabel: {
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  input: {
    border: '1px solid #b9c5d8',
    borderRadius: '6px',
    fontSize: '0.9rem',
    padding: '0.42rem 0.5rem',
  },
  filterFooter: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.8rem 1.2rem',
    marginBottom: '1rem',
  },
  pager: {
    alignItems: 'center',
    display: 'flex',
    gap: '0.5rem',
  },
  pagerButton: {
    border: '1px solid #9fb1cc',
    borderRadius: '6px',
    background: '#f9fbff',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '0.35rem 0.55rem',
  },
  status: {
    margin: '0.45rem 0 0.8rem',
    color: '#334862',
  },
  list: {
    display: 'grid',
    gap: '0.7rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  row: {
    border: '1px solid #d8e0ec',
    borderRadius: '8px',
    padding: '0.75rem 0.8rem',
  },
  rowHeader: {
    alignItems: 'baseline',
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  rowTitle: {
    fontSize: '1rem',
    margin: 0,
  },
  viewButton: {
    border: '1px solid #9fb1cc',
    borderRadius: '6px',
    background: '#f9fbff',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '0.3rem 0.5rem',
  },
  rowMeta: {
    display: 'grid',
    gap: '0.3rem',
    gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))',
    margin: 0,
  },
  rowText: {
    margin: 0,
    color: '#2f435f',
    fontSize: '0.9rem',
  },
};

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
    <section aria-labelledby="match-list-heading">
      <h2 id="match-list-heading">Matches</h2>

      <label htmlFor="competitor-filter">Filter by competitor</label>
      <input
        id="competitor-filter"
        name="competitor-filter"
        value={competitorFilter}
        onChange={(event) => onCompetitorFilterChange(event.target.value)}
      />

      <label htmlFor="date-from-filter">Date from</label>
      <input
        id="date-from-filter"
        name="date-from-filter"
        type="date"
        value={dateFromFilter}
        onChange={(event) => onDateFromFilterChange(event.target.value)}
      />

      <label htmlFor="date-to-filter">Date to</label>
      <input
        id="date-to-filter"
        name="date-to-filter"
        type="date"
        value={dateToFilter}
        onChange={(event) => onDateToFilterChange(event.target.value)}
      />

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

      <label htmlFor="page-size">Matches per page</label>
      <select
        id="page-size"
        name="page-size"
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </select>

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
        <ul style={listStyles.list}>
          {matches.map((match) => (
            <li key={match.matchId} style={listStyles.row}>
              <div style={listStyles.rowHeader}>
                <h3 style={listStyles.rowTitle}>{match.title}</h3>
                <button type="button" onClick={() => onViewMatch(match.matchId)} style={listStyles.viewButton}>
                  View Match
                </button>
              </div>

              <div style={listStyles.rowMeta}>
                <p style={listStyles.rowText}>Date: {match.eventDate}</p>
                <p style={listStyles.rowText}>Competitors: {match.competitorA} vs {match.competitorB}</p>
                <p style={listStyles.rowText}>Video: {match.hasVideo ? 'Yes' : 'No'}</p>
                <p style={listStyles.rowText}>Events: {match.eventCount}</p>
                <p style={listStyles.rowText}>Positions: {match.positionCount}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
