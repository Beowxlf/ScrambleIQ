import { useState } from 'react';

import type {
  CollectionMatchValidationStatus,
  CompetitorTrendWindowSummary,
  PositionTimeTrendDelta,
  ReportArtifactType,
} from '@scrambleiq/shared';

import type { ReportingApi } from '../api/reportingApi';
import {
  useCollectionExportRequest,
  useCollectionSummaryRequest,
  useCollectionValidationRequest,
  useCompetitorTrendsRequest,
} from '../features/reporting/useReportingRequests';
import { buildDefaultDateRange, validateDateRange } from '../features/reporting/reportingDate';

interface ReportsPageProps {
  reportingApi: ReportingApi;
}

const artifactTypeOptions: ReportArtifactType[] = ['period_summary', 'competitor_snapshot', 'readiness_summary'];
const emptyInsightsMessage = 'No significant patterns detected for the selected range';

function formatPosition(position: string): string {
  return position.replaceAll('_', ' ');
}

function MatchValidationList({ matches }: { matches: CollectionMatchValidationStatus[] }) {
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.isValid !== b.isValid) {
      return a.isValid ? 1 : -1;
    }

    return b.issueCount - a.issueCount;
  });

  return (
    <ul>
      {sortedMatches.map((match) => (
        <li key={match.matchId}>
          <strong>{match.matchId}</strong>: {match.isValid ? 'Valid' : 'Needs review'} ({match.issueCount} issues; errors:{' '}
          {match.issueCountsBySeverity.error}, warnings: {match.issueCountsBySeverity.warning}, info:{' '}
          {match.issueCountsBySeverity.info})
        </li>
      ))}
    </ul>
  );
}

function TrendWindow({ summary }: { summary: CompetitorTrendWindowSummary }) {
  return (
    <article aria-label={`${summary.window} window`}>
      <h4>{summary.window === 'current' ? 'Current window' : 'Previous window'}</h4>
      <p>
        Range: {summary.dateRange.startDate} → {summary.dateRange.endDate}
      </p>
      <p>Matches: {summary.matchCount}</p>
      <h5>Event distribution</h5>
      {summary.eventTypeDistribution.length > 0 ? (
        <ul>
          {summary.eventTypeDistribution.map((entry) => (
            <li key={entry.eventType}>
              {entry.eventType}: {entry.count}
            </li>
          ))}
        </ul>
      ) : (
        <p>No event data in this window.</p>
      )}
      <h5>Position time distribution</h5>
      {summary.positionTimeDistribution.length > 0 ? (
        <ul>
          {summary.positionTimeDistribution.map((entry) => (
            <li key={entry.position}>
              {formatPosition(entry.position)}: {entry.durationSeconds}s
            </li>
          ))}
        </ul>
      ) : (
        <p>No position time data in this window.</p>
      )}
    </article>
  );
}

function PositionDeltas({ deltas }: { deltas: PositionTimeTrendDelta[] }) {
  if (deltas.length === 0) {
    return <p>No position deltas available for the selected windows.</p>;
  }

  return (
    <ul>
      {deltas.map((delta) => (
        <li key={delta.position}>
          {formatPosition(delta.position)}: current {delta.currentDurationSeconds}s / previous {delta.previousDurationSeconds}s / change{' '}
          {delta.deltaDurationSeconds >= 0 ? '+' : ''}
          {delta.deltaDurationSeconds}s
        </li>
      ))}
    </ul>
  );
}

interface InsightListProps {
  insights: string[];
  contextMessage?: string;
  emptyMessage?: string;
}

function InsightList({ insights, contextMessage, emptyMessage = emptyInsightsMessage }: InsightListProps) {
  return (
    <article aria-label="Insights">
      <h4>Insights</h4>
      {contextMessage ? <p className="muted">{contextMessage}</p> : null}
      {insights.length > 0 ? (
        <ul>
          {insights.map((insight, index) => (
            <li key={`${insight}-${index}`}>{insight}</li>
          ))}
        </ul>
      ) : (
        <p>{emptyMessage}</p>
      )}
    </article>
  );
}

export function ReportsPage({ reportingApi }: ReportsPageProps) {
  const defaultDateRange = buildDefaultDateRange();

  const [dateFrom, setDateFrom] = useState(defaultDateRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultDateRange.dateTo);
  const [competitor, setCompetitor] = useState('');
  const [ruleset, setRuleset] = useState('');
  const [competitorId, setCompetitorId] = useState('');
  const [artifactType, setArtifactType] = useState<ReportArtifactType>('period_summary');
  const [summaryInputError, setSummaryInputError] = useState<string | null>(null);
  const [trendsInputError, setTrendsInputError] = useState<string | null>(null);
  const [validationInputError, setValidationInputError] = useState<string | null>(null);
  const [exportInputError, setExportInputError] = useState<string | null>(null);
  const [showRawExportJson, setShowRawExportJson] = useState(false);

  const summaryRequest = useCollectionSummaryRequest(reportingApi);
  const trendsRequest = useCompetitorTrendsRequest(reportingApi);
  const validationRequest = useCollectionValidationRequest(reportingApi);
  const exportRequest = useCollectionExportRequest(reportingApi);

  const onLoadSummary = async () => {
    const dateValidation = validateDateRange({ dateFrom, dateTo });

    if (dateValidation) {
      setSummaryInputError(dateValidation);
      return;
    }

    setSummaryInputError(null);

    await summaryRequest.run({
      dateFrom,
      dateTo,
      competitor: competitor.trim() || undefined,
      ruleset: ruleset.trim() || undefined,
    });
  };

  const onLoadTrends = async () => {
    const dateValidation = validateDateRange({ dateFrom, dateTo });

    if (dateValidation) {
      setTrendsInputError(dateValidation);
      return;
    }

    if (!competitorId.trim()) {
      setTrendsInputError('Competitor ID is required for competitor trends.');
      return;
    }

    setTrendsInputError(null);

    await trendsRequest.run({
      competitorId: competitorId.trim(),
      dateFrom,
      dateTo,
    });
  };

  const onLoadValidation = async () => {
    const dateValidation = validateDateRange({ dateFrom, dateTo });

    if (dateValidation) {
      setValidationInputError(dateValidation);
      return;
    }

    setValidationInputError(null);

    await validationRequest.run({
      dateFrom,
      dateTo,
      competitor: competitor.trim() || undefined,
      ruleset: ruleset.trim() || undefined,
    });
  };

  const onLoadExport = async () => {
    const dateValidation = validateDateRange({ dateFrom, dateTo });

    if (dateValidation) {
      setExportInputError(dateValidation);
      return;
    }

    setExportInputError(null);

    await exportRequest.run({
      dateFrom,
      dateTo,
      competitor: competitor.trim() || undefined,
      ruleset: ruleset.trim() || undefined,
      artifactType,
    });
  };

  return (
    <main className="section-stack" aria-label="Reports workspace">
      <header className="app-header">
        <h2>Collection Reporting</h2>
        <p>Use collection-level reporting to review annotation output quality and coach-facing trend summaries.</p>
      </header>

      <section aria-labelledby="report-filters-heading">
        <h3 id="report-filters-heading">Shared report filters</h3>
        <div className="match-filters-grid">
          <div>
            <label htmlFor="reports-date-from">Date from</label>
            <input id="reports-date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </div>
          <div>
            <label htmlFor="reports-date-to">Date to</label>
            <input id="reports-date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
          <div>
            <label htmlFor="reports-ruleset">Ruleset (optional)</label>
            <input id="reports-ruleset" value={ruleset} onChange={(event) => setRuleset(event.target.value)} />
          </div>
        </div>
        <label htmlFor="reports-competitor">Competitor filter (optional)</label>
        <input id="reports-competitor" value={competitor} onChange={(event) => setCompetitor(event.target.value)} />
      </section>

      <section aria-labelledby="collection-summary-heading">
        <h3 id="collection-summary-heading">Collection Summary</h3>
        <p>Aggregate match, event, and position volumes for the selected date range.</p>
        <div className="button-row">
          <button type="button" onClick={() => void onLoadSummary()} disabled={summaryRequest.isLoading}>
            {summaryRequest.isLoading ? 'Loading summary...' : 'Load collection summary'}
          </button>
        </div>
        {summaryInputError ? <p className="status-error">{summaryInputError}</p> : null}
        {summaryRequest.error ? <p className="status-error">{summaryRequest.error}</p> : null}
        {summaryRequest.data ? <InsightList insights={summaryRequest.data.insights} /> : null}
        {summaryRequest.data?.isEmpty ? <p>{summaryRequest.data.emptyStateMessage ?? 'No collection data for these filters.'}</p> : null}
        {summaryRequest.data && !summaryRequest.data.isEmpty ? (
          <>
            <p>Total matches: {summaryRequest.data.totals.matchCount}</p>
            <p>Total events: {summaryRequest.data.totals.eventCount}</p>
            <p>Total positions: {summaryRequest.data.totals.positionCount}</p>
            <h4>Event type distribution</h4>
            <ul>
              {summaryRequest.data.eventTypeDistribution.map((entry) => (
                <li key={entry.eventType}>
                  {entry.eventType}: {entry.count}
                </li>
              ))}
            </ul>
            <h4>Position time distribution</h4>
            <ul>
              {summaryRequest.data.positionTimeDistribution.map((entry) => (
                <li key={entry.position}>
                  {formatPosition(entry.position)}: {entry.durationSeconds}s
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section aria-labelledby="competitor-trends-heading">
        <h3 id="competitor-trends-heading">Competitor Trends</h3>
        <label htmlFor="reports-competitor-id">Competitor ID</label>
        <input id="reports-competitor-id" value={competitorId} onChange={(event) => setCompetitorId(event.target.value)} />
        <div className="button-row">
          <button type="button" onClick={() => void onLoadTrends()} disabled={trendsRequest.isLoading}>
            {trendsRequest.isLoading ? 'Loading trends...' : 'Load competitor trends'}
          </button>
        </div>
        {trendsInputError ? <p className="status-error">{trendsInputError}</p> : null}
        {trendsRequest.error ? <p className="status-error">{trendsRequest.error}</p> : null}
        {trendsRequest.data ? (
          <>
            <InsightList
              insights={trendsRequest.data.insights}
              contextMessage={`Competitor ${trendsRequest.data.competitor} · ${trendsRequest.data.windows[0]?.dateRange.startDate ?? dateFrom} to ${
                trendsRequest.data.windows[0]?.dateRange.endDate ?? dateTo
              } · Data sufficiency: ${trendsRequest.data.dataSufficiency.isSufficient ? 'Sufficient' : 'Insufficient'} (${
                trendsRequest.data.dataSufficiency.message
              })`}
            />
            <div className="two-column-layout">
              {trendsRequest.data.windows.map((window) => (
                <TrendWindow key={window.window} summary={window} />
              ))}
            </div>
            <article>
              <h4>Event type deltas</h4>
              {trendsRequest.data.eventTypeDeltas.length > 0 ? (
                <ul>
                  {trendsRequest.data.eventTypeDeltas.map((delta) => (
                    <li key={delta.eventType}>
                      {delta.eventType}: current {delta.currentCount} / previous {delta.previousCount} / change{' '}
                      {delta.deltaCount >= 0 ? '+' : ''}
                      {delta.deltaCount}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No event deltas available for the selected windows.</p>
              )}
            </article>
            <article>
              <h4>Position time deltas</h4>
              <PositionDeltas deltas={trendsRequest.data.positionTimeDeltas} />
            </article>
          </>
        ) : null}
      </section>

      <section aria-labelledby="collection-validation-heading">
        <h3 id="collection-validation-heading">Collection Validation</h3>
        <div className="button-row">
          <button type="button" onClick={() => void onLoadValidation()} disabled={validationRequest.isLoading}>
            {validationRequest.isLoading ? 'Loading validation...' : 'Load collection validation'}
          </button>
        </div>
        {validationInputError ? <p className="status-error">{validationInputError}</p> : null}
        {validationRequest.error ? <p className="status-error">{validationRequest.error}</p> : null}
        {validationRequest.data ? (
          <>
            <p>Collection valid: {validationRequest.data.isValid ? 'Yes' : 'No'}</p>
            <p>Total issues: {validationRequest.data.issueCount}</p>
            <InsightList insights={validationRequest.data.insights} />
            <h4>Issue counts by severity</h4>
            <ul>
              <li>Errors: {validationRequest.data.issueCountsBySeverity.error}</li>
              <li>Warnings: {validationRequest.data.issueCountsBySeverity.warning}</li>
              <li>Info: {validationRequest.data.issueCountsBySeverity.info}</li>
            </ul>
            <h4>Issue counts by type</h4>
            {validationRequest.data.issueCountsByType.length > 0 ? (
              <ul>
                {validationRequest.data.issueCountsByType.map((entry) => (
                  <li key={entry.type}>
                    {entry.type}: {entry.count}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No validation issues found for these filters.</p>
            )}
            <h4>Per-match validation status</h4>
            {validationRequest.data.matches.length > 0 ? (
              <MatchValidationList matches={validationRequest.data.matches} />
            ) : (
              <p>No matches found for validation in this date range.</p>
            )}
          </>
        ) : null}
      </section>

      <section aria-labelledby="collection-export-heading">
        <h3 id="collection-export-heading">Collection Export</h3>
        <label htmlFor="reports-artifact-type">Artifact type</label>
        <select id="reports-artifact-type" value={artifactType} onChange={(event) => setArtifactType(event.target.value as ReportArtifactType)}>
          {artifactTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="button-row">
          <button type="button" onClick={() => void onLoadExport()} disabled={exportRequest.isLoading}>
            {exportRequest.isLoading ? 'Loading export...' : 'Load collection export'}
          </button>
          <button type="button" onClick={() => setShowRawExportJson((current) => !current)} disabled={!exportRequest.data}>
            {showRawExportJson ? 'Hide raw JSON' : 'Show raw JSON'}
          </button>
        </div>
        {exportInputError ? <p className="status-error">{exportInputError}</p> : null}
        {exportRequest.error ? <p className="status-error">{exportRequest.error}</p> : null}
        {exportRequest.data ? (
          <>
            <p>Schema version: {exportRequest.data.metadata.schemaVersion}</p>
            <p>Match order: {exportRequest.data.metadata.matchOrder}</p>
            <p>Artifact type: {exportRequest.data.metadata.artifactType}</p>
            <p>Exported matches: {exportRequest.data.matches.length}</p>
            <h4>Structured export preview</h4>
            {exportRequest.data.matches.length > 0 ? (
              <ul>
                {exportRequest.data.matches.slice(0, 5).map((matchExport) => (
                  <li key={matchExport.match.id}>
                    {matchExport.match.date} - {matchExport.match.title} ({matchExport.events.length} events, {matchExport.positions.length}{' '}
                    positions)
                  </li>
                ))}
              </ul>
            ) : (
              <p>No matches available in export payload for these filters.</p>
            )}
            {showRawExportJson ? <pre>{JSON.stringify(exportRequest.data, null, 2)}</pre> : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
