import { describe, expect, it, vi } from 'vitest';

import { createHttpReportingApi } from '../src/api/reportingApi';

describe('createHttpReportingApi', () => {
  it('encodes collection summary query params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ isEmpty: true }), { status: 200 }));
    const api = createHttpReportingApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.getCollectionSummary({
      dateFrom: '2026-03-01',
      dateTo: '2026-03-31',
      competitor: 'Alex Carter',
      ruleset: 'folkstyle',
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:3000/reports/collection/summary?dateFrom=2026-03-01&dateTo=2026-03-31&competitor=Alex+Carter&ruleset=folkstyle',
      expect.objectContaining({ headers: { 'x-api-key': 'scrambleiq-local-dev-token' } }),
    );
  });

  it('encodes competitor trend path params', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ windows: [] }), { status: 200 }));
    const api = createHttpReportingApi({ baseUrl: 'http://localhost:3000', fetchImpl });

    await api.getCompetitorTrends({
      competitorId: 'id/with spaces',
      dateFrom: '2026-03-01',
      dateTo: '2026-03-31',
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:3000/reports/competitors/id%2Fwith%20spaces/trends?dateFrom=2026-03-01&dateTo=2026-03-31',
      expect.objectContaining({ headers: { 'x-api-key': 'scrambleiq-local-dev-token' } }),
    );
  });
});
