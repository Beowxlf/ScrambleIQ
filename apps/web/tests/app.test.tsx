import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Match } from '@scrambleiq/shared';

import { App } from '../src/App';
import { MatchFormValues } from '../src/match';
import { MatchNotFoundError, MatchesApi } from '../src/matches-api';

function createMatchesApiMock(overrides: Partial<MatchesApi> = {}): MatchesApi {
  return {
    createMatch: async () => {
      throw new Error('createMatch was not mocked');
    },
    listMatches: async () => [],
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
    getMatchVideo: async () => {
      throw new Error('Match video not found');
    },
    updateMatchVideo: async () => {
      throw new Error('updateMatchVideo was not mocked');
    },
    deleteMatchVideo: async () => undefined,
    ...overrides,
  };
}

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders match creation form', async () => {
    const matchesApi = createMatchesApiMock();
    render(<App matchesApi={matchesApi} />);

    expect(screen.getByRole('heading', { name: 'ScrambleIQ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create Match' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Match' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Matches' })).toBeInTheDocument();
  });

  it('shows validation errors when required fields are missing', async () => {
    const matchesApi = createMatchesApiMock();
    render(<App matchesApi={matchesApi} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Match' }));

    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Date is required.')).toBeInTheDocument();
    expect(screen.getByText('Ruleset is required.')).toBeInTheDocument();
    expect(screen.getByText('Competitor A is required.')).toBeInTheDocument();
    expect(screen.getByText('Competitor B is required.')).toBeInTheDocument();

    expect(await screen.findByText('No matches yet.')).toBeInTheDocument();
  });

  it('submits a valid match and renders detail page', async () => {
    const createMatch = vi.fn(async (payload: MatchFormValues): Promise<Match> => ({
      id: 'match-1',
      ...payload,
      notes: payload.notes ?? '',
    }));

    const matchesApi = createMatchesApiMock({
      createMatch,
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'State Finals',
        date: '2026-03-01',
        ruleset: 'Folkstyle',
        competitorA: 'Alex Carter',
        competitorB: 'Sam Jordan',
        notes: '',
      }),
    });

    render(<App matchesApi={matchesApi} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'State Finals' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-01' } });
    fireEvent.change(screen.getByLabelText('Ruleset'), { target: { value: 'Folkstyle' } });
    fireEvent.change(screen.getByLabelText('Competitor A'), { target: { value: 'Alex Carter' } });
    fireEvent.change(screen.getByLabelText('Competitor B'), { target: { value: 'Sam Jordan' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Match' }));

    await waitFor(() => expect(createMatch).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('heading', { name: 'Match Detail' })).toBeInTheDocument();
    expect(screen.getByText('ID: match-1')).toBeInTheDocument();
  });

  it('shows an error message when submission fails', async () => {
    const matchesApi = createMatchesApiMock({
      createMatch: async () => {
        throw new Error('Server error');
      },
      listMatches: async () => [],
    });

    render(<App matchesApi={matchesApi} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'State Finals' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-01' } });
    fireEvent.change(screen.getByLabelText('Ruleset'), { target: { value: 'Folkstyle' } });
    fireEvent.change(screen.getByLabelText('Competitor A'), { target: { value: 'Alex Carter' } });
    fireEvent.change(screen.getByLabelText('Competitor B'), { target: { value: 'Sam Jordan' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Match' }));

    expect(await screen.findByText('Unable to create match. Please try again.')).toBeInTheDocument();
  });

  it('opens a match detail view from the list', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [
        {
          id: 'match-42',
          title: 'City Open',
          date: '2026-04-01',
          ruleset: 'No-Gi',
          competitorA: 'Pat Stone',
          competitorB: 'Riley Cruz',
          notes: 'Tight match',
        },
      ],
      getMatch: async (id: string) => ({
        id,
        title: 'City Open',
        date: '2026-04-01',
        ruleset: 'No-Gi',
        competitorA: 'Pat Stone',
        competitorB: 'Riley Cruz',
        notes: 'Tight match',
      }),
    });

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'View Match' }));

    const detailSection = await screen.findByRole('region', { name: 'Match Detail' });

    expect(await within(detailSection).findByText('ID: match-42')).toBeInTheDocument();
    expect(within(detailSection).getByText('Date: 2026-04-01')).toBeInTheDocument();
    expect(within(detailSection).getByText('Ruleset: No-Gi')).toBeInTheDocument();
    expect(within(detailSection).getByText('Competitor A: Pat Stone')).toBeInTheDocument();
    expect(within(detailSection).getByText('Competitor B: Riley Cruz')).toBeInTheDocument();
    expect(within(detailSection).getByText('Notes: Tight match')).toBeInTheDocument();
  });

  it('renders fetched match detail data when opening detail route directly', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: '',
      }),
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByRole('heading', { name: 'Open Finals' })).toBeInTheDocument();
    expect(screen.getByText('ID: match-1')).toBeInTheDocument();
    expect(screen.getByText('Notes: No notes provided.')).toBeInTheDocument();
  });

  it('shows not found state when detail fetch returns 404', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => {
        throw new MatchNotFoundError(id);
      },
    });

    window.history.replaceState({}, '', '/matches/missing-match');

    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByText('Match not found.')).toBeInTheDocument();
  });

  it('shows an error state when detail fetch fails', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async () => {
        throw new Error('Network failed');
      },
    });

    window.history.replaceState({}, '', '/matches/match-77');

    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByText('Unable to load match details right now.')).toBeInTheDocument();
  });

  it('enters edit mode from the match detail page', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: 'Original notes',
      }),
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit Match' }));

    expect(screen.getByRole('heading', { name: 'Edit Match' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('renders edit form with existing match values', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: 'Original notes',
      }),
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit Match' }));

    expect(screen.getByLabelText('Title')).toHaveValue('Open Finals');
    expect(screen.getByLabelText('Date')).toHaveValue('2026-03-10');
    expect(screen.getByLabelText('Ruleset')).toHaveValue('Freestyle');
    expect(screen.getByLabelText('Competitor A')).toHaveValue('Jordan Lee');
    expect(screen.getByLabelText('Competitor B')).toHaveValue('Chris Park');
    expect(screen.getByLabelText('Notes')).toHaveValue('Original notes');
  });

  it('updates a match successfully from edit mode', async () => {
    const updateMatch = vi.fn(async (id: string, payload: Partial<MatchFormValues>): Promise<Match> => ({
      id,
      title: payload.title ?? 'Open Finals',
      date: payload.date ?? '2026-03-10',
      ruleset: payload.ruleset ?? 'Freestyle',
      competitorA: payload.competitorA ?? 'Jordan Lee',
      competitorB: payload.competitorB ?? 'Chris Park',
      notes: payload.notes ?? '',
    }));

    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: 'Original notes',
      }),
      updateMatch,
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit Match' }));

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Finals' } });
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Updated notes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(updateMatch).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('heading', { name: 'Updated Finals' })).toBeInTheDocument();
    expect(screen.getByText('Notes: Updated notes')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/matches/match-1');
  });

  it('shows an error and preserves user input when update fails', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: 'Original notes',
      }),
      updateMatch: async () => {
        throw new Error('Server failure');
      },
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit Match' }));

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Unsaved Title' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText('Unable to update match. Please try again.')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Unsaved Title');
  });

  it('shows a delete action on the match detail page', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: 'Original notes',
      }),
      deleteMatch: async () => undefined,
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByRole('button', { name: 'Delete Match' })).toBeInTheDocument();
  });

  it('requires confirmation before deleting a match', async () => {
    const deleteMatch = vi.fn(async () => undefined);
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: 'Original notes',
      }),
      deleteMatch,
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete Match' }));

    expect(screen.getByText('Are you sure you want to delete this match?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm Delete' })).toBeInTheDocument();
    expect(deleteMatch).not.toHaveBeenCalled();
  });

  it('navigates back to / after successful delete', async () => {
    const deleteMatch = vi.fn(async () => undefined);
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: 'Original notes',
      }),
      deleteMatch,
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete Match' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }));

    await waitFor(() => expect(deleteMatch).toHaveBeenCalledWith('match-1'));
    expect(window.location.pathname).toBe('/');
  });

  it('shows an error and stays on detail page when delete fails', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: 'Original notes',
      }),
      deleteMatch: async () => {
        throw new Error('Server failure');
      },
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete Match' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }));

    expect(await screen.findByText('Unable to delete match. Please try again.')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/matches/match-1');
  });


  it('renders analytics section on match detail page', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: '',
      }),
    });

    window.history.replaceState({}, '', '/matches/match-1');

    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByRole('heading', { name: 'Analytics Summary' })).toBeInTheDocument();
  });

  it('shows analytics loading state', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: '',
      }),
      getMatchAnalytics: async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return createMatchesApiMock().getMatchAnalytics('match-1');
      },
    });

    window.history.replaceState({}, '', '/matches/match-1');
    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByText('Loading analytics summary...')).toBeInTheDocument();
  });

  it('shows analytics error state', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: '',
      }),
      getMatchAnalytics: async () => {
        throw new Error('analytics failed');
      },
    });

    window.history.replaceState({}, '', '/matches/match-1');
    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByText('Unable to load analytics summary right now.')).toBeInTheDocument();
  });

  it('renders analytics values from fetched data', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: '',
      }),
      getMatchAnalytics: async () => ({
        matchId: 'match-1',
        totalEventCount: 2,
        eventCountsByType: { guard_pass: 1, sweep: 1 },
        totalPositionCount: 2,
        timeInPositionByTypeSeconds: {
          standing: 0,
          closed_guard: 12,
          open_guard: 0,
          half_guard: 0,
          side_control: 8,
          mount: 0,
          back_control: 0,
          north_south: 0,
          leg_entanglement: 0,
          scramble: 0,
        },
        competitorTopTimeByPositionSeconds: {
          A: {
            standing: 0,
            closed_guard: 12,
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
            side_control: 8,
            mount: 0,
            back_control: 0,
            north_south: 0,
            leg_entanglement: 0,
            scramble: 0,
          },
        },
        totalTrackedPositionTimeSeconds: 20,
      }),
    });

    window.history.replaceState({}, '', '/matches/match-1');
    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByText('Total events: 2')).toBeInTheDocument();
    expect(screen.getByText('guard_pass: 1')).toBeInTheDocument();
    expect(screen.getByText('Total tracked position time (seconds): 20')).toBeInTheDocument();
    expect(screen.getAllByText('closed_guard: 12').length).toBeGreaterThan(0);
    expect(screen.getAllByText('side_control: 8').length).toBeGreaterThan(0);
  });

  it('shows analytics empty state when annotation data is minimal', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [],
      getMatch: async (id: string) => ({
        id,
        title: 'Open Finals',
        date: '2026-03-10',
        ruleset: 'Freestyle',
        competitorA: 'Jordan Lee',
        competitorB: 'Chris Park',
        notes: '',
      }),
    });

    window.history.replaceState({}, '', '/matches/match-1');
    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByText('Not enough annotation data yet. Add events or position states to generate analytics.')).toBeInTheDocument();
  });

});
