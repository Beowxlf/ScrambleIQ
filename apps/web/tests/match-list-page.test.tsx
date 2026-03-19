import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Match } from '@scrambleiq/shared';

import { MatchListPage } from '../src/pages/MatchListPage';
import type { MatchFormValues } from '../src/match';
import type { MatchesApi } from '../src/matches-api';

function createMatchesApiMock(overrides: Partial<MatchesApi> = {}): MatchesApi {
  return {
    createMatch: async () => {
      throw new Error('createMatch was not mocked');
    },
    listMatches: async () => ({ matches: [], total: 0, limit: 50, offset: 0 }),
    getMatch: async () => {
      throw new Error('getMatch was not mocked');
    },
    updateMatch: async () => {
      throw new Error('updateMatch was not mocked');
    },
    deleteMatch: async () => {
      throw new Error('deleteMatch was not mocked');
    },
    createTimelineEvent: async () => {
      throw new Error('createTimelineEvent was not mocked');
    },
    listTimelineEvents: async () => [],
    updateTimelineEvent: async () => {
      throw new Error('updateTimelineEvent was not mocked');
    },
    deleteTimelineEvent: async () => {
      throw new Error('deleteTimelineEvent was not mocked');
    },
    createPositionState: async () => {
      throw new Error('createPositionState was not mocked');
    },
    listPositionStates: async () => [],
    updatePositionState: async () => {
      throw new Error('updatePositionState was not mocked');
    },
    deletePositionState: async () => {
      throw new Error('deletePositionState was not mocked');
    },
    createMatchVideo: async () => {
      throw new Error('createMatchVideo was not mocked');
    },
    getMatchVideo: async () => {
      throw new Error('getMatchVideo was not mocked');
    },
    updateMatchVideo: async () => {
      throw new Error('updateMatchVideo was not mocked');
    },
    deleteMatchVideo: async () => undefined,
    getMatchAnalytics: async () => {
      throw new Error('getMatchAnalytics was not mocked');
    },
    exportMatchDataset: async () => {
      throw new Error('exportMatchDataset was not mocked');
    },
    validateMatchDataset: async () => {
      throw new Error('validateMatchDataset was not mocked');
    },
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe('MatchListPage', () => {
  it('renders create form and list section', async () => {
    const api = createMatchesApiMock();

    render(<MatchListPage api={api} onOpenMatch={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Create Match' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Matches' })).toBeInTheDocument();
  });

  it('creates a match and navigates to detail callback', async () => {
    const onOpenMatch = vi.fn();
    const createMatch = vi.fn(async (payload: MatchFormValues): Promise<Match> => ({
      id: 'match-88',
      ...payload,
      notes: payload.notes ?? '',
    }));
    const api = createMatchesApiMock({ createMatch });

    render(<MatchListPage api={api} onOpenMatch={onOpenMatch} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'State Finals' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-01' } });
    fireEvent.change(screen.getByLabelText('Ruleset'), { target: { value: 'Folkstyle' } });
    fireEvent.change(screen.getByLabelText('Competitor A'), { target: { value: 'Alex Carter' } });
    fireEvent.change(screen.getByLabelText('Competitor B'), { target: { value: 'Sam Jordan' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Match' }));

    await waitFor(() => expect(createMatch).toHaveBeenCalledTimes(1));
    expect(onOpenMatch).toHaveBeenCalledWith('match-88');
  });

  it('applies competitor, date, and video filters through list API calls', async () => {
    const listMatches = vi.fn(async () => ({ matches: [], total: 0, limit: 25, offset: 0 }));
    const api = createMatchesApiMock({ listMatches });

    render(<MatchListPage api={api} onOpenMatch={vi.fn()} />);

    await waitFor(() =>
      expect(listMatches).toHaveBeenCalledWith({
        competitor: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        hasVideo: undefined,
        limit: 25,
        offset: 0,
      }),
    );

    fireEvent.change(screen.getByLabelText('Filter by competitor'), { target: { value: 'Alex' } });

    await waitFor(() =>
      expect(listMatches).toHaveBeenLastCalledWith({
        competitor: 'Alex',
        dateFrom: undefined,
        dateTo: undefined,
        hasVideo: undefined,
        limit: 25,
        offset: 0,
      }),
    );

    fireEvent.change(screen.getByLabelText('Date from'), { target: { value: '2026-01-01' } });

    await waitFor(() =>
      expect(listMatches).toHaveBeenLastCalledWith({
        competitor: 'Alex',
        dateFrom: '2026-01-01',
        dateTo: undefined,
        hasVideo: undefined,
        limit: 25,
        offset: 0,
      }),
    );

    fireEvent.change(screen.getByLabelText('Date to'), { target: { value: '2026-01-31' } });
    fireEvent.click(screen.getByLabelText('Has video only'));

    await waitFor(() =>
      expect(listMatches).toHaveBeenLastCalledWith({
        competitor: 'Alex',
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
        hasVideo: true,
        limit: 25,
        offset: 0,
      }),
    );
  });

  it('supports pagination controls for match discovery workflow', async () => {
    const listMatches = vi.fn(async () => ({ matches: [], total: 80, limit: 25, offset: 0 }));
    const api = createMatchesApiMock({ listMatches });

    render(<MatchListPage api={api} onOpenMatch={vi.fn()} />);

    await waitFor(() =>
      expect(listMatches).toHaveBeenCalledWith({
        competitor: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        hasVideo: undefined,
        limit: 25,
        offset: 0,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }));

    await waitFor(() =>
      expect(listMatches).toHaveBeenLastCalledWith({
        competitor: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        hasVideo: undefined,
        limit: 25,
        offset: 25,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous Page' }));

    await waitFor(() =>
      expect(listMatches).toHaveBeenLastCalledWith({
        competitor: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        hasVideo: undefined,
        limit: 25,
        offset: 0,
      }),
    );

    fireEvent.change(screen.getByLabelText('Matches per page'), { target: { value: '10' } });

    await waitFor(() =>
      expect(listMatches).toHaveBeenLastCalledWith({
        competitor: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        hasVideo: undefined,
        limit: 10,
        offset: 0,
      }),
    );
  });
});
