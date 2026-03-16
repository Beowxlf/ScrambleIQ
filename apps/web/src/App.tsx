import { useMemo } from 'react';

import { createHttpMatchesApi, MatchesApi } from './matches-api';
import { AppShell } from './app/AppShell';

interface AppProps {
  matchesApi?: MatchesApi;
}

export function App({ matchesApi }: AppProps) {
  const api = useMemo(() => matchesApi ?? createHttpMatchesApi(), [matchesApi]);

  return <AppShell api={api} />;
}
