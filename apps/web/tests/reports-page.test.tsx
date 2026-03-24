import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CollectionExportPayload, CollectionReviewSummary, CollectionValidationReport, CompetitorTrendSummary } from '@scrambleiq/shared';

import type { ReportingApi } from '../src/api/reportingApi';
import { ReportsPage } from '../src/pages/ReportsPage';

function createReportingApiMock(overrides: Partial<ReportingApi> = {}): ReportingApi {
  return {
    getCollectionSummary: async (): Promise<CollectionReviewSummary> => ({
      filters: { dateRange: { startDate: '2026-03-01', endDate: '2026-03-31' } },
      totals: {
        matchCount: 0,
        eventCount: 0,
        positionCount: 0,
        trackedPositionTimeSeconds: 0,
        videoAttachedCount: 0,
      },
      eventTypeDistribution: [],
      positionTimeDistribution: [],
      insights: [],
      isEmpty: true,
      emptyStateMessage: 'No collection data is available for the selected filters.',
    }),
    getCompetitorTrends: async (): Promise<CompetitorTrendSummary> => ({
      filters: { dateRange: { startDate: '2026-03-01', endDate: '2026-03-31' } },
      competitor: 'c-1',
      windows: [
        {
          window: 'current',
          dateRange: { startDate: '2026-03-01', endDate: '2026-03-31' },
          matchCount: 1,
          eventTypeDistribution: [{ eventType: 'guard_pass', count: 2 }],
          positionTimeDistribution: [{ position: 'half_guard', durationSeconds: 10 }],
        },
        {
          window: 'previous',
          dateRange: { startDate: '2026-02-01', endDate: '2026-02-28' },
          matchCount: 1,
          eventTypeDistribution: [{ eventType: 'guard_pass', count: 1 }],
          positionTimeDistribution: [{ position: 'half_guard', durationSeconds: 4 }],
        },
      ],
      eventTypeDeltas: [{ eventType: 'guard_pass', currentCount: 2, previousCount: 1, deltaCount: 1 }],
      positionTimeDeltas: [{ position: 'half_guard', currentDurationSeconds: 10, previousDurationSeconds: 4, deltaDurationSeconds: 6 }],
      insights: [],
      dataSufficiency: {
        minimumMatchCount: 2,
        observedMatchCount: 2,
        isSufficient: true,
        message: 'Sufficient data.',
      },
    }),
    getCollectionValidation: async (): Promise<CollectionValidationReport> => ({
      filters: { dateRange: { startDate: '2026-03-01', endDate: '2026-03-31' } },
      isValid: false,
      issueCount: 3,
      issueCountsBySeverity: { info: 1, warning: 1, error: 1 },
      issueCountsByType: [{ type: 'MISSING_VIDEO', count: 1 }],
      insights: [],
      matches: [
        {
          matchId: 'match-2',
          isValid: false,
          issueCount: 2,
          issueCountsBySeverity: { info: 0, warning: 1, error: 1 },
        },
      ],
    }),
    getCollectionExport: async (): Promise<CollectionExportPayload> => ({
      metadata: {
        schemaVersion: 'phase4.v1',
        artifactType: 'period_summary',
        filters: { dateRange: { startDate: '2026-03-01', endDate: '2026-03-31' } },
        matchOrder: 'date_then_match_id',
      },
      summary: {
        filters: { dateRange: { startDate: '2026-03-01', endDate: '2026-03-31' } },
        totals: {
          matchCount: 1,
          eventCount: 2,
          positionCount: 1,
          trackedPositionTimeSeconds: 10,
          videoAttachedCount: 1,
        },
        eventTypeDistribution: [{ eventType: 'guard_pass', count: 2 }],
        positionTimeDistribution: [{ position: 'half_guard', durationSeconds: 10 }],
        insights: [],
        isEmpty: false,
      },
      validation: {
        filters: { dateRange: { startDate: '2026-03-01', endDate: '2026-03-31' } },
        isValid: true,
        issueCount: 0,
        issueCountsBySeverity: { info: 0, warning: 0, error: 0 },
        issueCountsByType: [],
        matches: [],
        insights: [],
      },
      matches: [
        {
          match: {
            id: 'match-1',
            title: 'Finals',
            date: '2026-03-10',
            ruleset: 'folkstyle',
            competitorA: 'A',
            competitorB: 'B',
            notes: '',
          },
          video: null,
          events: [],
          positions: [],
          analytics: {
            matchId: 'match-1',
            totalEventCount: 0,
            eventCountsByType: {},
            totalPositionCount: 0,
            timeInPositionByTypeSeconds: {
              standing: 0,
              closed_guard: 0,
              open_guard: 0,
              half_guard: 0,
              side_control: 0,
              mount: 0,
              back_control: 0,
              north_south: 0,
              leg_entanglement: 0,
              scramble: 0,
            },
            competitorTopTimeByPositionSeconds: {
              A: { standing: 0, closed_guard: 0, open_guard: 0, half_guard: 0, side_control: 0, mount: 0, back_control: 0, north_south: 0, leg_entanglement: 0, scramble: 0 },
              B: { standing: 0, closed_guard: 0, open_guard: 0, half_guard: 0, side_control: 0, mount: 0, back_control: 0, north_south: 0, leg_entanglement: 0, scramble: 0 },
            },
            totalTrackedPositionTimeSeconds: 0,
          },
        },
      ],
    }),
    ...overrides,
  };
}

afterEach(() => cleanup());

describe('ReportsPage', () => {
  it('renders fetched summary, trends, validation, and export sections', async () => {
    const api = createReportingApiMock();

    render(<ReportsPage reportingApi={api} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load collection summary' }));
    expect(await screen.findByText('No collection data is available for the selected filters.')).toBeInTheDocument();
    expect(screen.getByText('No major summary shifts were detected. Continue to trend and validation review for risk checks.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Competitor ID'), { target: { value: 'c-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Load competitor trends' }));
    expect(await screen.findByText(/Competitor c-1/)).toBeInTheDocument();
    expect(screen.getByText(/Data sufficiency: Sufficient \(Sufficient data\.\)/)).toBeInTheDocument();
    expect(screen.getByText('Current window')).toBeInTheDocument();
    expect(screen.getByText('Previous window')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Load collection validation' }));
    expect(await screen.findByText('Collection valid: No')).toBeInTheDocument();
    expect(screen.getByText('MISSING_VIDEO: 1')).toBeInTheDocument();
    expect(screen.getByText('No trend changes crossed alert thresholds. Maintain current plan and continue monitoring.')).toBeInTheDocument();
    expect(screen.getByText('No recurring reliability risks were detected in this range.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Load collection export' }));
    expect(await screen.findByText('Schema version: phase4.v1')).toBeInTheDocument();
    expect(screen.getByText('Match order: date_then_match_id')).toBeInTheDocument();
  });

  it('validates competitor trends input before request', async () => {
    const getCompetitorTrends = vi.fn(async () => createReportingApiMock().getCompetitorTrends({ competitorId: 'c-1', dateFrom: '2026-03-01', dateTo: '2026-03-31' }));
    const api = createReportingApiMock({ getCompetitorTrends });

    render(<ReportsPage reportingApi={api} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load competitor trends' }));

    expect(await screen.findByText('Competitor ID is required for competitor trends.')).toBeInTheDocument();
    expect(getCompetitorTrends).not.toHaveBeenCalled();
  });

  it('shows API failure states', async () => {
    const api = createReportingApiMock({
      getCollectionSummary: async () => {
        throw new Error('failed');
      },
    });

    render(<ReportsPage reportingApi={api} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load collection summary' }));

    await waitFor(() => {
      expect(screen.getByText('Unable to load collection summary right now.')).toBeInTheDocument();
    });
  });

  it('renders backend insights in summary, trends, and validation sections', async () => {
    const api = createReportingApiMock({
      getCollectionSummary: async () => ({
        ...(await createReportingApiMock().getCollectionSummary({ dateFrom: '2026-03-01', dateTo: '2026-03-31' })),
        isEmpty: false,
        insights: ['Summary insight example.'],
      }),
      getCompetitorTrends: async () => ({
        ...(await createReportingApiMock().getCompetitorTrends({ competitorId: 'c-1', dateFrom: '2026-03-01', dateTo: '2026-03-31' })),
        insights: ['Trend insight example.'],
      }),
      getCollectionValidation: async () => ({
        ...(await createReportingApiMock().getCollectionValidation({ dateFrom: '2026-03-01', dateTo: '2026-03-31' })),
        insights: ['Validation insight example.'],
      }),
    });

    render(<ReportsPage reportingApi={api} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load collection summary' }));
    expect(await screen.findByText('Summary insight example.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Competitor ID'), { target: { value: 'c-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Load competitor trends' }));
    expect(await screen.findByText('Trend insight example.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Load collection validation' }));
    expect(await screen.findByText('Validation insight example.')).toBeInTheDocument();
  });

  it('renders insights in priority order with the highest-priority item first', async () => {
    const api = createReportingApiMock({
      getCollectionSummary: async () => ({
        ...(await createReportingApiMock().getCollectionSummary({ dateFrom: '2026-03-01', dateTo: '2026-03-31' })),
        isEmpty: false,
        insights: ['Most critical insight first.', 'Secondary insight second.'],
      }),
    });

    render(<ReportsPage reportingApi={api} />);

    fireEvent.click(screen.getByRole('button', { name: 'Load collection summary' }));
    const insightPanel = await screen.findByLabelText('Key insights panel');
    const items = within(insightPanel).getAllByRole('listitem');

    expect(items[0]?.textContent).toBe('Most critical insight first.');
    expect(items[1]?.textContent).toBe('Secondary insight second.');
  });

  it('renders section headings independently for summary, trends, and validation', () => {
    render(<ReportsPage reportingApi={createReportingApiMock()} />);

    expect(screen.getByRole('heading', { name: '1. Collection Summary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '2. Competitor Trends' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '3. Collection Validation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '4. Collection Export' })).toBeInTheDocument();
  });
});
