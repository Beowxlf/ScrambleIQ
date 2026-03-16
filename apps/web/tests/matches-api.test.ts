import { describe, expect, it, vi } from 'vitest';

import { createHttpMatchesApi } from '../src/matches-api';

describe('createHttpMatchesApi path parameter encoding', () => {
  it('encodes match id path params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ id: 'ok' }), { status: 200 }));
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.getMatch('id/with?reserved#chars');

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/matches/id%2Fwith%3Freserved%23chars');
  });

  it('encodes nested resource path params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 }));
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.listTimelineEvents('match/123');

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/matches/match%2F123/events');
  });

  it('encodes analytics path params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ matchId: 'ok' }), { status: 200 }));
    const api = createHttpMatchesApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.getMatchAnalytics('match/with spaces');

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/matches/match%2Fwith%20spaces/analytics');
  });

});
