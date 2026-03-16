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
});
