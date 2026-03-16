import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { App } from '../src/App';
import { Match, MatchFormValues } from '../src/match';
import { MatchesApi } from '../src/matches-api';

function createMatchesApiMock(overrides: Partial<MatchesApi> = {}): MatchesApi {
  return {
    createMatch: async () => {
      throw new Error('createMatch was not mocked');
    },
    listMatches: async () => [],
    ...overrides,
  };
}

describe('App', () => {
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

  it('submits a valid match and renders it in the list', async () => {
    const createMatch = vi.fn(async (payload: MatchFormValues): Promise<Match> => ({
      id: 'match-1',
      ...payload,
      notes: payload.notes ?? '',
    }));

    const matchesApi = createMatchesApiMock({
      createMatch,
      listMatches: async () => [],
    });

    render(<App matchesApi={matchesApi} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'State Finals' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-01' } });
    fireEvent.change(screen.getByLabelText('Ruleset'), { target: { value: 'Folkstyle' } });
    fireEvent.change(screen.getByLabelText('Competitor A'), { target: { value: 'Alex Carter' } });
    fireEvent.change(screen.getByLabelText('Competitor B'), { target: { value: 'Sam Jordan' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Match' }));

    await waitFor(() => expect(createMatch).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Match created successfully.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'State Finals' })).toBeInTheDocument();
    expect(screen.getByText('Date: 2026-03-01')).toBeInTheDocument();
    expect(screen.getByText('Ruleset: Folkstyle')).toBeInTheDocument();
    expect(screen.getByText('Competitor A: Alex Carter')).toBeInTheDocument();
    expect(screen.getByText('Competitor B: Sam Jordan')).toBeInTheDocument();
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

  it('renders matches returned by the API', async () => {
    const matchesApi = createMatchesApiMock({
      listMatches: async () => [
        {
          id: 'match-1',
          title: 'Open Finals',
          date: '2026-03-10',
          ruleset: 'Freestyle',
          competitorA: 'Jordan Lee',
          competitorB: 'Chris Park',
          notes: '',
        },
      ],
    });

    render(<App matchesApi={matchesApi} />);

    expect(await screen.findByRole('heading', { name: 'Open Finals' })).toBeInTheDocument();
    expect(screen.getByText('Date: 2026-03-10')).toBeInTheDocument();
    expect(screen.getByText('Ruleset: Freestyle')).toBeInTheDocument();
    expect(screen.getByText('Competitor A: Jordan Lee')).toBeInTheDocument();
    expect(screen.getByText('Competitor B: Chris Park')).toBeInTheDocument();
  });
});
