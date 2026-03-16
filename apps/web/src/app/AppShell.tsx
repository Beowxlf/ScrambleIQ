import { useEffect, useState } from 'react';

import type { MatchesApi } from '../matches-api';
import { MatchDetailPage } from '../pages/MatchDetailPage';
import { MatchListPage } from '../pages/MatchListPage';
import { navigateTo, parseRoute } from './router';

interface AppShellProps {
  api: MatchesApi;
}

export function AppShell({ api }: AppShellProps) {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  if (route.page === 'detail') {
    return <MatchDetailPage api={api} matchId={route.matchId} />;
  }

  return <MatchListPage api={api} onOpenMatch={(matchId) => navigateTo(`/matches/${matchId}`)} />;
}
