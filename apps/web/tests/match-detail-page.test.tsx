/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MatchDetailPage } from '../src/pages/MatchDetailPage';
import type { MatchesApi } from '../src/matches-api';

function createMatchesApiMock(overrides: Partial<MatchesApi> = {}): MatchesApi {
  return {
    createMatch: async () => {
      throw new Error('createMatch was not mocked');
    },
    listMatches: async () => ({ matches: [], total: 0, limit: 50, offset: 0 }),
    getMatch: async (id: string) => ({
      id,
      title: 'State Finals',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: '',
    }),
    updateMatch: async () => {
      throw new Error('updateMatch was not mocked');
    },
    deleteMatch: async () => undefined,
    createTimelineEvent: async () => {
      throw new Error('createTimelineEvent was not mocked');
    },
    listTimelineEvents: async () => [],
    updateTimelineEvent: async () => {
      throw new Error('updateTimelineEvent was not mocked');
    },
    deleteTimelineEvent: async () => undefined,
    createPositionState: async () => {
      throw new Error('createPositionState was not mocked');
    },
    listPositionStates: async () => [],
    updatePositionState: async () => {
      throw new Error('updatePositionState was not mocked');
    },
    deletePositionState: async () => undefined,
    createMatchVideo: async () => {
      throw new Error('createMatchVideo was not mocked');
    },
    getMatchVideo: async () => {
      throw new Error('Match video not found');
    },
    updateMatchVideo: async () => {
      throw new Error('updateMatchVideo was not mocked');
    },
    deleteMatchVideo: async () => undefined,
    getMatchAnalytics: async (matchId: string) => ({
      matchId,
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
        A: {
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
        B: {
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
      },
      totalTrackedPositionTimeSeconds: 0,
    }),
    exportMatchDataset: async () => {
      throw new Error('exportMatchDataset was not mocked');
    },
    validateMatchDataset: async (matchId: string) => ({
      matchId,
      isValid: true,
      issueCount: 0,
      issues: [],
    }),
    ...overrides,
  };
}

describe('MatchDetailPage', () => {
  afterEach(() => {
    cleanup();
  });
  beforeEach(() => {
    window.history.replaceState({}, '', '/matches/match-1');
  });

  it('renders loaded match metadata and keeps back navigation behavior', async () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const matchesApi = createMatchesApiMock();

    render(<MatchDetailPage api={matchesApi} matchId="match-1" />);

    expect(await screen.findByRole('heading', { name: 'Match Detail' })).toBeInTheDocument();
    expect(screen.getByText('ID: match-1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to matches' }));

    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/');
    expect(window.location.pathname).toBe('/');

    pushStateSpy.mockRestore();
  });

  it('renders review workspace groupings to separate context, timelines, and dataset tools', async () => {
    const matchesApi = createMatchesApiMock();

    render(<MatchDetailPage api={matchesApi} matchId="match-1" />);

    expect(await screen.findByRole('heading', { name: 'Review Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Review Context' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Timeline Review' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Data Quality Tools' })).toBeInTheDocument();
  });

  it('refreshes analytics after event and position create, edit, and delete mutations', async () => {
    const getMatchAnalytics = vi.fn(async (matchId: string) => ({
      matchId,
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
        A: {
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
        B: {
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
      },
      totalTrackedPositionTimeSeconds: 0,
    }));

    const api = createMatchesApiMock({
      getMatchAnalytics,
      listTimelineEvents: vi.fn(async () => [{ id: 'event-1', matchId: 'match-1', timestamp: 8, eventType: 'entry', competitor: 'A' as const }]),
      createTimelineEvent: vi.fn(async () => ({ id: 'event-2', matchId: 'match-1', timestamp: 10, eventType: 'entry', competitor: 'A' as const })),
      updateTimelineEvent: vi.fn(async () => ({ id: 'event-1', matchId: 'match-1', timestamp: 8, eventType: 'sweep', competitor: 'A' as const })),
      deleteTimelineEvent: vi.fn(async () => undefined),
      listPositionStates: vi.fn(async () => [{
        id: 'position-1',
        matchId: 'match-1',
        position: 'standing' as const,
        competitorTop: 'A' as const,
        timestampStart: 4,
        timestampEnd: 8,
      }]),
      createPositionState: vi.fn(async () => ({
        id: 'position-2',
        matchId: 'match-1',
        position: 'closed_guard' as const,
        competitorTop: 'A' as const,
        timestampStart: 12,
        timestampEnd: 22,
      })),
      updatePositionState: vi.fn(async () => ({
        id: 'position-1',
        matchId: 'match-1',
        position: 'mount' as const,
        competitorTop: 'A' as const,
        timestampStart: 4,
        timestampEnd: 10,
      })),
      deletePositionState: vi.fn(async () => undefined),
    });

    render(<MatchDetailPage api={api} matchId="match-1" />);

    await screen.findByRole('heading', { name: 'Analytics Summary' });
    await waitFor(() => expect(getMatchAnalytics).toHaveBeenCalledTimes(1));

    fireEvent.click(await screen.findByRole('button', { name: 'Add Event' }));
    fireEvent.change(screen.getByLabelText('Timestamp (seconds)'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: 'entry' } });
    fireEvent.change(screen.getByLabelText('Competitor'), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }));

    await waitFor(() => expect(getMatchAnalytics).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('button', { name: '00:10 entry A' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Event' })[0]);
    fireEvent.change(screen.getByLabelText('Event Type'), { target: { value: 'sweep' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Event' }));

    await waitFor(() => expect(getMatchAnalytics).toHaveBeenCalledTimes(3));
    expect(await screen.findByRole('button', { name: '00:08 sweep A' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Event' })[0]);
    await waitFor(() => expect(getMatchAnalytics).toHaveBeenCalledTimes(4));

    fireEvent.click(await screen.findByRole('button', { name: 'Add Position' }));
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'closed_guard' } });
    fireEvent.change(screen.getByLabelText('Top Competitor'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Start Timestamp (seconds)'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('End Timestamp (seconds)'), { target: { value: '22' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Position' }));

    await waitFor(() => expect(getMatchAnalytics).toHaveBeenCalledTimes(5));
    expect(await screen.findByRole('button', { name: '00:12 - 00:22 closed_guard top: A' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit Position' })[0]);
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'mount' } });
    fireEvent.change(screen.getByLabelText('End Timestamp (seconds)'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Position' }));

    await waitFor(() => expect(getMatchAnalytics).toHaveBeenCalledTimes(6));
    expect(await screen.findByRole('button', { name: '00:04 - 00:10 mount top: A' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Position' })[0]);
    await waitFor(() => expect(getMatchAnalytics).toHaveBeenCalledTimes(7));
  });

  it('keeps dataset tooling available within match detail orchestration', async () => {
    const validateMatchDataset = vi.fn(async (matchId: string) => ({
      matchId,
      isValid: true,
      issueCount: 0,
      issues: [],
    }));

    const api = createMatchesApiMock({ validateMatchDataset });

    render(<MatchDetailPage api={api} matchId="match-1" />);

    expect(await screen.findByRole('button', { name: 'Export Dataset' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Validate Dataset' }));

    expect(await screen.findByText('Validation status:')).toBeInTheDocument();
    expect(screen.getByText('No issues found. Dataset is ready for export.')).toBeInTheDocument();
  });

});
