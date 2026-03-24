import { useMemo } from 'react';

import { createHttpReportingApi, type ReportingApi } from './api/reportingApi';
import { AppShell } from './app/AppShell';
import { createHttpMatchesApi, MatchesApi } from './matches-api';

interface AppProps {
  matchesApi?: MatchesApi;
  reportingApi?: ReportingApi;
}

export function App({ matchesApi, reportingApi }: AppProps) {
  const api = useMemo(() => matchesApi ?? createHttpMatchesApi(), [matchesApi]);
  const reporting = useMemo(() => reportingApi ?? createHttpReportingApi(), [reportingApi]);

  return <AppShell api={api} reportingApi={reporting} />;
}
