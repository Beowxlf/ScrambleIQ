import type {
  CollectionExportPayload,
  CollectionReviewSummary,
  CollectionValidationReport,
  CompetitorTrendSummary,
  ReportArtifactType,
} from '@scrambleiq/shared';

import { HttpRequestError } from '../matches-api';

export interface ReportFiltersInput {
  dateFrom: string;
  dateTo: string;
  competitor?: string;
  ruleset?: string;
}

export interface CollectionExportInput extends ReportFiltersInput {
  artifactType?: ReportArtifactType;
}

export interface ReportingApi {
  getCollectionSummary(filters: ReportFiltersInput): Promise<CollectionReviewSummary>;
  getCompetitorTrends(params: { competitorId: string; dateFrom: string; dateTo: string }): Promise<CompetitorTrendSummary>;
  getCollectionValidation(filters: ReportFiltersInput): Promise<CollectionValidationReport>;
  getCollectionExport(filters: CollectionExportInput): Promise<CollectionExportPayload>;
}

interface HttpReportingApiOptions {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
}

function resolveApiBaseUrl(override?: string): string {
  if (override) {
    return override;
  }

  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
}

function resolveApiAuthToken(override?: string): string {
  if (override) {
    return override;
  }

  return import.meta.env.VITE_API_AUTH_TOKEN ?? 'scrambleiq-local-dev-token';
}

async function parseErrorDetails(response: Response): Promise<string[]> {
  try {
    const payload = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(payload.message)) {
      return payload.message.filter((message): message is string => typeof message === 'string');
    }

    if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
      return [payload.message];
    }

    return [];
  } catch {
    return [];
  }
}

function buildReportQuery(filters: ReportFiltersInput): string {
  const searchParams = new URLSearchParams();
  searchParams.set('dateFrom', filters.dateFrom);
  searchParams.set('dateTo', filters.dateTo);

  if (filters.competitor) {
    searchParams.set('competitor', filters.competitor);
  }

  if (filters.ruleset) {
    searchParams.set('ruleset', filters.ruleset);
  }

  return searchParams.toString();
}

async function ensureOk(response: Response, defaultMessage: string): Promise<void> {
  if (response.ok) {
    return;
  }

  const details = await parseErrorDetails(response);
  const message = details.length > 0 ? `${defaultMessage} ${details.join(' ')}` : defaultMessage;
  throw new HttpRequestError(message, response.status, details);
}

export function createHttpReportingApi(options: HttpReportingApiOptions = {}): ReportingApi {
  const baseUrl = resolveApiBaseUrl(options.baseUrl);
  const authToken = resolveApiAuthToken(options.authToken);
  const fetchImpl = options.fetchImpl ?? fetch;

  const authedFetch = (url: string): Promise<Response> => fetchImpl(url, {
    headers: {
      'x-api-key': authToken,
    },
  });

  return {
    async getCollectionSummary(filters) {
      const query = buildReportQuery(filters);
      const response = await authedFetch(`${baseUrl}/reports/collection/summary?${query}`);
      await ensureOk(response, 'Failed to load collection summary.');
      return (await response.json()) as CollectionReviewSummary;
    },

    async getCompetitorTrends(params) {
      const searchParams = new URLSearchParams();
      searchParams.set('dateFrom', params.dateFrom);
      searchParams.set('dateTo', params.dateTo);

      const response = await authedFetch(
        `${baseUrl}/reports/competitors/${encodeURIComponent(params.competitorId)}/trends?${searchParams.toString()}`,
      );
      await ensureOk(response, 'Failed to load competitor trends.');
      return (await response.json()) as CompetitorTrendSummary;
    },

    async getCollectionValidation(filters) {
      const query = buildReportQuery(filters);
      const response = await authedFetch(`${baseUrl}/reports/collection/validation?${query}`);
      await ensureOk(response, 'Failed to load collection validation report.');
      return (await response.json()) as CollectionValidationReport;
    },

    async getCollectionExport(filters) {
      const queryParams = new URLSearchParams(buildReportQuery(filters));

      if (filters.artifactType) {
        queryParams.set('artifactType', filters.artifactType);
      }

      const response = await authedFetch(`${baseUrl}/reports/collection/export?${queryParams.toString()}`);
      await ensureOk(response, 'Failed to load collection export payload.');
      return (await response.json()) as CollectionExportPayload;
    },
  };
}
