import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ReportingApi } from '../src/api/reportingApi';
import { App } from '../src/App';
import type { MatchesApi } from '../src/matches-api';

function createMatchesApiMock(): MatchesApi {
  return {
    createMatch: async () => {
      throw new Error('not mocked');
    },
    listMatches: async () => ({ matches: [], total: 0, limit: 50, offset: 0 }),
    getMatch: async () => {
      throw new Error('not mocked');
    },
    updateMatch: async () => {
      throw new Error('not mocked');
    },
    deleteMatch: async () => {
      throw new Error('not mocked');
    },
    createTimelineEvent: async () => {
      throw new Error('not mocked');
    },
    listTimelineEvents: async () => [],
    updateTimelineEvent: async () => {
      throw new Error('not mocked');
    },
    deleteTimelineEvent: async () => {
      throw new Error('not mocked');
    },
    createPositionState: async () => {
      throw new Error('not mocked');
    },
    listPositionStates: async () => [],
    updatePositionState: async () => {
      throw new Error('not mocked');
    },
    deletePositionState: async () => {
      throw new Error('not mocked');
    },
    createMatchVideo: async () => {
      throw new Error('not mocked');
    },
    getMatchVideo: async () => {
      throw new Error('not mocked');
    },
    updateMatchVideo: async () => {
      throw new Error('not mocked');
    },
    deleteMatchVideo: async () => undefined,
    getMatchAnalytics: async () => {
      throw new Error('not mocked');
    },
    exportMatchDataset: async () => {
      throw new Error('not mocked');
    },
    validateMatchDataset: async () => {
      throw new Error('not mocked');
    },
  };
}

function createReportingApiMock(): ReportingApi {
  return {
    getCollectionSummary: async () => ({
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
      isEmpty: true,
    }),
    getCompetitorTrends: async () => {
      throw new Error('not mocked');
    },
    getCollectionValidation: async () => {
      throw new Error('not mocked');
    },
    getCollectionExport: async () => {
      throw new Error('not mocked');
    },
  };
}

describe('App routing: reports', () => {
  it('renders reports page when route is /reports', async () => {
    window.history.replaceState({}, '', '/reports');

    render(<App matchesApi={createMatchesApiMock()} reportingApi={createReportingApiMock()} />);

    expect(await screen.findByRole('heading', { name: 'Collection Reporting' })).toBeInTheDocument();
  });
});
