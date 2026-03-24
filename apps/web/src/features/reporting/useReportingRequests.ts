import { useState } from 'react';

import type {
  CollectionExportPayload,
  CollectionReviewSummary,
  CollectionValidationReport,
  CompetitorTrendSummary,
} from '@scrambleiq/shared';

import type { CollectionExportInput, ReportFiltersInput, ReportingApi } from '../../api/reportingApi';

interface RequestState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

function useRequestState<T>() {
  return useState<RequestState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });
}

export function useCollectionSummaryRequest(api: ReportingApi) {
  const [state, setState] = useRequestState<CollectionReviewSummary>();

  const run = async (filters: ReportFiltersInput) => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const data = await api.getCollectionSummary(filters);
      setState({ data, error: null, isLoading: false });
    } catch {
      setState({ data: null, error: 'Unable to load collection summary right now.', isLoading: false });
    }
  };

  return { ...state, run };
}

export function useCompetitorTrendsRequest(api: ReportingApi) {
  const [state, setState] = useRequestState<CompetitorTrendSummary>();

  const run = async (params: { competitorId: string; dateFrom: string; dateTo: string }) => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const data = await api.getCompetitorTrends(params);
      setState({ data, error: null, isLoading: false });
    } catch {
      setState({ data: null, error: 'Unable to load competitor trends right now.', isLoading: false });
    }
  };

  return { ...state, run };
}

export function useCollectionValidationRequest(api: ReportingApi) {
  const [state, setState] = useRequestState<CollectionValidationReport>();

  const run = async (filters: ReportFiltersInput) => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const data = await api.getCollectionValidation(filters);
      setState({ data, error: null, isLoading: false });
    } catch {
      setState({ data: null, error: 'Unable to load collection validation right now.', isLoading: false });
    }
  };

  return { ...state, run };
}

export function useCollectionExportRequest(api: ReportingApi) {
  const [state, setState] = useRequestState<CollectionExportPayload>();

  const run = async (filters: CollectionExportInput) => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const data = await api.getCollectionExport(filters);
      setState({ data, error: null, isLoading: false });
    } catch {
      setState({ data: null, error: 'Unable to load collection export right now.', isLoading: false });
    }
  };

  return { ...state, run };
}
