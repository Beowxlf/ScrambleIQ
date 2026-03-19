import { describe, expect, it, vi } from 'vitest';

import { createHttpMatchesApi, HttpRequestError } from '../src/matches-api';

describe('createHttpMatchesApi path parameter encoding', () => {

  it('encodes list query params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ matches: [], total: 0, limit: 10, offset: 20 }), { status: 200 }));
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.listMatches({ competitor: 'Alex Carter', dateFrom: '2026-01-01', dateTo: '2026-01-31', hasVideo: true, limit: 10, offset: 20 });

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/matches?competitor=Alex+Carter&dateFrom=2026-01-01&dateTo=2026-01-31&hasVideo=true&limit=10&offset=20', expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'scrambleiq-local-dev-token' }) }));
  });

  it('encodes match id path params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ id: 'ok' }), { status: 200 }));
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.getMatch('id/with?reserved#chars');

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/matches/id%2Fwith%3Freserved%23chars', expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'scrambleiq-local-dev-token' }) }));
  });

  it('encodes nested resource path params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 }));
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.listTimelineEvents('match/123');

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/matches/match%2F123/events', expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'scrambleiq-local-dev-token' }) }));
  });

  it('encodes analytics path params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ matchId: 'ok' }), { status: 200 }));
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.getMatchAnalytics('match/with spaces');

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/matches/match%2Fwith%20spaces/analytics', expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'scrambleiq-local-dev-token' }) }));
  });

  it('encodes export path params', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ match: {}, video: null, events: [], positions: [], analytics: {} }), { status: 200 }),
    );
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.exportMatchDataset('match/with spaces');

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/matches/match%2Fwith%20spaces/export', expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'scrambleiq-local-dev-token' }) }));
  });

  it('encodes validation path params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ matchId: 'ok', isValid: true, issueCount: 0, issues: [] }), { status: 200 }));
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.validateMatchDataset('match/with spaces');

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/matches/match%2Fwith%20spaces/validate', expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'scrambleiq-local-dev-token' }) }));
  });

  it('surfaces backend validation messages for failed mutations', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ message: ['title should not be empty'] }), { status: 400 }));
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await expect(
      api.createMatch({
        title: '',
        date: '2026-03-01',
        ruleset: 'folkstyle',
        competitorA: 'A',
        competitorB: 'B',
        notes: '',
      }),
    ).rejects.toEqual(expect.objectContaining<HttpRequestError>({
      name: 'HttpRequestError',
      status: 400,
      details: ['title should not be empty'],
      message: 'Failed to create match. title should not be empty',
    }));
  });

});
