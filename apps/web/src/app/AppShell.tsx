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

  const isDetailPage = route.page === 'detail';

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <h1>ScrambleIQ</h1>
        <p className="muted">Coach workspace for discovery, setup, and review.</p>
        <nav aria-label="Primary navigation">
          <ol className="app-shell__nav">
            <li className={!isDetailPage ? 'app-shell__nav-current' : undefined}>Match List</li>
            <li aria-hidden="true">/</li>
            <li className={isDetailPage ? 'app-shell__nav-current' : undefined}>Match Detail</li>
          </ol>
        </nav>
      </header>

      {isDetailPage ? (
        <MatchDetailPage api={api} matchId={route.matchId} />
      ) : (
        <MatchListPage api={api} onOpenMatch={(matchId) => navigateTo(`/matches/${matchId}`)} />
      )}
    </div>
  );
}
